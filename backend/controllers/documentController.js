const path = require('path')
const fs = require('fs')
const multer = require('multer')
const Document = require('../models/Document')
const ClientMatter = require('../models/ClientMatter')
const Firm = require('../models/Firm')
const documentProcessingService = require('../services/documentProcessingService')
const { ErrorResponse } = require('../middleware/errorHandler')
const JSZip = require('jszip')

const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const sanitized = file.originalname.replace(/\s+/g, '_')
    cb(null, `${timestamp}-${sanitized}`)
  },
})

function fileFilter(req, file, cb) {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ErrorResponse('Only PDF, DOCX, and TXT files are allowed', 400))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

function validateFirmStorage(firm, fileSize) {
  if (!firm.usageMetrics) return
  const storageUsed = firm.usageMetrics.storageUsed || 0
  const storageLimit = firm.settings?.storageLimit || 10 * 1024 * 1024 * 1024

  if (storageUsed + fileSize > storageLimit) {
    throw new ErrorResponse('Storage limit exceeded. Please upgrade your plan or delete old files.', 403)
  }
}

const DOCUMENT_TYPES = [
  'contract',
  'case-law',
  'evidence',
  'correspondence',
  'petition',
  'judgment',
  'agreement',
  'notice',
  'other',
]

function serializeDocument(document) {
  if (!document) return null
  const plain = document.toObject({ virtuals: true })
  delete plain.extractedText

  plain.id = plain._id
  delete plain._id
  delete plain.__v

  const extension = plain.fileType || plain.originalName?.split('.').pop()

  return {
    ...plain,
    fileType: plain.fileType || extension,
    documentType: DOCUMENT_TYPES.includes(plain.documentType)
      ? plain.documentType
      : 'other',
  }
}

exports.uploadDocument = async (req, res, next) => {
  try {
    const file = req.file
    const { matterId, documentType, tags } = req.body
    const { id: userId, firmId } = req.user

    if (!file) {
      return next(new ErrorResponse('No file uploaded', 400))
    }

    console.info('[Documents] Upload attempt', {
      userId,
      firmId,
      matterId,
      documentType,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    })

    const firm = await Firm.findById(firmId)
    if (!firm) {
      return next(new ErrorResponse('Firm not found', 404))
    }

    validateFirmStorage(firm, file.size)

    let matter
    if (matterId) {
      matter = await ClientMatter.findById(matterId)
      if (!matter || matter.firmId.toString() !== firmId.toString()) {
        return next(new ErrorResponse('Matter not found or access denied', 404))
      }
    }

    if (documentType && !DOCUMENT_TYPES.includes(documentType)) {
      return next(new ErrorResponse('Invalid document type', 400))
    }

    const documentRecord = await documentProcessingService.processDocument(
      file,
      userId,
      firmId,
      matter?._id,
    )

    if (!firm.usageMetrics) {
      firm.usageMetrics = {}
    }
    firm.usageMetrics.storageUsed = (firm.usageMetrics.storageUsed || 0) + (documentRecord.fileSize || file.size)
    await firm.save({ validateBeforeSave: false })

    if (documentType) {
      documentRecord.documentType = documentType
    }

    if (tags) {
      const normalized = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
      documentRecord.tags = normalized
    }

    await documentRecord.save()

    console.info('[Documents] Upload success', {
      documentId: documentRecord.id,
      firmId,
      uploadedBy: userId,
    })

    return res.status(201).json({ success: true, document: serializeDocument(documentRecord) })
  } catch (error) {
    console.error('[Documents] Upload error', error)
    return next(error)
  }
}

exports.getDocuments = async (req, res, next) => {
  try {
    const firmId = req.user.firmId
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const filter = {
      firmId,
      isDeleted: { $ne: true },
    }

    if (req.query.matterId) filter.matterId = req.query.matterId
    if (req.query.documentType) {
      const types = req.query.documentType.split(',').filter((type) => DOCUMENT_TYPES.includes(type))
      if (types.length > 0) {
        filter.documentType = { $in: types }
      }
    }
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('matterId', 'matterNumber matterTitle')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: documents.map(serializeDocument),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    return next(error)
  }
}

exports.getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const doc = await Document.findById(documentId)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('matterId', 'matterNumber matterTitle')

    if (!doc || doc.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    return res.status(200).json({ success: true, document: serializeDocument(doc) })
  } catch (error) {
    return next(error)
  }
}

exports.analyzeDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const doc = await Document.findById(documentId)

    if (!doc || doc.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    // If already analyzed, return cached analysis
    if (doc.status === 'analyzed') {
      return res.status(200).json({ success: true, analysis: doc.analysis })
    }

    // Ensure processing state and proceed (idempotent trigger)
    if (doc.status !== 'processing') {
      doc.status = 'processing'
      await doc.save()
    }

    try {
      const analysis = await documentProcessingService.analyzeDocumentWithAI(documentId)
      doc.status = 'analyzed'
      doc.analysis = analysis || {}
      // ensure timestamps and minimal keys
      if (!doc.analysis.summary && typeof analysis === 'string') {
        doc.analysis = { summary: analysis }
      }
      if (!doc.analysis.analyzedAt) doc.analysis.analyzedAt = new Date()
      await doc.save()

      return res.status(200).json({ success: true, analysis: doc.analysis })
    } catch (error) {
      // Reset status to allow retry
      doc.status = 'uploaded'
      await doc.save({ validateBeforeSave: false })

      if (error.message === 'AI service not configured') {
        return next(new ErrorResponse('AI service not configured. Add GEMINI_API_KEY to enable analysis.', 503))
      }

      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

exports.updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const updates = {}
    const allowed = ['documentType', 'tags', 'metadata', 'analysis', 'status']

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const doc = await Document.findById(documentId)
    if (!doc || doc.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    Object.assign(doc, updates)
    await doc.save()

    return res.status(200).json({ success: true, document: serializeDocument(doc) })
  } catch (error) {
    return next(error)
  }
}

exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const doc = await Document.findById(documentId)
    if (!doc || doc.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    const isOwner = doc.uploadedBy.toString() === req.user.id.toString()
    const isAdmin = req.user.role === 'admin'
    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized to delete this document', 403))
    }

    doc.isDeleted = true
    doc.deletedAt = new Date()
    await doc.save()

    const firm = await Firm.findById(req.user.firmId)
    if (firm && firm.usageMetrics) {
      firm.usageMetrics.storageUsed = Math.max(
        (firm.usageMetrics.storageUsed || 0) - (doc.fileSize || 0),
        0,
      )
      await firm.save({ validateBeforeSave: false })
    }

    const rel = doc.fileUrl && doc.fileUrl.startsWith('/') ? doc.fileUrl.slice(1) : doc.fileUrl
    const absolutePath = rel ? path.join(__dirname, '..', rel) : null
    if (absolutePath && fs.existsSync(absolutePath)) {
      try { fs.unlinkSync(absolutePath) } catch (_) {}
    }

    return res.status(200).json({ success: true, message: 'Document deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

exports.downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const doc = await Document.findById(documentId)
    if (!doc || doc.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    const rel = doc.fileUrl && doc.fileUrl.startsWith('/') ? doc.fileUrl.slice(1) : doc.fileUrl
    const filePath = rel ? path.join(__dirname, '..', rel) : null
    if (!filePath || !fs.existsSync(filePath)) {
      return next(new ErrorResponse('File not found on server', 404))
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName || doc.fileName}"`)
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream')
    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    return next(error)
  }
}

exports.searchDocuments = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.query
    if (!q) {
      return next(new ErrorResponse('Search query is required', 400))
    }

    const firmId = req.user.firmId
    const results = await Document.find({
      firmId,
      isDeleted: { $ne: true },
      $text: { $search: q },
    })
      .select('fileName originalName documentType createdAt fileType fileSize status')
      .limit(50)

    return res.status(200).json({ success: true, results: results.map(serializeDocument) })
  } catch (error) {
    return next(error)
  }
}

exports.uploadMiddleware = upload

// Bulk: download multiple documents as ZIP
exports.bulkDownload = async (req, res, next) => {
  try {
    const { ids = [] } = req.body || {}
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorResponse('No document ids provided', 400))
    }

    const firmId = req.user.firmId
    const docs = await Document.find({ _id: { $in: ids }, firmId, isDeleted: { $ne: true } })

    if (!docs.length) {
      return next(new ErrorResponse('No documents found', 404))
    }

    const zip = new JSZip()
    for (const doc of docs) {
      const rel = doc.fileUrl && doc.fileUrl.startsWith('/') ? doc.fileUrl.slice(1) : doc.fileUrl
      const filePath = rel ? path.join(__dirname, '..', rel) : null
      if (filePath && fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath)
        const filename = doc.originalName || doc.fileName || `${doc.id}.${doc.fileType || 'bin'}`
        zip.file(filename, content)
      }
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' })
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="yourcase-documents-${Date.now()}.zip"`)
    return res.status(200).send(buffer)
  } catch (error) {
    return next(error)
  }
}

// Bulk: update tags for multiple documents
exports.bulkUpdateTags = async (req, res, next) => {
  try {
    const { ids = [], tags = [] } = req.body || {}
    if (!Array.isArray(ids) || !ids.length) {
      return next(new ErrorResponse('No documents selected', 400))
    }
    const cleanTags = Array.isArray(tags) ? tags.filter(Boolean) : []
    const firmId = req.user.firmId

    const result = await Document.updateMany(
      { _id: { $in: ids }, firmId, isDeleted: { $ne: true } },
      { $addToSet: { tags: { $each: cleanTags } } },
    )

    return res.status(200).json({ success: true, updated: result.modifiedCount || result.nModified || 0 })
  } catch (error) {
    return next(error)
  }
}

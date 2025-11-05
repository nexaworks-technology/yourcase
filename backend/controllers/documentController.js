const path = require('path')
const fs = require('fs')
const multer = require('multer')
const Document = require('../models/Document')
const ClientMatter = require('../models/ClientMatter')
const Firm = require('../models/Firm')
const documentProcessingService = require('../services/documentProcessingService')
const { ErrorResponse } = require('../middleware/errorHandler')

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
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
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

exports.uploadDocument = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const file = req.file
      const { matterId, documentType, tags } = req.body
      const { id: userId, firmId } = req.user

      if (!file) {
        return next(new ErrorResponse('No file uploaded', 400))
      }

      const firm = await Firm.findById(firmId)
      if (!firm) {
        return next(new ErrorResponse('Firm not found', 404))
      }

      validateFirmStorage(firm, file.size)

      if (matterId) {
        const matter = await ClientMatter.findById(matterId)
        if (!matter || matter.firmId.toString() !== firmId.toString()) {
          return next(new ErrorResponse('Matter not found or access denied', 404))
        }
      }

      const doc = await documentProcessingService.processDocument(file, userId, firmId, matterId)

      if (!firm.usageMetrics) {
        firm.usageMetrics = {}
      }
      firm.usageMetrics.storageUsed = (firm.usageMetrics.storageUsed || 0) + (doc.fileSize || file.size)
      await firm.save({ validateBeforeSave: false })

      if (documentType) {
        doc.documentType = documentType
      }
      if (tags) {
        doc.tags = Array.isArray(tags) ? tags : [tags]
      }
      await doc.save()

      return res.status(201).json({ success: true, document: doc })
    } catch (error) {
      return next(error)
    }
  },
]

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
    if (req.query.documentType) filter.documentType = req.query.documentType
    if (req.query.status) filter.status = req.query.status

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
      data: documents,
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

    return res.status(200).json({ success: true, document: doc })
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

    if (doc.status === 'analyzed') {
      return res.status(200).json({ success: true, analysis: doc.analysis })
    }

    doc.status = 'processing'
    await doc.save()

    const analysis = await documentProcessingService.analyzeDocumentWithAI(documentId)

    doc.status = 'analyzed'
    doc.analysis = analysis
    await doc.save()

    return res.status(200).json({ success: true, analysis })
  } catch (error) {
    return next(error)
  }
}

exports.updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const updates = {}
    const allowed = ['documentType', 'tags', 'metadata']

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

    return res.status(200).json({ success: true, document: doc })
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

    const absolutePath = path.join(__dirname, '..', doc.fileUrl)
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
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

    const filePath = path.join(__dirname, '..', doc.fileUrl)

    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('File not found on server', 404))
    }

    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName || doc.fileName}"`)
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream')

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  } catch (error) {
    return next(error)
  }
}

exports.searchDocuments = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q) {
      return next(new ErrorResponse('Search query is required', 400))
    }

    const firmId = req.user.firmId
    const results = await Document.find({
      firmId,
      isDeleted: { $ne: true },
      $text: { $search: q },
    }).select('fileName originalName documentType createdAt')

    return res.status(200).json({ success: true, results })
  } catch (error) {
    return next(error)
  }
}

exports.uploadMiddleware = upload

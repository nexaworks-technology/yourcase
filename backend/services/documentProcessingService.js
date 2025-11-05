const fs = require('fs')
const path = require('path')
const Document = require('../models/Document')
const GeminiService = require('./geminiService')

class DocumentProcessingService {
  constructor() {
    this.allowedMimeTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
    }
  }

  validateFileSize(fileSize, maxSize = 10 * 1024 * 1024) {
    return fileSize <= maxSize
  }

  validateFileType(mimetype, allowedTypes = Object.values(this.allowedMimeTypes)) {
    return allowedTypes.includes(mimetype)
  }

  async processDocument(file, userId, firmId, matterId) {
    if (!file) throw new Error('No file provided')

    const { originalname, mimetype, size, path: tempPath } = file

    if (!this.validateFileType(mimetype)) {
      throw new Error('Unsupported file type')
    }

    if (!this.validateFileSize(size)) {
      throw new Error('File too large')
    }

    const extension = path.extname(originalname)
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${extension}`
    const uploadsDir = path.join(__dirname, '..', 'uploads')

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir)
    }

    const filePath = path.join(uploadsDir, uniqueName)
    fs.renameSync(tempPath, filePath)

    const doc = await Document.create({
      firmId,
      matterId,
      uploadedBy: userId,
      fileName: uniqueName,
      originalName: originalname,
      fileType: extension.replace('.', ''),
      mimeType: mimetype,
      fileSize: size,
      fileUrl: `/uploads/${uniqueName}`,
      status: 'uploaded',
    })

    let extractedText = ''

    if (mimetype === this.allowedMimeTypes.pdf) {
      extractedText = await this.extractTextFromPDF(filePath)
    } else if (mimetype === this.allowedMimeTypes.docx) {
      extractedText = await this.extractTextFromDocx(filePath)
    } else if (mimetype === this.allowedMimeTypes.txt) {
      extractedText = await this.extractTextFromTxt(filePath)
    }

    doc.extractedText = extractedText
    doc.status = extractedText ? 'processing' : 'uploaded'
    await doc.save()

    return doc
  }

  async extractTextFromPDF(filePath) {
    // TODO: Install pdf-parse: npm install pdf-parse
    return 'PDF text extraction - implement with pdf-parse library'
  }

  async extractTextFromDocx(filePath) {
    // TODO: Install mammoth: npm install mammoth
    return 'DOCX text extraction - implement with mammoth library'
  }

  async extractTextFromTxt(filePath) {
    try {
      return fs.readFileSync(filePath, { encoding: 'utf-8' })
    } catch (error) {
      console.error('Failed to read text file:', error)
      throw new Error('Unable to read text file')
    }
  }

  async analyzeDocumentWithAI(documentId) {
    const doc = await Document.findById(documentId)
    if (!doc) {
      throw new Error('Document not found')
    }

    if (!doc.extractedText) {
      throw new Error('No extracted text available for analysis')
    }

    const analysis = await GeminiService.analyzeDocument(doc.extractedText, doc.documentType)
    doc.analysis = analysis
    doc.status = 'analyzed'
    await doc.save()

    return analysis
  }

  async deleteDocument(documentId, userId) {
    const doc = await Document.findById(documentId)
    if (!doc) {
      throw new Error('Document not found')
    }

    if (doc.uploadedBy.toString() !== userId.toString()) {
      throw new Error('You do not have permission to delete this document')
    }

    doc.isDeleted = true
    doc.deletedAt = new Date()
    await doc.save()

    const absolutePath = path.join(__dirname, '..', doc.fileUrl)
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
    }

    return { success: true, message: 'Document deleted successfully' }
  }
}

module.exports = new DocumentProcessingService()

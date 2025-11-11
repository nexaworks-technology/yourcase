const fs = require('fs')
const path = require('path')
// pdf-parse v2 exposes a class API. Use PDFParse and call getText().
let PDFParse
try {
  ({ PDFParse } = require('pdf-parse'))
} catch (err) {
  // In case of unexpected export shapes, fall back to default or nested props
  const mod = require('pdf-parse')
  PDFParse = mod.PDFParse || mod.default?.PDFParse || mod
}
const mammoth = require('mammoth')
const Document = require('../models/Document')
let GeminiService

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
    // Keep as 'uploaded' until user explicitly requests analysis
    doc.status = 'uploaded'
    await doc.save()

    return doc
  }

  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      if (!PDFParse) throw new Error('PDF parser not available')
      const parser = new PDFParse({ data: dataBuffer })
      const result = await parser.getText()
      if (typeof parser.destroy === 'function') {
        try { await parser.destroy() } catch (_) {}
      }
      return result?.text || ''
    } catch (error) {
      console.error('Failed to extract text from PDF:', error)
      throw new Error('Unable to extract text from PDF file')
    }
  }

  async extractTextFromDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value || ''
    } catch (error) {
      console.error('Failed to extract text from DOCX:', error)
      throw new Error('Unable to extract text from DOCX file')
    }
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
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('AI service not configured')
    }

    if (!GeminiService) {
      GeminiService = require('./geminiService')
    }

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

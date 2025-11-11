const { ErrorResponse } = require('../middleware/errorHandler')
const Document = require('../models/Document')
const { answerDocumentQuestion, listDocumentQuestions } = require('../services/aiService')

exports.askQuestion = async (req, res, next) => {
  try {
    const { documentId } = req.params
    const { question, tags } = req.body

    const document = await Document.findById(documentId)
    if (!document || document.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    const entry = await answerDocumentQuestion({
      documentId,
      firmId: req.user.firmId,
      userId: req.user.id,
      question,
      tags,
    })

    return res.status(200).json({ success: true, entry })
  } catch (error) {
    return next(error)
  }
}

exports.listQuestions = async (req, res, next) => {
  try {
    const { documentId } = req.params

    const document = await Document.findById(documentId)
    if (!document || document.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Document not found', 404))
    }

    const entries = await listDocumentQuestions({ documentId, firmId: req.user.firmId })
    return res.status(200).json({ success: true, entries })
  } catch (error) {
    return next(error)
  }
}

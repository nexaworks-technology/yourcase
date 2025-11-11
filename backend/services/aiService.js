const Document = require('../models/Document')
const DocumentQuestion = require('../models/DocumentQuestion')
let GeminiService

async function ensureGemini() {
  if (!GeminiService) {
    GeminiService = require('./geminiService')
  }
  return GeminiService
}

exports.answerDocumentQuestion = async ({ documentId, firmId, userId, question, tags }) => {
  const document = await Document.findById(documentId)
  if (!document || document.firmId.toString() !== firmId.toString()) {
    throw new Error('Document not found')
  }

  if (!document.extractedText) {
    throw new Error('Document text not available for analysis yet')
  }

  const gemini = await ensureGemini()

  const prompt = `You are an elite legal AI assisting with document Q&A.
Document summary: ${document.analysis?.summary ?? 'Not generated yet'}

Document text excerpt (truncated to 4k chars):
${document.extractedText.slice(0, 4000)}

Question: ${question}

Provide a precise answer with bullet points where appropriate. Mention specific clauses or sections if identifiable.`

  const response = await gemini.generateResponse(prompt, { maxOutputTokens: 1024 })

  const entry = await DocumentQuestion.create({
    documentId,
    firmId,
    askedBy: userId,
    question,
    answer: response.content,
    tokensUsed: response.tokensUsed,
    model: response.model,
    tags: Array.isArray(tags)
      ? tags
      : tags
      ? String(tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  })

  return entry.toClient()
}

exports.listDocumentQuestions = async ({ documentId, firmId }) => {
  const questions = await DocumentQuestion.find({ documentId, firmId }).sort({ createdAt: -1 }).limit(20)
  return questions.map((question) => question.toClient())
}

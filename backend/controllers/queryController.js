const mongoose = require('mongoose')
const Query = require('../models/Query')
const ChatSession = require('../models/ChatSession')
const Document = require('../models/Document')
const User = require('../models/User')
const geminiService = require('../services/geminiService')
const { ErrorResponse } = require('../middleware/errorHandler')

const DEFAULT_QUERY_TYPE = 'chat'
const MAX_SESSION_MESSAGES = 200

async function ensureUsageLimit(user) {
  if (!user?.apiUsage) return

  const { queriesLimit = 0, queriesUsed = 0 } = user.apiUsage
  if (queriesLimit && queriesUsed >= queriesLimit) {
    throw new ErrorResponse('API usage limit reached. Please upgrade your plan or wait for reset.', 429)
  }
}

async function ensureChatSessionsForUser(firmId, userId) {
  const existingSessions = await ChatSession.find({ firmId, userId }).select('_id').lean()
  const existingIds = new Set(existingSessions.map((session) => session._id.toString()))

  const queries = await Query.find({ firmId, userId }).sort({ createdAt: 1 }).lean()
  const groups = new Map()

  for (const query of queries) {
    const key = query.session ? query.session.toString() : null
    if (!key) continue

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key).push(query)
  }

  for (const [key, groupQueries] of groups.entries()) {
    if (!groupQueries.length) continue

    const sorted = [...groupQueries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const messages = []
    for (const q of sorted) {
      messages.push({
        role: 'user',
        content: q.prompt,
        response: null,
        createdAt: q.createdAt,
      })

      if (q.response?.content) {
        messages.push({
          role: 'assistant',
          content: q.response.content,
          response: q.response,
          createdAt: q.updatedAt || q.createdAt,
        })
      }
    }

    const sessionDoc = {
      firmId,
      userId,
      queryType: last.queryType || DEFAULT_QUERY_TYPE,
      model: last.response?.model || '',
      attachedDocuments: (last.context && last.context.attachedDocuments) || [],
      title: first.prompt?.slice(0, 60) || 'Conversation',
      messages,
      messageCount: sorted.length,
      lastMessageAt: last.createdAt,
      lastPrompt: last.prompt || '',
      lastResponsePreview: last.response?.content || '',
      isArchived: false,
    }

    if (mongoose.Types.ObjectId.isValid(key)) {
      if (!existingIds.has(key)) {
        await ChatSession.create({ _id: new mongoose.Types.ObjectId(key), ...sessionDoc })
        existingIds.add(key)
      } else {
        await ChatSession.updateOne({ _id: key }, { $set: sessionDoc })
      }
    } else {
      const created = await ChatSession.create(sessionDoc)
      const newId = created._id
      await Query.updateMany({ _id: { $in: sorted.map((q) => q._id) } }, { $set: { session: newId } })
      existingIds.add(newId.toString())
    }
  }
}

async function buildDocumentContext(documentIds = [], firmId) {
  if (!Array.isArray(documentIds) || !documentIds.length) return []

  const docs = await Document.find({
    _id: { $in: documentIds },
    firmId,
    isDeleted: { $ne: true },
  })

  return docs.map((doc) => ({
    id: doc._id,
    title: doc.originalName || doc.fileName,
    fileName: doc.fileName,
    content: doc.extractedText,
  }))
}

async function getOrCreateChatSession({ firmId, userId, sessionId, queryType, model, attachedDocuments, prompt }) {
  if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
    const existing = await ChatSession.findOne({ _id: sessionId, firmId, userId, isArchived: false })
    if (existing) {
      return { session: existing, isNew: false }
    }
  }

  const title = prompt ? prompt.slice(0, 60) || 'Conversation' : 'New conversation'

  const session = await ChatSession.create({
    firmId,
    userId,
    queryType: queryType || DEFAULT_QUERY_TYPE,
    model: model || '',
    attachedDocuments,
    title,
    messages: [],
    messageCount: 0,
    lastMessageAt: new Date(),
    lastPrompt: prompt ? prompt.slice(0, 60) || 'Conversation' : '',
    lastResponsePreview: '',
  })

  return { session, isNew: true }
}

function appendMessagesToSession(session, prompt, aiResponse, { model, attachedDocuments }) {
  const timestamp = new Date()

  session.messages.push(
    {
      role: 'user',
      content: prompt,
      response: null,
      createdAt: timestamp,
    },
    {
      role: 'assistant',
      content: aiResponse?.content || '',
      response: aiResponse || null,
      createdAt: timestamp,
    },
  )

  if (session.messages.length > MAX_SESSION_MESSAGES) {
    session.messages = session.messages.slice(-MAX_SESSION_MESSAGES)
  }

  session.messageCount += 1
  session.lastMessageAt = timestamp

  if (session.title === 'New conversation' && prompt) {
    session.title = prompt.slice(0, 60) || 'Conversation'
  }

  if (model) {
    session.model = model
  }

  if (Array.isArray(attachedDocuments) && attachedDocuments.length) {
    session.attachedDocuments = attachedDocuments
  }
}

exports.createSession = async (req, res, next) => {
  try {
    const { queryType = DEFAULT_QUERY_TYPE, model = '', title = '', attachedDocuments = [] } = req.body || {}

    const session = await ChatSession.create({
      firmId: req.user.firmId,
      userId: req.user.id,
      queryType,
      model,
      attachedDocuments,
      title: title ? title.slice(0, 60) || 'Conversation' : 'New conversation',
      messages: [],
      messageCount: 0,
      lastMessageAt: new Date(),
      lastPrompt: title ? title.slice(0, 60) || 'Conversation' : '',
      lastResponsePreview: '',
    })

    return res.status(201).json({ success: true, session: session.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.createQuery = async (req, res, next) => {
  try {
    const {
      prompt,
      queryType = DEFAULT_QUERY_TYPE,
      matterId,
      attachedDocuments = [],
      sessionId,
      model,
    } = req.body

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return next(new ErrorResponse('Prompt is required', 400))
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    await ensureUsageLimit(user)

    const { session, isNew } = await getOrCreateChatSession({
      firmId: req.user.firmId,
      userId: req.user.id,
      sessionId,
      queryType,
      model,
      attachedDocuments,
      prompt,
    })

    const documentContext = await buildDocumentContext(attachedDocuments, req.user.firmId)

    let aiResponse
    try {
      const genOpts = model ? { model } : {}
      aiResponse = documentContext.length
        ? await geminiService.generateWithContext(prompt, { documents: documentContext, options: genOpts })
        : await geminiService.generateResponse(prompt, genOpts)
    } catch (err) {
      if (!process.env.GEMINI_API_KEY) {
        return next(new ErrorResponse('AI service not configured. Add GEMINI_API_KEY on server.', 503))
      }
      return next(new ErrorResponse(err.message || 'Failed to get AI response', 400))
    }

    const queryRecord = await Query.create({
      session: session._id,
      firmId: req.user.firmId,
      userId: req.user.id,
      matterId,
      queryType,
      prompt,
      context: { attachedDocuments },
      response: aiResponse,
    })

    appendMessagesToSession(session, prompt, aiResponse, { model, attachedDocuments })
    session.lastPrompt = prompt
    session.lastResponsePreview = aiResponse?.content || ''
    await session.save()

    user.apiUsage = user.apiUsage || {}
    user.apiUsage.queriesUsed = (user.apiUsage.queriesUsed || 0) + 1
    await user.save({ validateBeforeSave: false })

    return res.status(201).json({
      success: true,
      sessionId: session._id.toString(),
      session: session.toClient(),
      query: queryRecord.toClient(),
      message: aiResponse,
      isNewSession: isNew,
    })
  } catch (error) {
    return next(error)
  }
}

exports.getSessions = async (req, res, next) => {
  try {
    await ensureChatSessionsForUser(req.user.firmId, req.user.id)

    const sessions = await ChatSession.find({
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })
      .sort({ lastMessageAt: -1 })
      .limit(100)

    return res.status(200).json({
      success: true,
      sessions: sessions.map((session) => session.toClient()),
    })
  } catch (error) {
    return next(error)
  }
}

exports.getSessionById = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })

    if (!session) {
      return next(new ErrorResponse('Session not found', 404))
    }

    return res.status(200).json({
      success: true,
      session: session.toClient(),
      messages: session.messages,
    })
  } catch (error) {
    return next(error)
  }
}

exports.deleteSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })

    if (!session) {
      return next(new ErrorResponse('Session not found', 404))
    }

    session.isArchived = true
    await session.save()

    return res.status(200).json({ success: true })
  } catch (error) {
    return next(error)
  }
}

exports.getQueries = async (req, res, next) => {
  try {
    const firmId = req.user.firmId
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const filter = { firmId }

    if (req.query.queryType) {
      filter.queryType = req.query.queryType
    }

    if (req.query.matterId) {
      filter.matterId = req.query.matterId
    }

    if (req.query.sessionId && mongoose.Types.ObjectId.isValid(req.query.sessionId)) {
      filter.session = req.query.sessionId
    }

    const [queries, total] = await Promise.all([
      Query.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Query.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      queries: queries.map((query) => query.toClient()),
    })
  } catch (error) {
    return next(error)
  }
}

exports.getQueryById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid query id', 400))
    }

    const query = await Query.findOne({
      _id: id,
      firmId: req.user.firmId,
      userId: req.user.id,
    })

    if (!query) {
      return next(new ErrorResponse('Query not found', 404))
    }

    return res.status(200).json({ success: true, query: query.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.updateQueryFeedback = async (req, res, next) => {
  try {
    const { id } = req.params
    const { isHelpful, notes } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid query id', 400))
    }

    const query = await Query.findOne({
      _id: id,
      firmId: req.user.firmId,
      userId: req.user.id,
    })

    if (!query) {
      return next(new ErrorResponse('Query not found', 404))
    }

    query.feedback = {
      isHelpful,
      notes,
      submittedAt: new Date(),
    }

    await query.save()

    return res.status(200).json({ success: true, query: query.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.deleteQuery = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid query id', 400))
    }

    const query = await Query.findOne({
      _id: id,
      firmId: req.user.firmId,
      userId: req.user.id,
    })

    if (!query) {
      return next(new ErrorResponse('Query not found', 404))
    }

    await query.deleteOne()

    return res.status(200).json({ success: true })
  } catch (error) {
    return next(error)
  }
}

exports.saveQueryAsTemplate = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid query id', 400))
    }

    const query = await Query.findOne({
      _id: id,
      firmId: req.user.firmId,
      userId: req.user.id,
    })

    if (!query) {
      return next(new ErrorResponse('Query not found', 404))
    }

    query.isTemplate = true
    await query.save()

    return res.status(200).json({ success: true, query: query.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.getSessionQueries = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const queries = await Query.find({
      session: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
    }).sort({ createdAt: 1 })

    return res.status(200).json({
      success: true,
      queries: queries.map((query) => query.toClient()),
    })
  } catch (error) {
    return next(error)
  }
}

exports.renameSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const { title } = req.body

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })

    if (!session) {
      return next(new ErrorResponse('Session not found', 404))
    }

    session.title = title ? title.slice(0, 60) || 'Conversation' : session.title
    await session.save()

    return res.status(200).json({ success: true, session: session.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.updateSessionDocuments = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const { attachedDocuments = [] } = req.body

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })

    if (!session) {
      return next(new ErrorResponse('Session not found', 404))
    }

    session.attachedDocuments = attachedDocuments
    await session.save()

    await Query.updateMany({ session: sessionId }, { $set: { 'context.attachedDocuments': attachedDocuments } })

    return res.status(200).json({ success: true, session: session.toClient() })
  } catch (error) {
    return next(error)
  }
}

exports.getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return next(new ErrorResponse('Invalid session id', 400))
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      firmId: req.user.firmId,
      userId: req.user.id,
      isArchived: false,
    })

    if (!session) {
      return next(new ErrorResponse('Session not found', 404))
    }

    return res.status(200).json({ success: true, messages: session.messages })
  } catch (error) {
    return next(error)
  }
}

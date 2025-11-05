const Query = require('../models/Query')
const Document = require('../models/Document')
const Template = require('../models/Template')
const User = require('../models/User')
const geminiService = require('../services/geminiService')
const { ErrorResponse } = require('../middleware/errorHandler')

function ensureUsageLimit(user) {
  if (!user.apiUsage) return
  const { queriesLimit = 0, queriesUsed = 0 } = user.apiUsage
  if (queriesLimit && queriesUsed >= queriesLimit) {
    throw new ErrorResponse('API usage limit reached. Please upgrade your plan or wait for reset.', 429)
  }
}

async function buildDocumentContext(documentIds = [], firmId) {
  if (!documentIds.length) return []
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

exports.createQuery = async (req, res, next) => {
  try {
    const { prompt, queryType, matterId, attachedDocuments = [], sessionId } = req.body
    if (!prompt || !queryType) {
      return next(new ErrorResponse('Prompt and query type are required', 400))
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    ensureUsageLimit(user)

    const documentContext = await buildDocumentContext(attachedDocuments, req.user.firmId)

    const context = {
      documents: documentContext,
      previousQueries: [],
    }

    const aiResponse = documentContext.length
      ? await geminiService.generateWithContext(prompt, { documents: documentContext })
      : await geminiService.generateResponse(prompt)

    const query = await Query.create({
      userId: req.user.id,
      firmId: req.user.firmId,
      matterId,
      sessionId,
      queryType,
      prompt,
      context: {
        attachedDocuments,
      },
      response: aiResponse,
    })

    user.apiUsage = user.apiUsage || {}
    user.apiUsage.queriesUsed = (user.apiUsage.queriesUsed || 0) + 1
    await user.save({ validateBeforeSave: false })

    return res.status(201).json({ success: true, query })
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

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {}
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate)
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate)
      }
    }

    const [queries, total] = await Promise.all([
      Query.find(filter)
        .populate('userId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Query.countDocuments(filter),
    ])

    return res.status(200).json({
      success: true,
      data: queries,
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

exports.getQueryById = async (req, res, next) => {
  try {
    const { queryId } = req.params
    const query = await Query.findById(queryId)
      .populate('userId', 'firstName lastName email role')
      .populate('matterId')

    if (!query || query.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Query not found', 404))
    }

    return res.status(200).json({ success: true, query })
  } catch (error) {
    return next(error)
  }
}

exports.updateQueryFeedback = async (req, res, next) => {
  try {
    const { queryId } = req.params
    const { rating, isHelpful, comments } = req.body

    const query = await Query.findById(queryId)
    if (!query || query.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Query not found', 404))
    }

    query.feedback = {
      rating,
      isHelpful,
      comments,
      feedbackDate: new Date(),
    }

    await query.save()

    return res.status(200).json({ success: true, query })
  } catch (error) {
    return next(error)
  }
}

exports.deleteQuery = async (req, res, next) => {
  try {
    const { queryId } = req.params
    const query = await Query.findById(queryId)

    if (!query || query.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Query not found', 404))
    }

    const isOwner = query.userId.toString() === req.user.id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized to delete this query', 403))
    }

    await query.remove()

    return res.status(200).json({ success: true, message: 'Query deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

exports.saveQueryAsTemplate = async (req, res, next) => {
  try {
    const { queryId } = req.params
    const query = await Query.findById(queryId)

    if (!query || query.firmId.toString() !== req.user.firmId.toString()) {
      return next(new ErrorResponse('Query not found', 404))
    }

    query.savedAsTemplate = true
    await query.save()

    const template = await Template.create({
      firmId: query.firmId,
      createdBy: query.userId,
      name: `Template from query ${query._id}`,
      category: 'other',
      templateContent: query.prompt,
      description: query.response?.content?.slice(0, 200),
      tags: ['ai-generated'],
    })

    return res.status(201).json({ success: true, templateId: template._id })
  } catch (error) {
    return next(error)
  }
}

exports.getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      return next(new ErrorResponse('Session ID is required', 400))
    }

    const queries = await Query.find({
      firmId: req.user.firmId,
      sessionId,
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'firstName lastName role')

    return res.status(200).json({ success: true, conversation: queries })
  } catch (error) {
    return next(error)
  }
}

exports.streamQueryResponse = async (req, res, next) => {
  try {
    const { prompt, queryType, matterId, sessionId } = req.body
    if (!prompt || !queryType) {
      return next(new ErrorResponse('Prompt and query type are required', 400))
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    ensureUsageLimit(user)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let fullResponse = ''

    try {
      for await (const chunk of geminiService.streamResponse(prompt)) {
        fullResponse += chunk
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }

      const query = await Query.create({
        userId: req.user.id,
        firmId: req.user.firmId,
        matterId,
        sessionId,
        queryType,
        prompt,
        response: {
          content: fullResponse,
          model: 'gemini-pro',
          tokensUsed: geminiService.countTokens(prompt) + geminiService.countTokens(fullResponse),
        },
      })

      user.apiUsage = user.apiUsage || {}
      user.apiUsage.queriesUsed = (user.apiUsage.queriesUsed || 0) + 1
      await user.save({ validateBeforeSave: false })

      res.write(`data: ${JSON.stringify({ done: true, queryId: query._id })}\n\n`)
      res.end()
    } catch (streamError) {
      console.error('Stream error:', streamError)
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
      res.end()
    }
  } catch (error) {
    return next(error)
  }
}

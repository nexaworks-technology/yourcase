const mongoose = require('mongoose')

const contextSchema = new mongoose.Schema(
  {
    attachedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    previousQueryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Query',
    },
    additionalContext: String,
  },
  { _id: false },
)

const responseSchema = new mongoose.Schema(
  {
    content: String,
    citations: [mongoose.Schema.Types.Mixed],
    model: { type: String, default: 'gemini-pro' },
    tokensUsed: Number,
    processingTime: Number,
    confidenceScore: Number,
  },
  { _id: false },
)

const feedbackSchema = new mongoose.Schema(
  {
    rating: Number,
    isHelpful: Boolean,
    comments: String,
    feedbackDate: Date,
  },
  { _id: false },
)

const usageSchema = new mongoose.Schema(
  {
    promptTokens: Number,
    responseTokens: Number,
    totalTokens: Number,
    cost: Number,
  },
  { _id: false },
)

const querySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
    },
    matterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientMatter',
    },
    sessionId: {
      type: String,
    },
    queryType: {
      type: String,
      enum: ['research', 'drafting', 'analysis', 'compliance', 'chat', 'summarization', 'translation'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    context: {
      type: contextSchema,
      default: () => ({}),
    },
    response: {
      type: responseSchema,
      default: () => ({}),
    },
    feedback: {
      type: feedbackSchema,
      default: () => ({}),
    },
    usage: {
      type: usageSchema,
      default: () => ({}),
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    savedAsTemplate: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

querySchema.index({ firmId: 1, userId: 1 })
querySchema.index({ queryType: 1 })
querySchema.index({ createdAt: 1 })

const Query = mongoose.model('Query', querySchema)

module.exports = Query

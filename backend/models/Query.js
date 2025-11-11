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
    model: { type: String, default: '' },
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
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    matterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientMatter',
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
    lastPrompt: {
      type: String,
      default: ''
    },
    lastResponsePreview: {
      type: String,
      default: ''
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

querySchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    sessionId: this.session ? this.session.toString() : null,
    queryType: this.queryType,
    prompt: this.prompt,
    response: this.response,
    lastPrompt: this.lastPrompt,
    lastResponsePreview: this.lastResponsePreview,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

const Query = mongoose.model('Query', querySchema)

module.exports = Query

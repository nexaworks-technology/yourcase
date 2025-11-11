const mongoose = require('mongoose')

const documentQuestionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
      index: true,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
    },
    citations: [{
      text: String,
      page: Number,
    }],
    tags: [{ type: String }],
    tokensUsed: {
      type: Number,
      default: 0,
    },
    model: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

documentQuestionSchema.index({ createdAt: -1 })

documentQuestionSchema.methods.toClient = function toClient() {
  const obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

const DocumentQuestion = mongoose.model('DocumentQuestion', documentQuestionSchema)

module.exports = DocumentQuestion

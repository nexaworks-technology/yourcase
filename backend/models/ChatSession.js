const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const chatSessionSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      trim: true,
      default: 'New conversation',
    },
    queryType: {
      type: String,
      enum: ['research', 'drafting', 'analysis', 'compliance', 'chat', 'summarization', 'translation'],
      default: 'chat',
    },
    model: {
      type: String,
      default: '',
    },
    attachedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    lastPrompt: {
      type: String,
      default: '',
    },
    lastResponsePreview: {
      type: String,
      default: '',
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

chatSessionSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    title: this.title,
    queryType: this.queryType,
    model: this.model,
    messageCount: this.messageCount,
    lastMessageAt: this.lastMessageAt,
    lastPrompt: this.lastPrompt,
    lastResponsePreview: this.lastResponsePreview,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isArchived: this.isArchived,
  }
}

const ChatSession = mongoose.model('ChatSession', chatSessionSchema)

module.exports = ChatSession

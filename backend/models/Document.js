const mongoose = require('mongoose')

// Allow flexible analysis shape to accommodate different document types (contracts, case-law, etc.)
const analysisSchema = new mongoose.Schema({}, { _id: false, strict: false })

const metadataSchema = new mongoose.Schema(
  {
    pageCount: Number,
    language: String,
    jurisdiction: String,
  },
  { _id: false },
)

const documentSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
    },
    matterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientMatter',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
    },
    documentType: {
      type: String,
      enum: ['contract', 'case-law', 'evidence', 'correspondence', 'petition', 'judgment', 'agreement', 'notice', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'analyzed', 'failed'],
      default: 'uploaded',
    },
    extractedText: {
      type: String,
    },
    analysis: { type: analysisSchema, default: () => ({}) },
    metadata: {
      type: metadataSchema,
      default: () => ({}),
    },
    tags: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

documentSchema.index({ firmId: 1 })
documentSchema.index({ matterId: 1 })
documentSchema.index({ status: 1 })
documentSchema.index({ extractedText: 'text', fileName: 'text' })

const Document = mongoose.model('Document', documentSchema)

module.exports = Document

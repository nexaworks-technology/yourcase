const mongoose = require('mongoose')

const variableSchema = new mongoose.Schema(
  {
    name: String,
    label: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea'],
    },
    required: Boolean,
    defaultValue: String,
    options: [mongoose.Schema.Types.Mixed],
  },
  { _id: false },
)

const formattingSchema = new mongoose.Schema(
  {
    fontSize: Number,
    fontFamily: String,
    lineSpacing: Number,
    margins: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
)

const permissionsSchema = new mongoose.Schema(
  {
    isPublic: { type: Boolean, default: false },
    allowedRoles: [String],
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { _id: false },
)

const statisticsSchema = new mongoose.Schema(
  {
    usageCount: { type: Number, default: 0 },
    averageRating: Number,
  },
  { _id: false },
)

const templateSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['contract', 'legal-notice', 'petition', 'memo', 'email', 'letter', 'agreement', 'affidavit', 'other'],
      required: true,
    },
    templateContent: {
      type: String,
      required: true,
    },
    variables: {
      type: [variableSchema],
      default: [],
    },
    jurisdiction: {
      type: String,
      default: 'India',
    },
    applicableLaws: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'en',
    },
    formatting: {
      type: formattingSchema,
      default: () => ({}),
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
    statistics: {
      type: statisticsSchema,
      default: () => ({}),
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

templateSchema.index({ firmId: 1 })
templateSchema.index({ category: 1 })
templateSchema.index({ name: 'text', description: 'text' })

const Template = mongoose.model('Template', templateSchema)

module.exports = Template

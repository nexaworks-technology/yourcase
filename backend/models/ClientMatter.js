const mongoose = require('mongoose')

const courtDetailsSchema = new mongoose.Schema(
  {
    courtName: String,
    caseNumber: String,
    judge: String,
    nextHearing: Date,
  },
  { _id: false },
)

const financialsSchema = new mongoose.Schema(
  {
    estimatedValue: Number,
    feesCharged: Number,
    feesPaid: Number,
    currency: { type: String, default: 'INR' },
  },
  { _id: false },
)

const clientMatterSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: true,
    },
    matterNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
    },
    clientPhone: {
      type: String,
    },
    matterType: {
      type: String,
      enum: ['litigation', 'corporate', 'compliance', 'contracts', 'tax', 'ipr', 'real-estate', 'family', 'criminal'],
      required: true,
    },
    matterTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'on-hold', 'archived'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedLawyers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    courtDetails: {
      type: courtDetailsSchema,
      default: () => ({}),
    },
    financials: {
      type: financialsSchema,
      default: () => ({}),
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: true },
)

clientMatterSchema.index({ firmId: 1, matterNumber: 1 })
clientMatterSchema.index({ status: 1 })
clientMatterSchema.index({ assignedLawyers: 1 })

const ClientMatter = mongoose.model('ClientMatter', clientMatterSchema)

module.exports = ClientMatter

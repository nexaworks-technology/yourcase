const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  { _id: false },
)

const settingsSchema = new mongoose.Schema(
  {
    allowUserRegistration: { type: Boolean, default: false },
    maxUsers: { type: Number, default: 5 },
    storageLimit: { type: Number, default: 5368709120 },
    features: {
      type: [String],
      default: ['ai-assistant', 'document-vault'],
    },
  },
  { _id: false },
)

const billingInfoSchema = new mongoose.Schema(
  {
    gstNumber: String,
    panNumber: String,
    billingAddress: addressSchema,
  },
  { _id: false },
)

const usageMetricsSchema = new mongoose.Schema(
  {
    totalQueries: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
  },
  { _id: false },
)

const firmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
    },
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'starter',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'expired'],
      default: 'trial',
    },
    subscriptionExpiry: {
      type: Date,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    billingInfo: {
      type: billingInfoSchema,
      default: () => ({}),
    },
    usageMetrics: {
      type: usageMetricsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

firmSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'firmId',
})

const Firm = mongoose.model('Firm', firmSchema)

module.exports = Firm

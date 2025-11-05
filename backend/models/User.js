const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const preferencesSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'en' },
    aiModel: { type: String, default: 'gemini' },
    theme: { type: String, default: 'light' },
  },
  { _id: false },
)

const apiUsageSchema = new mongoose.Schema(
  {
    queriesUsed: { type: Number, default: 0 },
    queriesLimit: { type: Number, default: 100 },
    resetDate: { type: Date },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'lawyer', 'paralegal', 'client'],
      default: 'lawyer',
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    subscriptionTier: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    apiUsage: {
      type: apiUsageSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User

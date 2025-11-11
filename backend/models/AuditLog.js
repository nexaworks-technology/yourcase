const mongoose = require('mongoose')

const detailsSchema = new mongoose.Schema(
  {
    description: String,
    changes: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
)

const locationSchema = new mongoose.Schema(
  {
    country: String,
    city: String,
    coordinates: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
)

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
    },
    action: {
      type: String,
      required: true,
      enum: ['login', 'logout', 'create', 'read', 'update', 'delete', 'download', 'upload', 'share', 'ai-query', 'workflow-execute', 'settings-change'],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: detailsSchema,
      default: () => ({}),
    },
    ipAddress: String,
    userAgent: String,
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'warning'],
      default: 'success',
    },
    errorMessage: String,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: false },
)

auditLogSchema.index({ firmId: 1, timestamp: -1 })
auditLogSchema.index({ userId: 1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

auditLogSchema.statics.logActivity = function (activityData) {
  return this.create(activityData)
}

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

module.exports = AuditLog

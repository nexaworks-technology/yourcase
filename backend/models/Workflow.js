const mongoose = require('mongoose')

const stepSchema = new mongoose.Schema(
  {
    stepId: { type: String, required: true },
    stepName: String,
    stepType: {
      type: String,
      enum: ['prompt', 'document-analysis', 'condition', 'approval', 'wait', 'notification'],
    },
    order: Number,
    config: {
      promptTemplate: String,
      documentTypes: [String],
      conditionLogic: mongoose.Schema.Types.Mixed,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    nextStepId: String,
    conditionalBranches: [mongoose.Schema.Types.Mixed],
  },
  { _id: false },
)

const workflowSchema = new mongoose.Schema(
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
      enum: ['contract-review', 'due-diligence', 'compliance-check', 'litigation-prep', 'document-drafting', 'custom'],
    },
    icon: {
      type: String,
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    inputFields: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    outputFormat: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    permissions: {
      isPublic: { type: Boolean, default: false },
      allowedRoles: [String],
      sharedWith: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    statistics: {
      usageCount: { type: Number, default: 0 },
      successRate: Number,
      averageExecutionTime: Number,
      averageRating: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
)

workflowSchema.virtual('executions', {
  ref: 'WorkflowExecution',
  localField: '_id',
  foreignField: 'workflowId',
})

const Workflow = mongoose.model('Workflow', workflowSchema)

module.exports = Workflow

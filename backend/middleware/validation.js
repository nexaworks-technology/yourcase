const { body, param, validationResult } = require('express-validator')

const registerValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
  body('firstName').notEmpty().withMessage('First name is required').trim().escape(),
  body('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
  body('role').optional().isIn(['admin', 'lawyer', 'paralegal', 'client']).withMessage('Invalid role'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]

const documentUploadValidation = [
  body('matterId').optional().isMongoId().withMessage('Invalid matter ID'),
  body('documentType')
    .optional()
    .isIn(['contract', 'case-law', 'evidence', 'correspondence', 'petition', 'judgment', 'agreement', 'notice', 'other'])
    .withMessage('Invalid document type'),
  body('tags')
    .optional()
    .custom((value) => Array.isArray(value) || typeof value === 'string')
    .withMessage('Tags must be provided as an array or comma-separated string'),
]

const documentQuestionValidation = [
  body('question').isString().trim().isLength({ min: 5 }).withMessage('Question must be at least 5 characters long'),
  body('tags')
    .optional()
    .custom((value) => Array.isArray(value) || typeof value === 'string')
    .withMessage('Tags must be provided as an array or comma-separated string'),
]

const queryValidation = [
  body('queryType')
    .isIn(['research', 'drafting', 'analysis', 'compliance', 'chat'])
    .withMessage('Invalid query type'),
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .custom((value, { req }) => {
      const min = req.body.queryType === 'chat' ? 3 : 10
      if (typeof value !== 'string' || value.trim().length < min) {
        throw new Error(`Prompt must be at least ${min} characters`)
      }
      return true
    }),
  body('matterId').optional().isMongoId().withMessage('Invalid matter ID'),
]

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
    })
  }
  next()
}

module.exports = {
  registerValidation,
  loginValidation,
  documentUploadValidation,
  documentQuestionValidation,
  queryValidation,
  validate,
}

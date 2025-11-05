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
    .isIn(['contract', 'case-law', 'evidence', 'correspondence', 'other'])
    .withMessage('Invalid document type'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
]

const queryValidation = [
  body('prompt').notEmpty().withMessage('Prompt is required').trim().isLength({ min: 10 }).withMessage('Prompt must be at least 10 characters'),
  body('queryType')
    .isIn(['research', 'drafting', 'analysis', 'compliance', 'chat'])
    .withMessage('Invalid query type'),
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
  queryValidation,
  validate,
}

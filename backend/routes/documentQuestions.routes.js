const express = require('express')
const { protect } = require('../middleware/auth')
const { aiQueryLimiter } = require('../middleware/rateLimiter')
const { documentQuestionValidation, validate } = require('../middleware/validation')
const { askQuestion, listQuestions } = require('../controllers/documentQuestionController')

const router = express.Router({ mergeParams: true })

router.get('/', protect, listQuestions)
router.post('/', protect, aiQueryLimiter, documentQuestionValidation, validate, askQuestion)

module.exports = router

const express = require('express')
const {
  createQuery,
  getQueries,
  getQueryById,
  updateQueryFeedback,
  deleteQuery,
  saveQueryAsTemplate,
  getChatHistory,
} = require('../controllers/queryController')
const { protect } = require('../middleware/auth')
const { queryValidation, validate } = require('../middleware/validation')
const { aiQueryLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

router.post('/', protect, aiQueryLimiter, queryValidation, validate, createQuery)
router.get('/', protect, getQueries)
router.get('/:id', protect, getQueryById)
router.put('/:id/feedback', protect, updateQueryFeedback)
router.delete('/:id', protect, deleteQuery)
router.post('/:id/save-template', protect, saveQueryAsTemplate)
router.get('/chat/:sessionId', protect, getChatHistory)

module.exports = router

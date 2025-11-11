const express = require('express')
const {
  createSession,
  createQuery,
  getQueries,
  getQueryById,
  updateQueryFeedback,
  deleteQuery,
  saveQueryAsTemplate,
  getSessions,
  getSessionById,
  deleteSession,
} = require('../controllers/queryController')
const { protect } = require('../middleware/auth')
const { queryValidation, validate } = require('../middleware/validation')
const { aiQueryLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

router.post('/sessions', protect, createSession)
router.get('/sessions', protect, getSessions)
router.get('/sessions/:sessionId', protect, getSessionById)
router.delete('/sessions/:sessionId', protect, deleteSession)

router.post('/', protect, aiQueryLimiter, queryValidation, validate, createQuery)
router.get('/', protect, getQueries)
router.put('/:id/feedback', protect, updateQueryFeedback)
router.post('/:id/save-template', protect, saveQueryAsTemplate)
router.delete('/:id', protect, deleteQuery)
router.get('/:id', protect, getQueryById)

module.exports = router

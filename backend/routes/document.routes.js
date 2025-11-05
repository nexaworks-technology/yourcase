const express = require('express')
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  analyzeDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  searchDocuments,
  uploadMiddleware,
} = require('../controllers/documentController')
const { protect } = require('../middleware/auth')
const { uploadLimiter, aiQueryLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

router.post('/upload', protect, uploadLimiter, uploadMiddleware.single('file'), uploadDocument[1])
router.get('/search', protect, searchDocuments)
router.get('/', protect, getDocuments)
router.get('/:documentId', protect, getDocumentById)
router.post('/:documentId/analyze', protect, aiQueryLimiter, analyzeDocument)
router.put('/:documentId', protect, updateDocument)
router.delete('/:documentId', protect, deleteDocument)
router.get('/:documentId/download', protect, downloadDocument)

module.exports = router

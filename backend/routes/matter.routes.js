const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getMatters,
  getMatterById,
  createMatter,
  updateMatter,
  deleteMatter,
  assignLawyers,
  getMatterDocuments,
  getMatterQueries,
  getMatterTimeline,
  exportMatter,
} = require('../controllers/matterController')

const router = express.Router()
const { createMatterValidation, updateMatterValidation, validate } = require('../middleware/validation')

// Place specific routes before parameter routes to avoid collisions
router.get('/search', protect, getMatters)
router.get('/', protect, getMatters)
router.post('/', protect, createMatterValidation, validate, createMatter)

// Sub-resources
router.get('/:matterId/documents', protect, getMatterDocuments)
router.get('/:matterId/queries', protect, getMatterQueries)
router.get('/:matterId/timeline', protect, getMatterTimeline)
router.get('/:matterId/export', protect, exportMatter)

// Parameter routes
router.get('/:matterId', protect, getMatterById)
router.put('/:matterId', protect, updateMatterValidation, validate, updateMatter)
router.delete('/:matterId', protect, deleteMatter)
router.post('/:matterId/assign', protect, assignLawyers)

module.exports = router

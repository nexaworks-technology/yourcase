const express = require('express')
const { protect } = require('../middleware/auth')
const { getMatters, getMatterById } = require('../controllers/matterController')

const router = express.Router()

router.get('/', protect, getMatters)
router.get('/:matterId', protect, getMatterById)

module.exports = router


const express = require('express')
const { register, login, logout, getMe, updateProfile, changePassword } = require('../controllers/authController')
const { registerValidation, loginValidation, validate } = require('../middleware/validation')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimiter')

const router = express.Router()

router.post('/register', authLimiter, registerValidation, validate, register)
router.post('/login', authLimiter, loginValidation, validate, login)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/change-password', protect, changePassword)

module.exports = router

const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function protect(req, res, next) {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Auth error:', error.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'User role not authorized' })
    }
    next()
  }
}

function checkFirmAccess(req, res, next) {
  if (!req.user || !req.user.firmId) {
    return res.status(403).json({ message: 'User firm information missing' })
  }

  const targetFirmId = (req.params && req.params.firmId) || req.body?.firmId

  if (!targetFirmId) {
    return res.status(403).json({ message: 'Firm context not provided' })
  }

  if (req.user.firmId.toString() !== targetFirmId.toString()) {
    return res.status(403).json({ message: 'User does not have access to this firm' })
  }

  next()
}

module.exports = {
  protect,
  authorize,
  checkFirmAccess,
}

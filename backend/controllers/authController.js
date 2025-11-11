const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Firm = require('../models/Firm')
const { ErrorResponse } = require('../middleware/errorHandler')

function generateToken(id) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  })
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, firmId, firmName } = req.body

    console.log('[Auth] Register attempt:', {
      email,
      hasFirmId: Boolean(firmId),
      hasFirmName: Boolean(firmName),
    })

    if (!email || !password || !firstName || !lastName) {
      return next(new ErrorResponse('Missing required registration fields', 400))
    }

    let user = await User.findOne({ email })
    if (user) {
      return next(new ErrorResponse('User already exists', 400))
    }

    let firm
    if (firmId) {
      firm = await Firm.findById(firmId)
      if (!firm) {
        return next(new ErrorResponse('Firm not found', 404))
      }
    } else {
      if (!firmName) {
        return next(new ErrorResponse('Firm information is required for registration', 400))
      }

      firm = await Firm.findOne({ name: firmName.trim() })

      if (!firm) {
        firm = await Firm.create({
          name: firmName.trim(),
          contactEmail: email,
        })
      } else {
        console.log('[Auth] Using existing firm for registration:', {
          firmId: firm.id,
          name: firm.name,
        })
      }
    }

    user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'lawyer',
      firmId: firm._id,
    })

    console.log('[Auth] Register DB write:', {
      userId: user.id,
      email: user.email,
      firmId: user.firmId,
      createdAt: user.createdAt,
    })

    const token = generateToken(user._id)
    const userData = user.toObject()
    delete userData.password

    const responsePayload = {
      success: true,
      token,
      user: userData,
    }

    console.log('[Auth] Register success:', {
      userId: user.id,
      email: user.email,
      firmId: user.firmId,
    })
    return res.status(201).json(responsePayload)
  } catch (error) {
    console.error('[Auth] Register error:', error)
    return next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400))
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user._id)
    const userData = user.toObject()
    delete userData.password

    const responsePayload = {
      success: true,
      token,
      user: userData,
    }

    console.log('[Auth] Login success:', user.id)
    return res.status(200).json(responsePayload)
  } catch (error) {
    console.error('[Auth] Login error:', error)
    return next(error)
  }
}

exports.logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  })

  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('firmId')
    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    return res.status(200).json({ success: true, user })
  } catch (error) {
    return next(error)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {}
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'preferences']

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: '-password',
    })

    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    return res.status(200).json({ success: true, user })
  } catch (error) {
    return next(error)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Current and new password are required', 400))
    }

    const user = await User.findById(req.user.id).select('+password')
    if (!user) {
      return next(new ErrorResponse('User not found', 404))
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401))
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    const token = generateToken(user._id)

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
    })
  } catch (error) {
    return next(error)
  }
}

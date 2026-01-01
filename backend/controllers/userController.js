const User = require('../models/User')
const { ErrorResponse } = require('../middleware/errorHandler')

exports.searchUsers = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    if (!firmId) return next(new ErrorResponse('Unauthorized', 401))

    const { email, q, limit = 10 } = req.query
    const filter = { firmId }
    if (email) {
      filter.email = { $regex: new RegExp(`^${String(email).trim()}`, 'i') }
    } else if (q) {
      const s = String(q).trim()
      filter.$or = [
        { email: { $regex: new RegExp(s, 'i') } },
        { firstName: { $regex: new RegExp(s, 'i') } },
        { lastName: { $regex: new RegExp(s, 'i') } },
      ]
    }

    const users = await User.find(filter)
      .limit(Math.max(1, Math.min(50, Number(limit))))
      .select('firstName lastName email avatar')

    const items = users.map((u) => ({
      id: u._id.toString(),
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      email: u.email,
      avatar: u.avatar,
    }))

    res.json({ success: true, items })
  } catch (err) {
    next(err)
  }
}


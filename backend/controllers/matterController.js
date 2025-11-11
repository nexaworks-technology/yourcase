const ClientMatter = require('../models/ClientMatter')
const { ErrorResponse } = require('../middleware/errorHandler')

exports.getMatters = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    if (!firmId) return next(new ErrorResponse('Unauthorized', 401))

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit
    const sortBy = req.query.sortBy || 'createdAt'
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1

    const filter = { firmId }
    if (req.query.search) {
      const q = new RegExp(req.query.search, 'i')
      filter.$or = [{ matterTitle: q }, { matterNumber: q }, { clientName: q }]
    }

    const [items, total] = await Promise.all([
      ClientMatter.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      ClientMatter.countDocuments(filter),
    ])

    res.status(200).json({
      success: true,
      data: items.map((m) => ({
        id: m._id,
        _id: m._id,
        matterTitle: m.matterTitle || m.matterNumber || m.title || 'Matter',
        matterNumber: m.matterNumber,
        clientName: m.clientName,
        status: m.status,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (err) {
    next(err)
  }
}

exports.getMatterById = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const m = await ClientMatter.findById(matterId)
    if (!m || String(m.firmId) !== String(firmId)) {
      return next(new ErrorResponse('Matter not found', 404))
    }
    res.status(200).json({ success: true, data: m })
  } catch (err) {
    next(err)
  }
}


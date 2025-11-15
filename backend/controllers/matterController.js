const ClientMatter = require('../models/ClientMatter')
const { ErrorResponse } = require('../middleware/errorHandler')
const Document = require('../models/Document')
const Query = require('../models/Query')
const { Parser } = require('json2csv')

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

    // populate assignedLawyers with user names and avatars if available
    await ClientMatter.populate(items, { path: 'assignedLawyers', select: 'firstName lastName email avatar' })

    const mapped = items.map((m) => ({
      id: m._id,
      _id: m._id,
      matterNumber: m.matterNumber,
      clientName: m.clientName,
      title: m.matterTitle || m.title || m.matterNumber || 'Matter',
      type: m.matterType,
      status: m.status,
      priority: m.priority,
      assignedLawyers: (m.assignedLawyers || []).map((u) => ({
        id: String(u._id || u),
        name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Member',
        email: u.email,
        avatar: u.avatar || (u.firstName ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.firstName[0] + (u.lastName ? u.lastName[0] : ''))}` : undefined),
      })),
      startDate: m.startDate,
      nextHearing: m.courtDetails?.nextHearing,
      tags: m.tags,
    }))

    const stats = {
      total,
      active: items.filter((m) => m.status === 'active').length,
      closingSoon: items.filter((m) => !!m.courtDetails?.nextHearing).length,
      overdue: items.filter((m) => m.status === 'on-hold').length,
    }

    res.status(200).json({
      success: true,
      items: mapped,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats,
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

exports.createMatter = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    if (!firmId) return next(new ErrorResponse('Unauthorized', 401))

    const {
      matterNumber,
      clientName,
      clientEmail,
      clientPhone,
      matterType,
      matterTitle,
      description,
      status,
      priority,
      assignedLawyers,
      startDate,
      endDate,
      courtDetails,
      financials,
      tags,
      metadata,
    } = req.body

    const number = matterNumber && String(matterNumber).trim().length > 0
      ? matterNumber
      : `MAT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const created = await ClientMatter.create({
      firmId,
      matterNumber: number,
      clientName,
      clientEmail,
      clientPhone,
      matterType,
      matterTitle,
      description,
      status,
      priority,
      assignedLawyers,
      startDate,
      endDate,
      courtDetails,
      financials,
      tags,
      metadata,
    })

    return res.status(201).json({ success: true, data: created })
  } catch (err) {
    next(err)
  }
}

exports.updateMatter = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const updates = req.body || {}
    const found = await ClientMatter.findById(matterId).populate('assignedLawyers', 'firstName lastName email avatar')
    if (!found || String(found.firmId) !== String(firmId)) {
      return next(new ErrorResponse('Matter not found', 404))
    }
    Object.assign(found, updates)
    await found.save()
    // map team for frontend TeamManagement
    const team = (found.assignedLawyers || []).map((u) => ({
      id: String(u._id),
      name: `${u.firstName} ${u.lastName || ''}`.trim(),
      email: u.email,
      avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.firstName[0] + (u.lastName ? u.lastName[0] : ''))}`,
      role: 'associate',
      permissions: 'Workspace',
      assignedAt: found.createdAt,
      activity: { documents: 0, queries: 0 },
    }))
    const payload = found.toObject()
    payload.title = payload.matterTitle
    payload.type = payload.matterType
    payload.team = team
    return res.status(200).json({ success: true, data: payload })
  } catch (err) {
    next(err)
  }
}

exports.deleteMatter = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const found = await ClientMatter.findById(matterId)
    if (!found || String(found.firmId) !== String(firmId)) {
      return next(new ErrorResponse('Matter not found', 404))
    }
    await ClientMatter.deleteOne({ _id: matterId })
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

exports.assignLawyers = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const { lawyerIds = [] } = req.body
    const found = await ClientMatter.findById(matterId)
    if (!found || String(found.firmId) !== String(firmId)) {
      return next(new ErrorResponse('Matter not found', 404))
    }
    found.assignedLawyers = lawyerIds
    await found.save()
    return res.status(200).json({ success: true, data: found })
  } catch (err) {
    next(err)
  }
}

// Sub-resources wired to real data
exports.getMatterDocuments = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Document.find({ firmId, matterId, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments({ firmId, matterId, isDeleted: { $ne: true } }),
    ])

    res.json({
      success: true,
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    })
  } catch (err) {
    next(err)
  }
}

exports.getMatterQueries = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Query.find({ firmId, matterId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Query.countDocuments({ firmId, matterId }),
    ])

    res.json({ success: true, items: items.map((q) => q.toClient()), meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } })
  } catch (err) {
    next(err)
  }
}

exports.getMatterTimeline = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params

    // Simple composed timeline from documents and queries
    const [docs, queries] = await Promise.all([
      Document.find({ firmId, matterId }).sort({ createdAt: -1 }).limit(100),
      Query.find({ firmId, matterId }).sort({ createdAt: -1 }).limit(100),
    ])

    const items = [
      ...docs.map((d) => ({
        id: `doc-${d._id}`,
        type: 'document',
        title: d.fileName,
        description: d.documentType || d.mimeType,
        date: d.createdAt,
        user: 'Upload',
        attachments: [{ id: d._id.toString(), name: d.originalName || d.fileName, url: d.fileUrl }],
      })),
      ...queries.map((q) => ({
        id: `qry-${q._id}`,
        type: 'milestone',
        title: q.prompt?.slice(0, 80) || 'Query',
        description: q.response?.content?.slice(0, 120) || 'AI response recorded',
        date: q.createdAt,
        user: 'AI',
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json({ success: true, items })
  } catch (err) {
    next(err)
  }
}

exports.exportMatter = async (req, res, next) => {
  try {
    const firmId = req.user?.firmId
    const { matterId } = req.params
    const matter = await ClientMatter.findById(matterId)
    if (!matter || String(matter.firmId) !== String(firmId)) {
      return next(new ErrorResponse('Matter not found', 404))
    }

    const [docs, queries] = await Promise.all([
      Document.find({ firmId, matterId }),
      Query.find({ firmId, matterId }),
    ])

    const rows = [
      { section: 'Matter', key: 'matterNumber', value: matter.matterNumber },
      { section: 'Matter', key: 'clientName', value: matter.clientName },
      { section: 'Matter', key: 'title', value: matter.matterTitle },
      { section: 'Matter', key: 'type', value: matter.matterType },
      { section: 'Matter', key: 'status', value: matter.status },
      { section: 'Matter', key: 'priority', value: matter.priority },
      ...docs.map((d) => ({ section: 'Document', key: d.fileName, value: d.fileUrl })),
      ...queries.map((q) => ({ section: 'Query', key: q.createdAt.toISOString(), value: (q.prompt || '').replace(/\n/g, ' ') })),
    ]

    const parser = new Parser({ fields: ['section', 'key', 'value'] })
    const csv = parser.parse(rows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="matter-${matter.matterNumber}.csv"`)
    res.status(200).send(csv)
  } catch (err) {
    next(err)
  }
}

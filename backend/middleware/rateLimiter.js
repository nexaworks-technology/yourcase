const rateLimit = require('express-rate-limit')

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
})

function aiQueryHandler(req, res) {
  let upgradeSuggestion = 'Please upgrade your plan or wait.'
  if (req.user && req.user.subscriptionTier) {
    const tier = req.user.subscriptionTier
    upgradeSuggestion = tier === 'enterprise'
      ? 'Please contact support to extend your enterprise quota.'
      : 'Consider upgrading your plan to increase AI query limits.'
  }

  return res.status(429).json({
    message: 'AI query limit reached. ' + upgradeSuggestion,
  })
}

const aiQueryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  handler: aiQueryHandler,
  message: 'AI query limit reached. Please upgrade your plan or wait.',
  keyGenerator: (req) => (req.user ? req.user.id : req.ip),
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Upload limit reached, please try again later',
})

function checkSubscriptionLimit(req, res, next) {
  if (!req.user || !req.user.apiUsage) {
    return res
      .status(429)
      .json({ message: 'Usage information unavailable. Please contact support.' })
  }

  const { queriesUsed = 0, queriesLimit = 0 } = req.user.apiUsage

  if (queriesLimit && queriesUsed >= queriesLimit) {
    let upgradeMessage = 'API usage limit reached. Please upgrade your plan or wait for reset.'
    if (req.user.subscriptionTier === 'enterprise') {
      upgradeMessage = 'Enterprise usage limit reached. Contact your account manager.'
    }

    return res.status(429).json({ message: upgradeMessage })
  }

  next()
}

module.exports = {
  generalLimiter,
  authLimiter,
  aiQueryLimiter,
  uploadLimiter,
  checkSubscriptionLimit,
}

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

function errorHandler(err, req, res, next) {
  let error = { ...err }
  error.message = err.message

  console.error('\x1b[31m%s\x1b[0m', err)

  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404)
  }

  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value', 400)
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message)
    error = new ErrorResponse(messages.join(', '), 400)
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Server Error'

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}

module.exports = {
  ErrorResponse,
  errorHandler,
}

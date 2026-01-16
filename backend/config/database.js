const mongoose = require('mongoose')

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000

async function connectDB(attempt = 1) {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection attempt ${attempt} failed:`, error.message)

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return connectDB(attempt + 1)
    }

    console.error('Exceeded maximum MongoDB connection attempts. Exiting.')
    process.exit(1)
  }
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection established.')
})

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose connection disconnected.')
})

module.exports = { connectDB }

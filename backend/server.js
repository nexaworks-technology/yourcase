const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')

const dotenvPath = (() => {
  const candidatePaths = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '.env'),
    path.join(process.cwd(), 'backend/.env'),
    path.join(process.cwd(), '../backend/.env'),
  ]

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  console.warn('⚠️  No .env file found. Using defaults from environment variables.')
  return undefined
})()

dotenv.config({ path: dotenvPath })

const { connectDB } = require('./config/database')
const { errorHandler } = require('./middleware/errorHandler')
const { generalLimiter } = require('./middleware/rateLimiter')

const authRoutes = require('./routes/auth.routes')
const queryRoutes = require('./routes/query.routes')
const documentRoutes = require('./routes/document.routes')
const matterRoutes = require('./routes/matter.routes')
const documentQuestionsRoutes = require('./routes/documentQuestions.routes')

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(generalLimiter)

connectDB()

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/uploads', express.static(uploadsDir))
app.use('/api/auth', authRoutes)
app.use('/api/queries', queryRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/matters', matterRoutes)
app.use('/api/documents/:documentId/questions', documentQuestionsRoutes)

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

// Pin default port to 4000 as requested
const REQUESTED_PORT = Number(process.env.PORT) || 4000

function startServer(port = REQUESTED_PORT, attemptsLeft = 5) {
  const server = app
    .listen(port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`🚀 YourCase backend is running`)
      console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 Port: ${port}`)
      console.log(`🔍 Health: http://localhost:${port}/health`)
      if (REQUESTED_PORT && port !== REQUESTED_PORT) {
        console.warn(
          `⚠️  Requested port ${REQUESTED_PORT} was busy. Started on ${port} instead. Update your frontend API base URL if needed.`,
        )
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    })
    .on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        const nextPort = port + 1
        console.warn(
          `Port ${port} in use. Retrying on ${nextPort} (attempts left: ${attemptsLeft - 1})...`,
        )
        setTimeout(() => startServer(nextPort, attemptsLeft - 1), 500)
      } else {
        console.error('Failed to start server:', err)
        process.exit(1)
      }
    })

  return server
}

startServer()

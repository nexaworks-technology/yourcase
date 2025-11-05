const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const fs = require('fs')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const { connectDB } = require('./config/database')
const { errorHandler } = require('./middleware/errorHandler')
const { generalLimiter } = require('./middleware/rateLimiter')

const authRoutes = require('./routes/auth.routes')
const queryRoutes = require('./routes/query.routes')
const documentRoutes = require('./routes/document.routes')

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

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🚀 YourCase backend is running`)
  console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Port: ${PORT}`)
  console.log(`🔍 Health: http://localhost:${PORT}/health`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

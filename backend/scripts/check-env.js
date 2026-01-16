#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET']

const cwd = process.cwd()
const candidatePaths = [
  path.join(cwd, '.env'),
  path.join(cwd, '..', '.env'),
  path.join(cwd, '..', 'backend', '.env'),
  path.join(cwd, '..', '..', 'backend', '.env'),
]

let envPath
for (const candidate of candidatePaths) {
  if (fs.existsSync(candidate)) {
    envPath = candidate
    break
  }
}

const vars = {}
if (envPath) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...rest] = trimmed.split('=')
    vars[key] = rest.join('=').trim()
  })
}

const missing = REQUIRED_VARS.filter((key) => {
  const value = vars[key] ?? process.env[key]
  return value == null || String(value).trim() === ''
})

if (missing.length) {
  console.error('❌ Missing required environment variables:', missing.join(', '))
  if (envPath) {
    console.error(`  Checked file: ${envPath}`)
  } else {
    console.error('  No .env file detected. Provide env variables via process or create backend/.env')
  }
  process.exit(1)
}

console.log('✅ Backend env check passed')
if (envPath) {
  console.log(`  Using env file: ${envPath}`)
}

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const REQUIRED_VARS = ['VITE_API_BASE_URL']

const cwd = process.cwd()
const candidateFiles = [
  path.join(cwd, '.env.local'),
  path.join(cwd, '.env'),
  path.join(cwd, '..', '.env.frontend'),
  path.join(cwd, '..', '.env'),
]

let envPath
const vars = {}

for (const file of candidateFiles) {
  if (!fs.existsSync(file)) continue
  envPath = envPath ?? file
  const content = fs.readFileSync(file, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...rest] = trimmed.split('=')
    if (!(key in vars)) {
      vars[key] = rest.join('=').trim()
    }
  })
}

const missing = REQUIRED_VARS.filter((key) => {
  const value = vars[key] ?? process.env[key]
  return value == null || String(value).trim() === ''
})

if (missing.length) {
  console.error('❌ Missing required frontend env vars:', missing.join(', '))
  if (envPath) {
    console.error(`  Checked file: ${envPath}`)
  }
  process.exit(1)
}

console.log('✅ Frontend env check passed')
if (envPath) {
  console.log(`  Using env file: ${envPath}`)
}

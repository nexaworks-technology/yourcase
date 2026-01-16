#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

const projectRoot = process.cwd()

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: projectRoot,
      ...options,
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}

async function ensureNodeModules() {
  const fs = require('fs')
  const nodeModulesPath = path.join(projectRoot, 'node_modules')
  if (fs.existsSync(nodeModulesPath)) {
    return
  }

  console.log('📦 Installing backend dependencies...')
  await run('npm', ['install'])
}

async function main() {
  await ensureNodeModules()
  await run('node', ['scripts/check-env.js'])

  const envPath = process.env.DOTENV_CONFIG_PATH
  if (envPath) {
    console.log(`🔐 Using backend env file: ${envPath}`)
  }

  await run('npx', ['nodemon', '--watch', 'server.js', '--watch', 'config', 'server.js'])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

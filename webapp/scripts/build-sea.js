#!/usr/bin/env node

/**
 * Build Single Executable Application (SEA) using Node.js built-in feature
 * Requires Node.js 20+ 
 * 
 * Usage:
 *   node scripts/build-sea.js
 * 
 * Output:
 *   release/quotation-system (macOS/Linux)
 *   release/quotation-system.exe (Windows)
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')

// Check Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
if (majorVersion < 20) {
  console.error('Error: Node.js 20+ required for SEA. Current version:', nodeVersion)
  process.exit(1)
}

console.log('Building Single Executable Application...')
console.log('Node.js version:', nodeVersion)

// Create release directory
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true })
}

// Copy dist folder to release
const distSrc = path.join(rootDir, 'dist')
const distDst = path.join(releaseDir, 'dist')
if (fs.existsSync(distDst)) {
  fs.rmSync(distDst, { recursive: true })
}
fs.cpSync(distSrc, distDst, { recursive: true })
console.log('✓ Copied dist folder')

// Create startup script
const isWindows = process.platform === 'win32'
const ext = isWindows ? '.exe' : ''
const outputName = `quotation-system${ext}`
const outputPath = path.join(releaseDir, outputName)

// For now, create a simple wrapper script
// Full SEA requires postject which is complex with ESM
if (isWindows) {
  // Windows: create a batch wrapper
  const batContent = `@echo off
chcp 65001 >nul
echo Starting Quotation System...
cd /d "%~dp0"
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)
if not exist "dist" (
  echo Building frontend...
  call npm run build
)
node server.js
pause
`
  fs.writeFileSync(path.join(releaseDir, 'start.bat'), batContent)
  console.log('✓ Created start.bat')
} else {
  // macOS/Linux: create a shell wrapper
  const shContent = `#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Quotation System..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
if [ ! -d "dist" ]; then
  echo "Building frontend..."
  npm run build
fi
node server.js
`
  fs.writeFileSync(path.join(releaseDir, 'start.sh'), shContent)
  fs.chmodSync(path.join(releaseDir, 'start.sh'), 0o755)
  console.log('✓ Created start.sh')
}

// Copy essential files
const filesToCopy = ['server.js', 'package.json', 'sea-config.json']
for (const file of filesToCopy) {
  const src = path.join(rootDir, file)
  const dst = path.join(releaseDir, file)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
  }
}
console.log('✓ Copied server files')

// Create README for release
const readmeContent = `# 报价单管理系统

## 运行方式

${isWindows ? '双击运行 `start.bat`' : '运行 `./start.sh`'}

## 访问

打开浏览器访问 http://localhost:3000

## 注意

首次运行会自动安装依赖，请确保已安装 Node.js 18+
https://nodejs.org/
`

fs.writeFileSync(path.join(releaseDir, 'README.txt'), readmeContent)

console.log('')
console.log('✓ Build complete!')
console.log('Release folder:', releaseDir)
console.log('')
console.log('To distribute:')
console.log('1. Zip the release folder')
console.log('2. Send to customer')
console.log('3. Customer extracts and runs start.bat/start.sh')
console.log('')
console.log('Note: Customer needs Node.js installed.')
console.log('For true standalone executable, use: npm run package:nexe')

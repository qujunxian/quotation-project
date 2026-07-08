#!/usr/bin/env node

/**
 * Build release package for distribution
 * Creates a complete package that customers can run with Node.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')

console.log('='.repeat(60))
console.log('Building Quotation System Release Package')
console.log('='.repeat(60))
console.log()

// Create release directory
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true })
}

// Copy dist folder
const distSrc = path.join(rootDir, 'dist')
const distDst = path.join(releaseDir, 'dist')
if (fs.existsSync(distDst)) {
  fs.rmSync(distDst, { recursive: true })
}
fs.cpSync(distSrc, distDst, { recursive: true })
console.log('✓ Copied dist folder')

// Copy server files
const filesToCopy = ['package.json', 'package-lock.json']
for (const file of filesToCopy) {
  const src = path.join(rootDir, file)
  const dst = path.join(releaseDir, file)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
  }
}

// Copy server.js from src/server
const serverSrc = path.join(rootDir, 'src/server/server.js')
const serverDst = path.join(releaseDir, 'server.js')
if (fs.existsSync(serverSrc)) {
  fs.copyFileSync(serverSrc, serverDst)
}
console.log('✓ Copied server files')

// Create Windows startup script
const batContent = `@echo off
chcp 65001 >nul
title 报价单管理系统
echo ==========================================
echo     报价单管理系统
echo ==========================================
echo.

:: Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    echo 请先安装 Node.js 18+：https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js 检测通过
echo.

:: Install dependencies
if not exist "node_modules" (
    echo [2/3] 正在安装依赖，请稍候...
    call npm install --production
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [2/3] 依赖已安装
)
echo.

:: Start server
echo [3/3] 启动服务...
echo.
echo 请打开浏览器访问：http://localhost:3000
echo 按 Ctrl+C 停止服务
echo.
echo ==========================================
echo.

node server.js

pause
`

fs.writeFileSync(path.join(releaseDir, '启动系统.bat'), batContent)
console.log('✓ Created 启动系统.bat')

// Create macOS/Linux startup script
const shContent = `#!/bin/bash

echo "=========================================="
echo "    报价单管理系统"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js"
    echo "请先安装 Node.js 18+：https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

echo "[1/3] Node.js 检测通过"
echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "[2/3] 正在安装依赖，请稍候..."
    npm install --production
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        read -p "按回车键退出..."
        exit 1
    fi
else
    echo "[2/3] 依赖已安装"
fi
echo ""

# Start server
echo "[3/3] 启动服务..."
echo ""
echo "请打开浏览器访问：http://localhost:3000"
echo "按 Ctrl+C 停止服务"
echo ""
echo "=========================================="
echo ""

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2 && open http://localhost:3000 &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sleep 2 && xdg-open http://localhost:3000 &
fi

node server.js
`

fs.writeFileSync(path.join(releaseDir, '启动系统.sh'), shContent)
fs.chmodSync(path.join(releaseDir, '启动系统.sh'), 0o755)
console.log('✓ Created 启动系统.sh')

// Create README
const readmeContent = `# 报价单管理系统 v2.0

## 快速开始

### Windows 用户
双击运行 **启动系统.bat**

### macOS/Linux 用户
在终端运行：
\`\`\`bash
./启动系统.sh
\`\`\`

## 访问系统

打开浏览器访问：http://localhost:3000

## 系统要求

- Node.js 18+ （首次运行会自动检测并提示安装）
- 下载地址：https://nodejs.org/

## 常见问题

**Q: 提示未检测到 Node.js？**
A: 请访问 https://nodejs.org/ 下载并安装 LTS 版本

**Q: 如何停止服务？**
A: 在运行窗口按 Ctrl+C

**Q: 数据存储在哪里？**
A: 数据存储在 quotations.db 文件中，请勿删除

## 功能说明

- 创建和管理报价单
- 自动计算安装费、设备费、税点、总计
- 导出 Excel 报表
- 数据持久化存储

---
技术支持请联系开发团队
`

fs.writeFileSync(path.join(releaseDir, '使用说明.txt'), readmeContent)
console.log('✓ Created 使用说明.txt')

console.log()
console.log('='.repeat(60))
console.log('Release package created successfully!')
console.log('='.repeat(60))
console.log()
console.log('输出目录:', releaseDir)
console.log()
console.log('发布步骤:')
console.log('1. 将 release 文件夹压缩为 zip')
console.log('2. 发送给客户')
console.log('3. 客户解压后双击启动脚本')
console.log()
console.log('注意: 客户需要安装 Node.js 18+')
console.log('='.repeat(60))

@echo off
chcp 65001 >nul
echo 正在启动报价单管理系统...
echo.

:: Check if node is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo 错误：未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    npm install
)

:: Build frontend if dist doesn't exist
if not exist "dist" (
    echo 正在构建前端，请稍候...
    npm run build
)

echo.
echo 启动服务...
start http://localhost:3000
node server.js

pause

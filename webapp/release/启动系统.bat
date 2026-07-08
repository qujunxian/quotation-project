@echo off
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

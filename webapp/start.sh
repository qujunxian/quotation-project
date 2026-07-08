#!/bin/bash

echo "正在启动报价单管理系统..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "错误：未检测到 Node.js，请先安装 Node.js"
    echo "下载地址：https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
fi

# Build frontend if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "正在构建前端，请稍候..."
    npm run build
fi

echo ""
echo "启动服务..."
echo "请在浏览器中访问：http://localhost:3000"
echo ""

# Open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
# Open browser (Linux)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 &
fi

node server.js

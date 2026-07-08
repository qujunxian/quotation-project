#!/bin/bash

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

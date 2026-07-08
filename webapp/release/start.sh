#!/bin/bash
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

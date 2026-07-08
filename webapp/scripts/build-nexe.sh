#!/bin/bash

# Build script for nexe with Python 3 support on macOS

echo "=========================================="
echo "Building Quotation System with nexe"
echo "=========================================="
echo ""

# Check if python exists, if not create alias
if ! command -v python &> /dev/null; then
    if command -v python3 &> /dev/null; then
        echo "Creating python alias for python3..."
        export PATH="$HOME/.local/bin:$PATH"
        mkdir -p "$HOME/.local/bin"
        ln -sf $(which python3) "$HOME/.local/bin/python"
    else
        echo "Error: Python 3 not found"
        exit 1
    fi
fi

echo "Python version:"
python --version
echo ""

# Prepare
echo "Building frontend..."
npm run build

mkdir -p release

# Build with nexe
echo ""
echo "Building executable with nexe..."
echo "This may take 10-30 minutes on first run..."
echo ""

npx nexe server.js \
    -o release/quotation-system-macos \
    --build \
    --target host \
    --verbose

echo ""
echo "=========================================="
if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "Output: release/quotation-system-macos"
else
    echo "Build failed!"
    echo "Please check error messages above"
fi
echo "=========================================="

@echo off
chcp 65001 >nul
echo ==========================================
echo Building Quotation System for Windows
echo ==========================================
echo.

:: Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    pause
    exit /b 1
)

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python
    echo 请安装 Python 3: https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] 环境检测通过
echo.

:: Prepare
echo [2/4] 构建前端...
call npm run build
if errorlevel 1 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

if not exist "release" mkdir release

echo.
echo [3/4] 编译可执行文件...
echo 首次编译需要 10-30 分钟，请耐心等待...
echo.

:: Build with nexe for Windows
npx nexe server.js ^
    -o release\quotation-system-win.exe ^
    --build ^
    --target windows-x64-18.15.0 ^
    --verbose

if errorlevel 1 (
    echo.
    echo [错误] 编译失败
    echo 请检查上方错误信息
    pause
    exit /b 1
)

echo.
echo [4/4] 复制资源文件...
xcopy /E /I /Y dist release\dist
xcopy /Y package.json release\
xcopy /Y package-lock.json release\

echo.
echo ==========================================
echo 编译成功！
echo 输出文件: release\quotation-system-win.exe
echo ==========================================
echo.
echo 发布步骤:
echo 1. 将 release 文件夹压缩为 zip
echo 2. 发送给客户
echo 3. 客户双击 quotation-system-win.exe 运行
echo.
pause

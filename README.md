# 报价单管理系统

## 快速开始

### 开发模式
```bash
npm install
npm run dev
```

### 生产部署

**方式1：一键启动（开发/测试）**

先构建前端，然后启动后端：
```bash
npm run build
npm start
```

**方式2：打包发布（推荐给客户）**

```bash
npm run package
```

打包后会创建 `release/` 文件夹，包含：
- `启动系统.bat` - Windows 启动脚本
- `启动系统.sh` - macOS/Linux 启动脚本
- `dist/` - 前端构建文件
- `使用说明.txt` - 用户使用指南

**发布步骤:**
1. 运行 `npm run package`
2. 将 `release/` 文件夹压缩为 zip
3. 发送给客户
4. 客户解压后双击启动脚本

## 客户使用说明

### 系统要求
- Node.js 18+ （首次运行会自动检测）
- 下载地址：https://nodejs.org/

### Windows 用户
1. 解压文件
2. 双击 `启动系统.bat`
3. 浏览器自动打开 http://localhost:3000

### macOS/Linux 用户
1. 解压文件
2. 打开终端，进入文件夹
3. 运行 `./启动系统.sh`
4. 浏览器自动打开 http://localhost:3000

## 自动打包（推荐）

本项目配置了 GitHub Actions，可以自动打包 Windows、macOS、Linux 的可执行文件。

### 使用方法

1. **Fork 或 Push 代码到 GitHub**
2. **进入 Actions 页面**：点击仓库的 Actions 标签
3. **手动触发工作流**：
   - 点击左侧 "Build Executables"
   - 点击 "Run workflow"
   - 选择分支，点击 "Run workflow"
4. **等待构建完成**（约 15-30 分钟）
5. **下载构建产物**：
   - 进入完成的 workflow
   - 在 Artifacts 部分下载对应平台的 zip 文件

### 自动触发

- 推送到 `main` 或 `master` 分支时自动触发
- 创建 Tag 时会自动发布 Release

## 本地打包

### macOS (M1/M2 ARM64)

由于 nexe 在 ARM64 Mac 上编译复杂，推荐使用：

```bash
# 方式1：简单打包（客户需要 Node.js）
npm run package

# 方式2：使用 GitHub Actions 打包（推荐）
# 见上方 "自动打包" 部分
```

### Windows

在 Windows 上本地打包相对简单：

```bash
npm run package:nexe
```

或双击运行：
```
scripts/build-nexe-win.bat
```

## 项目结构

```
quotation-project/
├── .github/
│   └── workflows/
│       └── build.yml      # GitHub Actions 配置
├── src/
│   ├── client/            # 前端源码
│   │   ├── components/    # React 组件
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── server/            # 后端源码
│       └── server.js
├── scripts/               # 构建脚本
├── public/                # 静态资源
├── dist/                  # 前端构建输出（gitignore）
├── release/               # 发布包输出（gitignore）
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## 技术栈

- 前端：React + Ant Design + Vite
- 后端：Node.js + Express + SQLite
- 打包：nexe + GitHub Actions

## 跨平台打包说明

| 平台 | 本地打包 | GitHub Actions | 难度 |
|------|---------|----------------|------|
| Windows | ✅ 简单 | ✅ 支持 | ⭐ |
| macOS Intel | ✅ 中等 | ✅ 支持 | ⭐⭐ |
| macOS ARM64 (M1/M2) | ❌ 困难 | ✅ 支持 | ⭐⭐⭐ |
| Linux | ✅ 中等 | ✅ 支持 | ⭐⭐ |

**建议**：M2 Mac 用户使用 GitHub Actions 打包 Windows 和 Linux 版本。

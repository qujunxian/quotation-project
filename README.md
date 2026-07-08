# 报价单管理系统

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
cd webapp
npm run package

# 方式2：使用 GitHub Actions 打包（推荐）
# 见上方 "自动打包" 部分
```

### Windows

在 Windows 上本地打包相对简单：

```bash
cd webapp
npm run package:nexe
```

或双击运行：
```
scripts\build-nexe-win.bat
```

## 项目结构

```
quotation-project/
├── .github/
│   └── workflows/
│       └── build.yml      # GitHub Actions 配置
├── webapp/
│   ├── src/               # 前端源码
│   ├── scripts/           # 构建脚本
│   ├── server.js          # 后端服务
│   └── package.json       # 项目配置
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

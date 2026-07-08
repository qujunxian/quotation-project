# 报价单管理系统

## 快速开始

### 开发模式
```bash
npm install
npm run dev
```

### 生产部署

**方式一：一键启动（开发/测试）**

Windows: 双击 `start.bat`

macOS/Linux: `./start.sh`

**方式二：打包发布（推荐给客户）**

```bash
npm run package
```

打包后会创建 `release/` 文件夹，包含：
- `启动系统.bat` - Windows 启动脚本
- `启动系统.sh` - macOS/Linux 启动脚本  
- `dist/` - 前端构建文件
- `server.js` - 后端服务
- `使用说明.txt` - 用户使用指南

**发布步骤：**
1. 运行 `npm run package`
2. 将 `release/` 文件夹压缩成 zip
3. 发送给客户
4. 客户解压后双击启动脚本

## 客户使用说明

### 系统要求
- Node.js 18+ （首次启动会自动检测）
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

## 完整打包（单文件 EXE）

如果需要真正的单文件可执行程序（无需客户安装 Node.js）：

```bash
npm run package:nexe
```

**注意：**
- 首次打包需要编译 Node.js，耗时 10-30 分钟
- 需要安装 Python 3 和 Xcode Command Line Tools (macOS)
- 生成的文件在 `release/quotation-system-macos`

## 项目结构

```
webapp/
├── src/                    # 前端源码
├── scripts/               # 构建脚本
├── release/               # 发布包输出
├── server.js              # 后端服务
├── start.bat / start.sh   # 开发启动脚本
└── package.json           # 项目配置
```

## API 接口

- `GET /api/quotations` - 获取报价单列表
- `GET /api/quotations/:id` - 获取单个报价单
- `POST /api/quotations` - 创建报价单
- `PUT /api/quotations/:id` - 更新报价单
- `DELETE /api/quotations/:id` - 删除报价单

## 技术栈

- 前端：React + Ant Design + Vite
- 后端：Node.js + Express + SQLite
- 打包：nexe / 自定义脚本

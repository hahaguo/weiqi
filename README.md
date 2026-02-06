# 围棋教学游戏

一个功能丰富的围棋教学游戏，使用 React + Vite 构建。支持人机对弈和双人对弈。

## ✨ 功能特点

- 🤖 **人机对弈**：三种AI难度（简单/中等/困难），适合不同水平的玩家
- 👥 **双人对弈**：本地双人对战模式
- 📚 **规则教程**：详细的围棋规则讲解，包括气、提子、劫争、眼位等概念
- 💡 **智能提示**：实时落子建议系统，帮助初学者学习
- 🧩 **死活题练习**：5道经典死活题，从简单到困难
- ↩️ **悔棋复盘**：支持悔棋和查看对局历史
- 🎯 **多种棋盘尺寸**：支持 9×9、13×13、19×19 三种棋盘
- ✨ **精美界面**：现代化的UI设计和流畅的动画效果

## 🤖 人机对弈功能

### AI难度级别

- **简单** 😊：适合初学者，30%随机性，思考时间0.5秒
  - 基础战术：救子、提子
  - 偶尔会犯错，给玩家练习机会

- **中等** 🤔：适合进阶玩家，15%随机性，思考时间1秒
  - 中级策略：连接、防守、围地
  - 能进行基本战术配合

- **困难** 😈：适合高手，5%随机性，思考时间2秒
  - 完整规则：切断、攻击、关键点
  - 接近业余初段水平

### AI特性

- 🧠 基于启发式规则的评估系统
- ⚡ 性能优化，大棋盘也流畅
- 💭 显示AI思考过程和策略
- 🎨 精美的思考动画效果
- 🔌 可扩展架构，预留云端AI接口

## 围棋规则实现

本游戏实现了完整的围棋规则：
- 落子系统
- 气的计算
- 提子规则
- 劫争规则
- 自杀手禁止
- 连接和眼位识别

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
weiqi/
├── src/
│   ├── ai/                     # AI模块
│   │   ├── goAI.js            # AI核心引擎
│   │   └── aiEvaluators.js    # 评估函数库
│   ├── api/                    # API服务层
│   │   └── aiService.js       # AI服务抽象层
│   ├── components/
│   │   ├── Board.jsx          # 棋盘组件
│   │   ├── Board.css
│   │   ├── AISettings.jsx     # AI设置面板
│   │   ├── AISettings.css
│   │   ├── AIGame.jsx         # 人机对弈组件
│   │   ├── AIGame.css
│   │   ├── TsumegoMode.jsx    # 死活题模式
│   │   ├── TsumegoMode.css
│   │   ├── Tutorial.jsx       # 教程组件
│   │   └── Tutorial.css
│   ├── goLogic.js             # 围棋核心逻辑
│   ├── tsumegoData.js         # 死活题数据
│   ├── App.jsx                # 主应用组件
│   ├── App.css
│   ├── main.jsx               # 入口文件
│   └── index.css
├── Dockerfile                  # Docker构建文件
├── docker-compose.yml          # Docker编排文件
├── nginx.conf                  # Nginx配置
├── index.html
├── package.json
└── vite.config.js
```

## 技术栈

- React 18
- Vite 4
- 纯 JavaScript（无需构建工具）
- CSS3 动画

## 🎓 学习围棋

如果你是围棋初学者，建议：
1. 先阅读"规则教程"了解基本规则
2. 从 9×9 小棋盘开始练习
3. 选择"简单"难度的AI对弈
4. 使用"智能提示"功能学习基本策略
5. 做死活题提高计算能力
6. 逐步挑战更高难度和更大的棋盘

## 🐳 Docker部署

### 使用Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 访问应用
http://localhost:8080

# 停止服务
docker-compose down
```

### 使用Dockerfile

```bash
# 构建镜像
docker build -t weiqi-game .

# 运行容器
docker run -d -p 8080:80 weiqi-game

# 访问应用
http://localhost:8080
```

## 🎯 版本历史

- **v1.1.0** (2026-02-06)
  - ✨ 添加人机对弈功能
  - 🤖 三种AI难度级别
  - 🎨 全新的AI设置界面
  - ⚡ 性能优化和架构改进

- **v1.0.0** (2026-02-06)
  - 🎉 初始版本发布
  - 双人对弈、死活题、规则教程

## 贡献

欢迎提交问题和改进建议！

## 许可

MIT License

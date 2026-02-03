# 围棋教学游戏

一个功能丰富的围棋教学游戏，使用 React + Vite 构建。

## 功能特点

- 📚 **规则教程**：详细的围棋规则讲解，包括气、提子、劫争、眼位等概念
- 💡 **智能提示**：实时落子建议系统，帮助初学者学习
- 🧩 **死活题练习**：5道经典死活题，从简单到困难
- ↩️ **悔棋复盘**：支持悔棋和查看对局历史
- 🎯 **多种棋盘尺寸**：支持 9×9、13×13、19×19 三种棋盘
- ✨ **精美界面**：现代化的UI设计和流畅的动画效果

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

## 项目结构

```
weiqi/
├── src/
│   ├── components/
│   │   ├── Board.jsx          # 棋盘组件
│   │   ├── Board.css
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
├── index.html
├── package.json
└── vite.config.js
```

## 技术栈

- React 18
- Vite 4
- 纯 JavaScript（无需构建工具）
- CSS3 动画

## 学习围棋

如果你是围棋初学者，建议：
1. 先阅读"规则教程"了解基本规则
2. 从 9×9 小棋盘开始练习
3. 使用"智能提示"功能学习基本策略
4. 做死活题提高计算能力
5. 逐步挑战更大的棋盘

## 贡献

欢迎提交问题和改进建议！

## 许可

MIT License

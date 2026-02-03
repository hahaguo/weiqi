# iPad 适配说明

## 优化内容总览

已为围棋教学游戏添加完整的 iPad 适配支持，包括横屏、竖屏以及触摸交互优化。

## 主要改进

### 1. 视口和元数据优化 (index.html:5-8)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="format-detection" content="telephone=no" />
```

- 禁止用户缩放，提供原生应用体验
- 支持全屏模式
- 禁用电话号码自动识别

### 2. 棋盘触摸交互优化 (components/Board.jsx:13-56)

**动态尺寸计算**
- iPad 横屏：最大 70vh 或 700px
- iPad 竖屏：最大 85vw 或 600px
- 自适应屏幕旋转

**触摸事件处理**
- 添加 `touchStart` / `touchEnd` / `touchCancel` 事件
- 实时触摸预览效果
- 防止默认滚动行为

**关键代码**
```javascript
const handleTouchStart = (e, row, col) => {
  e.preventDefault();
  if (!stoneColor) {
    setTouchPreview({ row, col });
  }
};
```

### 3. 棋盘样式优化 (components/Board.css)

**触摸优化**
```css
/* 禁用触摸高亮 */
.cell-clickable {
  -webkit-tap-highlight-color: transparent;
}

/* 触摸预览动画 */
.touch-preview {
  animation: touchPulse 0.3s ease-out;
}

/* iPad 横屏 */
@media only screen and (min-width: 768px) and (max-width: 1366px) and (orientation: landscape) {
  .board-svg {
    max-height: 65vh;
  }
}
```

### 4. 全局触摸优化 (index.css:5-76)

**防止意外操作**
```css
body {
  overscroll-behavior: none;  /* 禁止弹性滚动 */
  user-select: none;           /* 禁止文本选择 */
  -webkit-touch-callout: none; /* 禁止长按菜单 */
}

button {
  -webkit-appearance: none;
  touch-action: manipulation;
  min-height: 44px;  /* Apple HIG 推荐 */
}
```

### 5. 主应用布局优化 (App.css:338-531)

**iPad 横屏 (768px - 1366px)**
- 特性网格：4列布局
- 游戏内容：棋盘 + 350px 侧边栏
- 按钮最小高度：48px

**iPad 竖屏 (768px - 1024px)**
- 特性网格：2列布局
- 游戏内容：单列堆叠
- 信息面板居中，最大宽度 600px
- 按钮最小高度：56px

**触摸设备通用优化**
```css
@media (hover: none) {
  button {
    min-height: 44px;
    min-width: 44px;
  }

  button:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}
```

### 6. 教程组件优化 (components/Tutorial.css:228-318)

**iPad 横屏**
- 模态框最大宽度：800px
- 最大高度：85vh
- 按钮最小高度：52px

**iPad 竖屏**
- 模态框宽度：90%
- 字体大小增大（17px）
- 按钮最小高度：56px

**进度点击区域扩大**
```css
@media (hover: none) {
  .progress-dot {
    width: 16px;
    height: 16px;  /* 从 12px 增大到 16px */
  }
}
```

### 7. 死活题组件优化 (components/TsumegoMode.css:178-273)

**iPad 横屏**
- 内容布局：棋盘 + 350px 信息栏
- 紧凑按钮布局

**iPad 竖屏**
- 单列堆叠布局
- 信息栏最大宽度 600px
- 消息框字体 17px

## 设计规范遵循

### Apple Human Interface Guidelines
- ✅ 最小触摸目标：44x44 pt
- ✅ 重要按钮：56+ pt
- ✅ 横屏模式优化布局
- ✅ 支持 Safe Area

### 触摸交互最佳实践
- ✅ 禁用长按菜单
- ✅ 禁用文本选择
- ✅ 触摸反馈动画
- ✅ 防止意外滚动

### 响应式断点
- 手机：< 768px
- iPad 竖屏：768px - 1024px
- iPad 横屏：768px - 1366px
- 桌面：> 1366px

## 测试建议

在实际 iPad 设备上测试以下场景：

1. **横屏模式**
   - 棋盘是否占据合理空间
   - 侧边栏控制是否方便操作
   - 特性卡片 4 列布局是否美观

2. **竖屏模式**
   - 棋盘是否自适应宽度
   - 按钮是否足够大，易于点击
   - 内容是否居中对齐

3. **触摸交互**
   - 落子是否准确
   - 触摸预览是否清晰
   - 按钮点击区域是否足够大
   - 无意外选择文本或菜单

4. **旋转切换**
   - 横竖屏切换是否流畅
   - 布局是否立即响应
   - 棋盘尺寸是否正确重算

## 浏览器兼容性

- Safari (iOS 12+)
- Chrome (iOS/Android)
- 支持触摸事件的现代浏览器

## 性能优化

- 使用 CSS transform 而非 position 变化
- 防抖屏幕旋转事件
- 触摸事件使用 `preventDefault()` 避免延迟
- 禁用不必要的悬停效果（触摸设备）

---

所有改进已完成并集成到项目中。游戏现在可以在 iPad 上提供流畅的原生应用般体验！

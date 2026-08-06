## 新网格粗体 · Neo-Grid Bold

### 设计理念
编辑新粗野主义 × 霓虹黄（#E5FF00）单色强调 × 米白纸（#F9F7F1）。自信的编辑图形语言——大写展示标题、数据大字、对比网格。单一霓虹黄在克制的中性色板上是绝对主角。

### 设计原则

- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **网格结构即装饰**——模数化网格作为视觉骨架，不依赖额外装饰
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #E6FF3D | 主强调色 |
| `--color-secondary` | #8A8A85 | 辅强调色 |
| `--color-surface` | #F5F4EF | 默认表面 |
| `--color-on-surface` | #0A0A0A | 主文字色 |
| `--color-on-surface-variant` | #8A8A85 | 次级文字 |
| `--color-outline` | #0A0A0A | 主边框 |
| `--color-surface-container-low` | #F5F4EF | 卡片容器 |
| | | |
| `--bg` | #ECECE8 | |
| `--ink` | #0A0A0A | |
| `--paper` | #F5F4EF | |
| `--accent` | #E6FF3D | |
| `--line` | #0A0A0A | |
| `--muted` | #8A8A85 | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #E6FF3D | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F5F4EF | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #0A0A0A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #8A8A85 | 次级交互元素 |
| 边框色 | `--color-outline` | #0A0A0A |  |
| 表面变体 | `--bg` | #ECECE8 |  |
| 文字变体 | `--ink` | #0A0A0A |  |



### 排版规则
大写展示标题 48-120px；正文 Inter 15-17px 行高 1.55；数据大字 80-160px 霓虹黄；分割线 1px rgba(0,0,0,0.12)；阴影 0 2px 8px / 0 8px 30px 双级。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | Inter, system-ui, sans-serif | 展示/标题 |
| `--font-body` | Inter, system-ui, sans-serif | 正文 |
| `--font-mono` | ui-monospace, SF Mono, Consolas, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| 24px |
| 16px |
| 132px |
| 88px |
| 56px |
| 28px |
| 156px |
| 96px |
| 13px |
| 92px |
| 22px |
| 36px |
| 20px |
| 48px |
| 76px |
| 240px |
| 30px |
| 84px |
| 14px |
| 320px |
| 18px |
| 38px |
| 124px |
| 44px |
| 32px |
| 21px |
| 15px |
| 17px |
| 26px |
| 11px |
| 12px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — neo-grid-bold/brand.json
- **布局层** (`layout.json`): 间距系统 — neo-grid-bold/layout.json
- **真相源** (`template.html`): CSS :root 变量是唯一真相源，brand.json 和 layout.json 从此派生

#### 间距
- `--space-page-wmax`: 1200px
- `--space-page-pad`: 32px
- `--space-gap`: 24px
- `--space-gutter`: 24px

#### 动效
- `--ease-standard`: 0.18s ease
- `--duration-base`: 150ms

#### 圆角
- `--radius-base`: 4px
- `--radius-sm`: 2px
- `--radius-pill`: 999px

#### 阴影
- `--elevation-sm`: 0 1px 3px rgba(0,0,0,0.06)
- `--elevation-md`: 0 8px 30px rgba(0,0,0,0.1)


## 模板泥板 · Stencil & Tablet

### 设计理念
骨白纸（#F5F0E8）× 模板切割标题 × 六色大地调色板。考古学遇见品牌——模板字体让人想起文物标签和档案盒，大地色系（赭石/洋红/橙/青/蓝/芥末/橄榄）来自出土颜料。像田野手册而非幻灯片。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #3F73B7 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F4EFE0 | 默认表面 |
| `--color-on-surface` | #0A0A0A | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #F4EFE0 | 卡片容器 |
| | | |
| `--bone` | #E2DCC9 | |
| `--black` | #000000 | |
| `--ink` | #0A0A0A | |
| `--paper` | #F4EFE0 | |
| `--sienna` | #A06A3C | |
| `--magenta` | #C73B7A | |
| `--orange` | #EE7A2E | |
| `--teal` | #2D7E73 | |
| `--blue` | #3F73B7 | |
| `--mustard` | #D8A93B | |
| `--olive` | #6F7A2E | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #3F73B7 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F4EFE0 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #0A0A0A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 调色板色 | `--bone` | #E2DCC9 |  |
| 调色板色 | `--black` | #000000 |  |



### 排版规则
模板切割展示字体 48-120px；正文 Inter 15-17px 行高 1.55；六色大地强调系统；分割线 1px rgba(0,0,0,0.1)；阴影 0 2px 8px / 0 8px 30px 双级。

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
| 32px |
| 24px |
| 22px |
| 220px |
| 30px |
| 28px |
| 36px |
| 240px |
| 540px |
| 120px |
| 34px |
| 20px |
| 18px |
| min(110px, 12vh) |
| 92px |
| 64px |
| 26px |
| 160px |
| 40px |
| 320px |
| 60px |
| 130px |
| 56px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — stencil-tablet/brand.json
- **布局层** (`layout.json`): 间距系统 — stencil-tablet/layout.json
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


## 羊皮纸 · Vellum

### 设计理念
深海军蓝画布（#2A3870）× 暖黄 Cormorant 衬线 × 灰绿单色强调（#4A8070）。安静学者美学——研究综合/白皮书/学术简报的首选。Cormorant 衬线在暗底上像羊皮纸手稿的烫金文字。

### 设计原则

- **深色底戏剧性**——暗色画布制造视觉张力，强调色如灯塔信号
- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Cormorant Garamond`，正文退为系统字体
- **vw 响应式排版**——字号跟随视口宽度自动缩放，适配全屏演示
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **纸纹理**——叠加噪点/颗粒质感，模拟印刷品的触感



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #3a7878 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #2a3870 | 默认表面 |
| `--color-on-surface` | #E8D85C | 主文字色 |
| `--color-on-surface-variant` | #888880 | 次级文字 |
| `--color-outline` | rgba(232, 216, 92, 0.20) | 主边框 |
| `--color-surface-container-low` | #343f80 | 卡片容器 |
| | | |
| `--c-bg` | #2a3870 | |
| `--c-bg-alt` | #343f80 | |
| `--c-bg-light` | #2a3870 | |
| `--c-bg-light-alt` | #343f80 | |
| `--c-fg` | #E8D85C | |
| `--c-fg-2` | rgba(232, 216, 92, 0.62) | |
| `--c-fg-3` | rgba(232, 216, 92, 0.32) | |
| `--c-fg-light` | #E8D85C | |
| `--c-fg-light-2` | rgba(232, 216, 92, 0.62) | |
| `--c-fg-light-3` | rgba(232, 216, 92, 0.32) | |
| `--c-accent` | #3a7878 | |
| `--c-emphasis` | #F5E168 | |
| `--c-border` | rgba(232, 216, 92, 0.20) | |
| `--c-border-light` | rgba(232, 216, 92, 0.20) | |
| `--f-display` | "Cormorant Garamond", "Noto Serif SC", Georgia, serif | |
| `--f-heading` | "Cormorant Garamond", "Noto Serif SC", Georgia, serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "Courier Prime", "Courier New", monospace | |
| `--f-annotation` | "Courier Prime", "Courier New", monospace | |
| `--sz-display` | 11vw | |
| `--sz-h1` | 7vw | |
| `--sz-h2` | 4vw | |
| `--sz-h3` | 2.4vw | |
| `--sz-lead` | 1.5vw | |
| `--sz-body` | 1.05vw | |
| `--sz-caption` | 0.85vw | |
| `--sz-label` | 0.72vw | |
| `--pad-x` | 6vw | |
| `--pad-y` | 6vh | |
| `--gap-lg` | 5vh | |
| `--gap-md` | 3vh | |
| `--gap-sm` | 1.5vh | |
| `--ease-slide` | cubic-bezier(0.77, 0, 0.175, 1) | |
| `--dur-slide` | 0s | |
| `--ease-enter` | cubic-bezier(0.16, 1, 0.3, 1) | |
| `--dur-enter` | 0s | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #3a7878 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #2a3870 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #E8D85C | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(232, 216, 92, 0.20) |  |
| 表面变体 | `--c-bg` | #2a3870 |  |
| 表面变体 | `--c-bg-alt` | #343f80 |  |



### 排版规则
Cormorant 衬线展示标题 48-120px；正文 Inter 15-17px 行高 1.6；间距 32px/24px/16px/12px 四级；过渡动效 0.35s/0.25s 快慢两速；分割线 1px rgba(255,255,255,0.1)。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | "Cormorant Garamond", "Noto Serif SC", Georgia, serif | 展示/标题 |
| `--font-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | 正文 |
| `--font-mono` | "Courier Prime", "Courier New", monospace | 等宽/代码 |
| `--f-display` | "Cormorant Garamond", "Noto Serif SC", Georgia, serif | |
| `--f-heading` | "Cormorant Garamond", "Noto Serif SC", Georgia, serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "Courier Prime", "Courier New", monospace | |
| `--f-annotation` | "Courier Prime", "Courier New", monospace | |


### 排版尺度

| 层级 | Token | 值 |
|------|-------|----|
| Display | `--sz-display` | 11vw |
| H1 | `--sz-h1` | 7vw |
| H2 | `--sz-h2` | 4vw |
| H3 | `--sz-h3` | 2.4vw |
| Lead | `--sz-lead` | 1.5vw |
| Body | `--sz-body` | 1.05vw |
| Caption | `--sz-caption` | 0.85vw |
| Label | `--sz-label` | 0.72vw |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — vellum/brand.json
- **布局层** (`layout.json`): 间距系统 — vellum/layout.json
- **真相源** (`template.html`): CSS :root 变量是唯一真相源，brand.json 和 layout.json 从此派生

#### 间距
- `--space-page-wmax`: 1200px
- `--space-page-pad`: 6vw
- `--space-gap`: 5vh
- `--space-gutter`: 5vh

#### 动效
- `--ease-standard`: cubic-bezier(0.77, 0, 0.175, 1)
- `--duration-base`: 150ms
- `--ease-slide`: cubic-bezier(0.77, 0, 0.175, 1)
- `--ease-enter`: cubic-bezier(0.16, 1, 0.3, 1)

#### 圆角
- `--radius-base`: 4px
- `--radius-sm`: 2px
- `--radius-pill`: 999px

#### 阴影
- `--elevation-sm`: 0 1px 3px rgba(0,0,0,0.06)
- `--elevation-md`: 0 8px 30px rgba(0,0,0,0.1)


## 信号 · Signal

### 设计理念
深海军蓝画布（#1C2644）× 骨白纸（#F5F1EB）× 哑金单色强调（#C4A24E）。机构的安静重量——投资者/董事会/咨询交付物的首选。海军蓝 + 金色的克制搭配传递"可信"而非"张扬"。

### 设计原则

- **深色底戏剧性**——暗色画布制造视觉张力，强调色如灯塔信号
- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Source Serif 4`，正文退为系统字体
- **vw 响应式排版**——字号跟随视口宽度自动缩放，适配全屏演示
- **高对比度**——文字与背景对比强烈，确保远距离可读性



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #c8a870 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #1c2644 | 默认表面 |
| `--color-on-surface` | #e2dcd0 | 主文字色 |
| `--color-on-surface-variant` | #888880 | 次级文字 |
| `--color-outline` | #2e3d5c | 主边框 |
| `--color-surface-container-low` | #232f55 | 卡片容器 |
| | | |
| `--c-bg` | #1c2644 | |
| `--c-bg-alt` | #232f55 | |
| `--c-bg-light` | #f0ece3 | |
| `--c-bg-light-alt` | #e6e0d4 | |
| `--c-fg` | #e2dcd0 | |
| `--c-fg-2` | #8a96a8 | |
| `--c-fg-3` | #4e5a6e | |
| `--c-fg-light` | #1a2030 | |
| `--c-fg-light-2` | #5a6270 | |
| `--c-fg-light-3` | #9aa0a8 | |
| `--c-accent` | #c8a870 | |
| `--c-border` | #2e3d5c | |
| `--c-border-light` | #cac4b4 | |
| `--f-display` | "Source Serif 4", "Noto Serif SC", Georgia, serif | |
| `--f-heading` | "Source Serif 4", "Noto Serif SC", Georgia, serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "IBM Plex Mono", "JetBrains Mono", monospace | |
| `--sz-display` | 9.5vw | |
| `--sz-h1` | 5.2vw | |
| `--sz-h2` | 3vw | |
| `--sz-h3` | 1.9vw | |
| `--sz-lead` | 1.4vw | |
| `--sz-body` | 1.05vw | |
| `--sz-caption` | 0.82vw | |
| `--sz-label` | 0.7vw | |
| `--pad-x` | 7.5vw | |
| `--pad-y` | 5.5vh | |
| `--gap-lg` | 4vh | |
| `--gap-md` | 2.5vh | |
| `--gap-sm` | 1.2vh | |
| `--ease-slide` | cubic-bezier(0.77, 0, 0.175, 1) | |
| `--dur-slide` | 0.85s | |
| `--ease-enter` | cubic-bezier(0.16, 1, 0.3, 1) | |
| `--dur-enter` | 0.65s | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #c8a870 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #1c2644 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #e2dcd0 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | #2e3d5c |  |
| 表面变体 | `--c-bg` | #1c2644 |  |
| 表面变体 | `--c-bg-alt` | #232f55 |  |



### 排版规则
展示标题 48-96px；正文 15-17px 行高 1.6；间距 32px/24px/16px/12px 四级；过渡动效 0.35s/0.25s 快慢两速；分割线 1px rgba(255,255,255,0.08) 暗底微光。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | "Source Serif 4", "Noto Serif SC", Georgia, serif | 展示/标题 |
| `--font-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | 正文 |
| `--font-mono` | "IBM Plex Mono", "JetBrains Mono", monospace | 等宽/代码 |
| `--f-display` | "Source Serif 4", "Noto Serif SC", Georgia, serif | |
| `--f-heading` | "Source Serif 4", "Noto Serif SC", Georgia, serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "IBM Plex Mono", "JetBrains Mono", monospace | |


### 排版尺度

| 层级 | Token | 值 |
|------|-------|----|
| Display | `--sz-display` | 9.5vw |
| H1 | `--sz-h1` | 5.2vw |
| H2 | `--sz-h2` | 3vw |
| H3 | `--sz-h3` | 1.9vw |
| Lead | `--sz-lead` | 1.4vw |
| Body | `--sz-body` | 1.05vw |
| Caption | `--sz-caption` | 0.82vw |
| Label | `--sz-label` | 0.7vw |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — signal/brand.json
- **布局层** (`layout.json`): 间距系统 — signal/layout.json
- **真相源** (`template.html`): CSS :root 变量是唯一真相源，brand.json 和 layout.json 从此派生

#### 间距
- `--space-page-wmax`: 1200px
- `--space-page-pad`: 7.5vw
- `--space-gap`: 4vh
- `--space-gutter`: 4vh

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


## 衬垫 · Mat

### 设计理念
深鼠尾草画布（#232E26）× 骨白纸（#F7F4ED）× 焦橙强调（#C2653A）。中世纪现代 × 木质感——触感、有意的、温暖的。设计来自陶瓷/家具/建筑工作室的 credential 美学，muted 但不沉闷。

### 设计原则

- **深色底戏剧性**——暗色画布制造视觉张力，强调色如灯塔信号
- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Bricolage Grotesque`，正文退为系统字体
- **vw 响应式排版**——字号跟随视口宽度自动缩放，适配全屏演示
- **高对比度**——文字与背景对比强烈，确保远距离可读性



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #c07030 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #232e26 | 默认表面 |
| `--color-on-surface` | #f0e8d2 | 主文字色 |
| `--color-on-surface-variant` | #888880 | 次级文字 |
| `--color-outline` | rgba(240, 232, 210, 0.12) | 主边框 |
| `--color-surface-container-low` | #2e3d30 | 卡片容器 |
| | | |
| `--c-bg` | #232e26 | |
| `--c-bg-alt` | #2e3d30 | |
| `--c-bg-light` | #ede6d0 | |
| `--c-bg-light-alt` | #e4dac4 | |
| `--c-fg` | #f0e8d2 | |
| `--c-fg-2` | rgba(240, 232, 210, 0.58) | |
| `--c-fg-3` | rgba(240, 232, 210, 0.3) | |
| `--c-fg-light` | #1e2820 | |
| `--c-fg-light-2` | rgba(30, 40, 32, 0.6) | |
| `--c-fg-light-3` | rgba(30, 40, 32, 0.3) | |
| `--c-accent` | #c07030 | |
| `--c-border` | rgba(240, 232, 210, 0.12) | |
| `--c-border-light` | rgba(30, 40, 32, 0.14) | |
| `--c-wood` | #7a4e24 | |
| `--f-display` | "Bricolage Grotesque", "Noto Sans SC", sans-serif | |
| `--f-heading` | "Bricolage Grotesque", "Noto Sans SC", sans-serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "DM Mono", monospace | |
| `--sz-display` | 12vw | |
| `--sz-h1` | 7vw | |
| `--sz-h2` | 4vw | |
| `--sz-h3` | 2.4vw | |
| `--sz-lead` | 1.5vw | |
| `--sz-body` | 1.05vw | |
| `--sz-caption` | 0.82vw | |
| `--sz-label` | 0.7vw | |
| `--pad-x` | 5.5vw | |
| `--pad-y` | 5.5vh | |
| `--gap-lg` | 4.5vh | |
| `--gap-md` | 2.8vh | |
| `--gap-sm` | 1.4vh | |
| `--ease-slide` | cubic-bezier(0.77, 0, 0.175, 1) | |
| `--dur-slide` | 0s | |
| `--ease-enter` | cubic-bezier(0.16, 1, 0.3, 1) | |
| `--dur-enter` | 0s | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #c07030 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #232e26 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #f0e8d2 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(240, 232, 210, 0.12) |  |
| 表面变体 | `--c-bg` | #232e26 |  |
| 表面变体 | `--c-bg-alt` | #2e3d30 |  |



### 排版规则
展示标题 48-96px；正文 15-17px 行高 1.6；间距 32px/24px/16px/12px 四级；过渡动效 0.35s/0.25s 快慢两速；分割线 1px rgba(255,255,255,0.08) 暗底上的微光。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | "Bricolage Grotesque", "Noto Sans SC", sans-serif | 展示/标题 |
| `--font-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | 正文 |
| `--font-mono` | "DM Mono", monospace | 等宽/代码 |
| `--f-display` | "Bricolage Grotesque", "Noto Sans SC", sans-serif | |
| `--f-heading` | "Bricolage Grotesque", "Noto Sans SC", sans-serif | |
| `--f-body` | "DM Sans", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "DM Mono", monospace | |


### 排版尺度

| 层级 | Token | 值 |
|------|-------|----|
| Display | `--sz-display` | 12vw |
| H1 | `--sz-h1` | 7vw |
| H2 | `--sz-h2` | 4vw |
| H3 | `--sz-h3` | 2.4vw |
| Lead | `--sz-lead` | 1.5vw |
| Body | `--sz-body` | 1.05vw |
| Caption | `--sz-caption` | 0.82vw |
| Label | `--sz-label` | 0.7vw |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — mat/brand.json
- **布局层** (`layout.json`): 间距系统 — mat/layout.json
- **真相源** (`template.html`): CSS :root 变量是唯一真相源，brand.json 和 layout.json 从此派生

#### 间距
- `--space-page-wmax`: 1200px
- `--space-page-pad`: 5.5vw
- `--space-gap`: 4.5vh
- `--space-gutter`: 4.5vh

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


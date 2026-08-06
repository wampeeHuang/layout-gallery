## 大字报 · Broadside

### 设计理念
暗黑编辑画布（#111111）× 火焰橙（#FF5722）单色强调 × 双语拉丁/中文字体栈。设计语言来自大字报报纸头条——高对比、大声量、单色强调。深色背景制造戏剧性，火焰橙在暗底上如灯塔信号。

### 设计原则

- **深色底戏剧性**——暗色画布制造视觉张力，强调色如灯塔信号
- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Barlow`，正文退为系统字体
- **vw 响应式排版**——字号跟随视口宽度自动缩放，适配全屏演示
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **海报级大字**——标题以 100-320px 超大尺寸倾斜排布，字体即图像



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #e85d26 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #111111 | 默认表面 |
| `--color-on-surface` | #f0ece5 | 主文字色 |
| `--color-on-surface-variant` | #888880 | 次级文字 |
| `--color-outline` | #282826 | 主边框 |
| `--color-surface-container-low` | #1a1a18 | 卡片容器 |
| | | |
| `--c-bg` | #111111 | |
| `--c-bg-alt` | #1a1a18 | |
| `--c-bg-light` | #111111 | |
| `--c-bg-light-alt` | #1a1a18 | |
| `--c-bg-orange` | #e85d26 | |
| `--c-fg` | #f0ece5 | |
| `--c-fg-2` | #888880 | |
| `--c-fg-3` | #505048 | |
| `--c-fg-light` | #111111 | |
| `--c-fg-light-2` | #2a1810 | |
| `--c-fg-light-3` | rgba(
          17,
          17,
          17,
          0.55
        ) | |
| `--c-accent` | #e85d26 | |
| `--c-border` | #282826 | |
| `--c-border-light` | #282826 | |
| `--f-display` | "Barlow", "Noto Sans SC", sans-serif | |
| `--f-heading` | "Barlow", "Noto Sans SC", sans-serif | |
| `--f-body` | "Barlow", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "IBM Plex Mono", monospace | |
| `--sz-display` | 13vw | |
| `--sz-h1` | 7.5vw | |
| `--sz-h2` | 4.5vw | |
| `--sz-h3` | 2.8vw | |
| `--sz-lead` | 1.6vw | |
| `--sz-body` | 1.2vw | |
| `--sz-caption` | 0.9vw | |
| `--sz-label` | 0.72vw | |
| `--pad-x` | 5.5vw | |
| `--pad-y` | 5.5vh | |
| `--gap-lg` | 3.5vh | |
| `--gap-md` | 2vh | |
| `--gap-sm` | 1vh | |
| `--ease-slide` | cubic-bezier(0.77, 0, 0.175, 1) | |
| `--dur-slide` | 0.8s | |
| `--ease-enter` | cubic-bezier(0.16, 1, 0.3, 1) | |
| `--dur-enter` | 0.5s | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #e85d26 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #111111 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #f0ece5 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | #282826 |  |
| 表面变体 | `--c-bg` | #111111 |  |
| 表面变体 | `--c-bg-alt` | #1a1a18 |  |



### 排版规则
展示标题 80-200px 响应式缩放；正文 16-18px 行高 1.6；中英双语字体栈（拉丁 + 中文各一套）；间距系统 32px/24px/16px/12px 四级；过渡动效 0.35s/0.25s 快慢两速。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | "Barlow", "Noto Sans SC", sans-serif | 展示/标题 |
| `--font-body` | "Barlow", "Noto Sans SC", system-ui, sans-serif | 正文 |
| `--font-mono` | "IBM Plex Mono", monospace | 等宽/代码 |
| `--f-display` | "Barlow", "Noto Sans SC", sans-serif | |
| `--f-heading` | "Barlow", "Noto Sans SC", sans-serif | |
| `--f-body` | "Barlow", "Noto Sans SC", system-ui, sans-serif | |
| `--f-mono` | "IBM Plex Mono", monospace | |


### 排版尺度

| 层级 | Token | 值 |
|------|-------|----|
| Display | `--sz-display` | 13vw |
| H1 | `--sz-h1` | 7.5vw |
| H2 | `--sz-h2` | 4.5vw |
| H3 | `--sz-h3` | 2.8vw |
| Lead | `--sz-lead` | 1.6vw |
| Body | `--sz-body` | 1.2vw |
| Caption | `--sz-caption` | 0.9vw |
| Label | `--sz-label` | 0.72vw |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — broadside/brand.json
- **布局层** (`layout.json`): 间距系统 — broadside/layout.json
- **真相源** (`template.html`): CSS :root 变量是唯一真相源，brand.json 和 layout.json 从此派生

#### 间距
- `--space-page-wmax`: 1200px
- `--space-page-pad`: 5.5vw
- `--space-gap`: 3.5vh
- `--space-gutter`: 3.5vh

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


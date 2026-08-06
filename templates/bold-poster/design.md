## 粗野海报 · Bold Poster

### 设计理念
巨大 Shrikhand 展示字体以 200-320px 海报级尺寸倾斜排布，消防红（#D8000F）是唯一强调色。美学来自 1970 年代意大利体育杂志——粗壮衬线/手写混合体、粗黑边框、堆叠偏移阴影。白色画布 × 深棕黑墨 × 饱和番茄红的三角调色板，不妥协的印刷海报能量。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **海报级大字**——标题以 100-320px 超大尺寸倾斜排布，字体即图像
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #D8000F | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #FFFFFF | 默认表面 |
| `--color-on-surface` | #1C1410 | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #FFFFFF | 卡片容器 |
| | | |
| `--bg` | #FFFFFF | |
| `--dark` | #1C1410 | |
| `--red` | #D8000F | |
| `--light` | #F5F2EF | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #D8000F | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #FFFFFF | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #1C1410 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 表面变体 | `--bg` | #FFFFFF |  |
| 调色板色 | `--dark` | #1C1410 |  |



### 排版规则
封面标题 72-220px 响应式缩放，倾斜 -4° ~ +2° 旋转；正文 Libre Baskerville 衬线 16-18px；标签 Space Grotesk 大写 11-13px letter-spacing 0.12em；边框 1.5-3px 实线黑/红；唯一阴影是红色展示文字后的堆叠偏移。

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
| 11px |
| 10px |
| clamp(10px, 0.9vw, 12px) |
| clamp(11px, 1vw, 14px) |
| clamp(72px, 16vw, 220px) |
| clamp(84px, 18vw, 260px) |
| clamp(64px, 14vw, 200px) |
| clamp(13px, 1.2vw, 16px) |
| clamp(32px, 7vw, 90px) |
| clamp(13px, 1.3vw, 16px) |
| clamp(32px, 5vw, 64px) |
| 0.95em |
| clamp(28px, 3.5vw, 48px) |
| clamp(11px, 1vw, 13px) |
| clamp(36px, 6vw, 72px) |
| clamp(28px, 3.5vw, 52px) |
| clamp(120px, 26vw, 320px) |
| clamp(28px, 4vw, 56px) |
| clamp(22px, 3vw, 36px) |
| clamp(12px, 1.1vw, 14px) |
| 9px |
| clamp(18px, 2.5vw, 32px) |
| clamp(10px, 0.85vw, 11px) |
| clamp(36px, 5vw, 64px) |
| clamp(18px, 2.2vw, 28px) |
| clamp(20px, 2.5vw, 32px) |
| clamp(18px, 2vw, 28px) |
| clamp(80px, 18vw, 260px) |
| clamp(14px, 1.5vw, 18px) |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — bold-poster/brand.json
- **布局层** (`layout.json`): 间距系统 — bold-poster/layout.json
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


## 手创 · Playful

### 设计理念
阳光蜜桃底（#F0C8A0）× Syne 展示字体。友好的独立发布美学——暖调、人性化、非正式。单色强调（#E85D3A 焦橙）在蜜桃底上保持温暖而非攻击性。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `#1A1A1A`，正文退为系统字体
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #1A1A1A | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F0C8A0 | 默认表面 |
| `--color-on-surface` | #1A1A1A | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #E8B88E | 卡片容器 |
| | | |
| `--bg` | #F0C8A0 | |
| `--bg-alt` | #E8B88E | |
| `--text` | #1A1A1A | |
| `--accent` | #1A1A1A | |
| `--light` | #F7DEC6 | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #1A1A1A | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F0C8A0 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #1A1A1A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 表面变体 | `--bg` | #F0C8A0 |  |
| 表面变体 | `--bg-alt` | #E8B88E |  |



### 排版规则
Syne 标题 36-80px；正文 Inter 15-17px 行高 1.55；圆角 4px/2px/999px 三级；阴影 0 2px 8px / 0 8px 30px 双级；过渡 0.18s ease。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | #1A1A1A | 展示/标题 |
| `--font-body` | #1A1A1A | 正文 |
| `--font-mono` | ui-monospace, SF Mono, Consolas, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| 1.2rem |
| 0.9rem |
| clamp(4rem, 10vw, 9rem) |
| clamp(2.5rem, 6vw, 5rem) |
| 1.1rem |
| 1.5rem |
| 0.85rem |
| clamp(2rem, 4vw, 3.5rem) |
| 2.5rem |
| 1rem |
| clamp(2.5rem, 5vw, 4.5rem) |
| clamp(2rem, 4vw, 3rem) |
| 0.8rem |
| 0.75rem |
| 1.3rem |
| 2rem |
| clamp(1.8rem, 3vw, 2.5rem) |
| clamp(4rem, 8vw, 7rem) |
| clamp(3rem, 8vw, 7rem) |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — playful/brand.json
- **布局层** (`layout.json`): 间距系统 — playful/layout.json
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


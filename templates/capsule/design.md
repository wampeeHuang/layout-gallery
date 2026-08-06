## 胶囊药丸 · Capsule

### 设计理念
暖骨白底（#F9F6F0）× 药丸形模块卡片 × 全粉彩调色板（珊瑚/青柠/薰衣草/天空/紫罗兰/黄/桃/薄荷）。Y2K 复兴美学——圆润药丸形状 + 柔和粉彩 + 模块化网格。卡片像药丸一样浮动在暖白底上，每个 pill 承载一个信息单元。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Bodoni Moda`，正文退为系统字体
- **硬阴影语言**——使用高不透明度偏移阴影，不用轻柔弥散阴影
- **高对比度**——文字与背景对比强烈，确保远距离可读性



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #F2D160 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F5F5F0 | 默认表面 |
| `--color-on-surface` | #0A0A0A | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | #1E1E1E | 主边框 |
| `--color-surface-container-low` | #F5F5F0 | 卡片容器 |
| | | |
| `--bg` | #F5F5F0 | |
| `--fg` | #1A1A1A | |
| `--coral` | #E85D4E | |
| `--lime` | #C4D94E | |
| `--lavender` | #C5B5E0 | |
| `--sky` | #8BB4F7 | |
| `--violet` | #A06CE8 | |
| `--yellow` | #F2D160 | |
| `--peach` | #F5B895 | |
| `--mint` | #A8E6CF | |
| `--outline` | #1E1E1E | |
| `--shadow` | rgba(26, 26, 26, 0.08) | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #F2D160 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F5F5F0 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #0A0A0A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | #1E1E1E |  |
| 表面变体 | `--bg` | #F5F5F0 |  |
| 文字变体 | `--fg` | #1A1A1A |  |



### 排版规则
卡片 border-radius: 24-32px（药丸形）；网格 gap 24px；阴影 0 2px 8px / 0 8px 30px 双级；正文 Inter 16px 行高 1.5；标签大写 12px letter-spacing 0.08em。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | 'Bodoni Moda', serif | 展示/标题 |
| `--font-body` | 'Space Grotesk', sans-serif | 正文 |
| `--font-mono` | ui-monospace, SF Mono, Consolas, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| 0.75rem |
| 0.65rem |
| clamp(3rem, 8vw, 7rem) |
| clamp(0.8rem, 1.5vw, 1.1rem) |
| 0.85rem |
| clamp(2rem, 4vw, 3.5rem) |
| clamp(0.95rem, 1.2vw, 1.15rem) |
| 2.5rem |
| clamp(1.8rem, 3.5vw, 3rem) |
| 0.7rem |
| 1.5rem |
| 0.9rem |
| 8rem |
| clamp(1.6rem, 3.5vw, 3rem) |
| 1.3rem |
| 0.8rem |
| clamp(2rem, 3.5vw, 3rem) |
| clamp(0.9rem, 1.1vw, 1.05rem) |
| clamp(2.5rem, 6vw, 5rem) |
| 0.6rem |
| 0.55rem |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — capsule/brand.json
- **布局层** (`layout.json`): 间距系统 — capsule/layout.json
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
- `--elevation-md`: rgba(26, 26, 26, 0.08)


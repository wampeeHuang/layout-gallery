## 雏菊日 · Daisy Days

### 设计理念
手绘雏菊、星星、彩虹 SVG 装饰 × 柔和粉彩调色板。友好、柔软、温暖——教育/儿童/社区内容的首选。手绘插图是核心设计特征（不是点缀），线条故意不完美以保持手工感。

### 设计原则

- **展示字体优先**——标题使用 `Fredoka One`，正文退为系统字体
- **硬阴影语言**——使用高不透明度偏移阴影，不用轻柔弥散阴影
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #333333 | 主强调色 |
| `--color-secondary` | #6B6B6B | 辅强调色 |
| `--color-surface` | #F5F0E6 | 默认表面 |
| `--color-on-surface` | #2D2D2D | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | #2D2D2D | 主边框 |
| `--color-surface-container-low` | #F5F0E6 | 卡片容器 |
| | | |
| `--cream` | #F5F0E6 | |
| `--turquoise` | #7ECDC0 | |
| `--soft-pink` | #F7C8D4 | |
| `--butter` | #FDE68A | |
| `--mint` | #A8E6CF | |
| `--lavender` | #D4A5E8 | |
| `--peach` | #FFCBA4 | |
| `--sky` | #A8D8F0 | |
| `--coral` | #F8635F | |
| `--text-dark` | #2D2D2D | |
| `--text-muted` | #6B6B6B | |
| `--border` | #2D2D2D | |
| `--border-width` | 3px | |
| `--radius` | 20px | |
| `--radius-lg` | 28px | |
| `--shadow` | 6px 6px 0 var(--border) | |
| `--shadow-sm` | 4px 4px 0 var(--border) | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #333333 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F5F0E6 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #2D2D2D | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #6B6B6B | 次级交互元素 |
| 边框色 | `--color-outline` | #2D2D2D |  |
| 表面变体 | `--cream` | #F5F0E6 |  |
| 调色板色 | `--turquoise` | #7ECDC0 |  |



### 排版规则
圆角 12-24px（柔和友好）；阴影 0 2px 8px / 0 8px 24px / 0 16px 48px 三级；正文 16-18px 行高 1.6；标题 32-64px；色板：奶油/青绿/柔粉/黄油/薄荷/薰衣草/桃/天空/珊瑚 9色。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | 'Fredoka One',cursive | 展示/标题 |
| `--font-body` | 'Quicksand',sans-serif | 正文 |
| `--font-mono` | ui-monospace, SF Mono, Consolas, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| clamp(2.5rem,5vw,4.5rem) |
| clamp(1.8rem,3.5vw,3rem) |
| clamp(1.3rem,2vw,1.8rem) |
| clamp(1rem,1.5vw,1.3rem) |
| clamp(.95rem,1.3vw,1.15rem) |
| .85rem |
| .8rem |
| clamp(1rem,1.8vw,1.4rem) |
| clamp(1.4rem,2.5vw,2rem) |
| clamp(.95rem,1.4vw,1.15rem) |
| clamp(.85rem,1.3vw,1.1rem) |
| clamp(.8rem,1.1vw,.95rem) |
| 1.1rem |
| 1.1rem}.timeline-card p{font-size:.9rem |
| .9rem}
.legend-swatch{width:18px |
| 1.2rem |
| 1.15rem}.info-card p{font-size:.88rem |
| 4rem |
| clamp(1.3rem,2.5vw,2rem) |
| 1rem |
| 2rem |
| 1.1rem}
.step-desc{font-size:.85rem |
| .95rem}
.d-legend-swatch{width:22px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — daisy-days/brand.json
- **布局层** (`layout.json`): 间距系统 — daisy-days/layout.json
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
- `--radius-base`: 20px
- `--radius-sm`: 2px
- `--radius-pill`: 999px
- `--radius-lg`: 28px

#### 阴影
- `--elevation-sm`: 4px 4px 0 var(--border)
- `--elevation-md`: 6px 6px 0 var(--border)


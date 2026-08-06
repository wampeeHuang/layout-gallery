## 钴蓝网格 · Cobalt Grid

### 设计理念
电光钴蓝衬线（#1A5FEB）× 坐标纸画布（#F5F1EB）× 阶梯像素故障装饰。设计来自设计研究公报美学——严格单色强调（钴蓝）、坐标纸网格背景、极细 hairline 分割线。安静、严谨、印刷账簿般的克制。

### 设计原则

- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **网格结构即装饰**——模数化网格作为视觉骨架，不依赖额外装饰
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #333333 | 主强调色 |
| `--color-secondary` | #5560E5 | 辅强调色 |
| `--color-surface` | #F0EBDE | 默认表面 |
| `--color-on-surface` | #1F2BE0 | 主文字色 |
| `--color-on-surface-variant` | #5560E5 | 次级文字 |
| `--color-outline` | #1F2BE0 | 主边框 |
| `--color-surface-container-low` | #F0EBDE | 卡片容器 |
| | | |
| `--paper` | #F0EBDE | |
| `--paper-2` | #E6E0CE | |
| `--ink` | #1F2BE0 | |
| `--ink-soft` | #5560E5 | |
| `--grid` | rgba(31, 43, 224, 0.10) | |
| `--rule` | #1F2BE0 | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #333333 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F0EBDE | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #1F2BE0 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #5560E5 | 次级交互元素 |
| 边框色 | `--color-outline` | #1F2BE0 |  |
| 表面变体 | `--paper` | #F0EBDE |  |
| 表面变体 | `--paper-2` | #E6E0CE |  |



### 排版规则
展示字体 Georgia/serif；正文 Inter 15-17px 行高 1.55；网格线 rgba(0,0,0,0.08)；分割线 rgba(0,0,0,0.12)；零圆角体系；无阴影平面设计。

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
| clamp(11px, 0.82vw, 13px) |
| clamp(10px, 0.75vw, 12px) |
| clamp(100px, min(11vw, 18vh), 200px) |
| clamp(13px, 1vw, 16px) |
| clamp(28px, min(2.8vw, 4.6vh), 50px) |
| clamp(12px, 0.9vw, 15px) |
| clamp(14px, 0.92vw, 15px) |
| clamp(11px, 0.78vw, 13px) |
| clamp(56px, min(6.4vw, 11vh), 120px) |
| clamp(12px, 0.85vw, 14px) |
| clamp(12px, 0.82vw, 14px) |
| clamp(48px, min(5vw, 8.5vh), 100px) |
| clamp(12px, 0.9vw, 14px) |
| clamp(13px, 0.9vw, 15px) |
| clamp(26px, 2vw, 40px) |
| clamp(14px, 0.95vw, 15px) |
| clamp(13px, 0.92vw, 15px) |
| clamp(56px, min(6vw, 10vh), 130px) |
| clamp(15px, 1vw, 18px) |
| clamp(46px, min(4.8vw, 8.2vh), 92px) |
| clamp(110px, min(11vw, 18vh), 240px) |
| clamp(13px, 0.95vw, 15px) |
| clamp(15px, 1vw, 17px) |
| clamp(50px, min(5.6vw, 9vh), 110px) |
| clamp(11px, 0.75vw, 12px) |
| clamp(20px, 1.6vw, 28px) |
| clamp(72px, min(8.4vw, 14vh), 180px) |
| clamp(72px, min(7vw, 11vh), 150px) |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — cobalt-grid/brand.json
- **布局层** (`layout.json`): 间距系统 — cobalt-grid/layout.json
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


## 翡翠编辑 · Emerald Editorial

### 设计理念
杂志封面级商务——翡翠绿（#0A5F4A）× 海军蓝（#1B2A4A）× 纸白（#F8F6F2）。双线刊头装饰（double-rule masthead）是签名设计元素。Bodoni 风格展示衬线 + Inter 正文，编辑权威感。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Bodoni Moda`，正文退为系统字体
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #333333 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F1E9D6 | 默认表面 |
| `--color-on-surface` | #0F1A5C | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(15, 26, 92, 0.22) | 主边框 |
| `--color-surface-container-low` | #F1E9D6 | 卡片容器 |
| | | |
| `--bg` | #3CD896 | |
| `--bg-2` | #2DC684 | |
| `--bg-3` | #25B377 | |
| `--ink` | #0F1A5C | |
| `--ink-2` | #1B2774 | |
| `--ink-3` | #3A4593 | |
| `--paper` | #F1E9D6 | |
| `--rule` | rgba(15, 26, 92, 0.22) | |
| `--rule-strong` | rgba(15, 26, 92, 0.85) | |
| `--display-font` | 'Bodoni Moda', serif | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #333333 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F1E9D6 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #0F1A5C | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(15, 26, 92, 0.22) |  |
| 表面变体 | `--bg` | #3CD896 |  |
| 表面变体 | `--bg-2` | #2DC684 |  |



### 排版规则
Bodoni-style 展示标题 48-120px；Inter 正文 15-17px 行高 1.55；双线刊头 border-top/bottom 2px + 1px；分割线 1px rgba(0,0,0,0.1)；阴影 0 2px 8px / 0 8px 30px 双级。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | 'Bodoni Moda', serif | 展示/标题 |
| `--font-body` | 'Bodoni Moda', serif | 正文 |
| `--font-mono` | ui-monospace, SF Mono, Consolas, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| 0.42em |
| 26px |
| 76px |
| 184px |
| 68px |
| 28px |
| 200px |
| 64px |
| 460px |
| 128px |
| 24px |
| 130px |
| 84px |
| 44px |
| 104px |
| 30px |
| 48px |
| 92px |
| 120px |
| 80px |
| 40px |
| 144px |
| 60px |
| 180px |
| 38px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — emerald-editorial/brand.json
- **布局层** (`layout.json`): 间距系统 — emerald-editorial/layout.json
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


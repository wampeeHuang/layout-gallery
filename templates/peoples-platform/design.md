## 人民讲台 · People's Platform

### 设计理念
Activist 海报能量——蓝（#2B5FBF）× 橙（#E86A2C）× 红（#D03A2C）× 奶油底（#F7F3EB）。Alfa Slab One + Caveat Brush 双展示字体。抗议海报/社区运动/文化评论的视觉语言——诚实、大声、图形化。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #E83A2A | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F5F2EA | 默认表面 |
| `--color-on-surface` | #0E0E14 | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #F5F2EA | 卡片容器 |
| | | |
| `--blue` | #2C2CDC | |
| `--blue-deep` | #1B1BB0 | |
| `--orange` | #F2A03A | |
| `--orange-deep` | #E89321 | |
| `--red` | #E83A2A | |
| `--red-deep` | #B7281C | |
| `--cream` | #F4E9D6 | |
| `--paper` | #F5F2EA | |
| `--ink` | #0E0E14 | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #E83A2A | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F5F2EA | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #0E0E14 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 调色板色 | `--blue` | #2C2CDC |  |
| 调色板色 | `--blue-deep` | #1B1BB0 |  |



### 排版规则
Alfa Slab One 标题 48-120px；Caveat Brush 手写标注 24-48px；正文 Inter 15-17px；色板：蓝/深蓝/橙/深橙/红/深红 6 色系统；粗黑边框 2-3px。

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
| 24px |
| 240px |
| 96px |
| 72px |
| 26px |
| 140px |
| 32px |
| 54px |
| 36px |
| 108px |
| 104px |
| 120px |
| 28px |
| 180px |
| 540px |
| 130px |
| 64px |
| 30px |
| 60px |
| 300px |
| 78px |
| 38px |
| 88px |
| 260px |
| 48px |
| 46px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — peoples-platform/brand.json
- **布局层** (`layout.json`): 间距系统 — peoples-platform/layout.json
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


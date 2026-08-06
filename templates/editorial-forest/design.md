## 森林编辑 · Editorial Forest

### 设计理念
森林绿（#2E5A3B）× 灰粉（#C4958A）× 暖奶油（#F3EFE8）× Source Serif 4 衬线。安静克制的季度回顾美学——绿色不是霓虹是林间，粉色不是糖果是暮霭。节奏刻意放慢，留给阅读呼吸空间。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **展示字体优先**——标题使用 `Source Serif 4`，正文退为系统字体
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #2e4a2a | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #efe7d4 | 默认表面 |
| `--color-on-surface` | #1a1a17 | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #efe7d4 | 卡片容器 |
| | | |
| `--green` | #2e4a2a | |
| `--green-deep` | #243a21 | |
| `--green-lite` | #3a5a36 | |
| `--pink` | #e89cb1 | |
| `--pink-deep` | #d27e96 | |
| `--cream` | #efe7d4 | |
| `--cream-2` | #e6dcc4 | |
| `--ink` | #1a1a17 | |
| `--serif` | "Source Serif 4", "Source Serif Pro", Georgia, serif | |
| `--mono` | "JetBrains Mono", ui-monospace, Menlo, monospace | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #2e4a2a | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #efe7d4 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #1a1a17 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 调色板色 | `--green` | #2e4a2a |  |
| 调色板色 | `--green-deep` | #243a21 |  |



### 排版规则
Source Serif 4 标题 36-72px；正文 Inter 15-17px 行高 1.6；分割线 1px rgba(0,0,0,0.1)；零圆角体系；无阴影平面设计；留白充裕。

### 字体
| Token | 值 | 用途 |
|-------|-----|------|
| `--font-display` | "Source Serif 4", "Source Serif Pro", Georgia, serif | 展示/标题 |
| `--font-body` | "Source Serif 4", "Source Serif Pro", Georgia, serif | 正文 |
| `--font-mono` | "JetBrains Mono", ui-monospace, Menlo, monospace | 等宽/代码 |


### 排版尺度

以下字号从 CSS 中提取（未 Token 化）：

| 字号 |
|------|
| 26px |
| 28px |
| 220px |
| 96px |
| 56px |
| 84px |
| 24px |
| 140px |
| 44px |
| 30px |
| 32px |
| 68px |
| 80px |
| 110px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — editorial-forest/brand.json
- **布局层** (`layout.json`): 间距系统 — editorial-forest/layout.json
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


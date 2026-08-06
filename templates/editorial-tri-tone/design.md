## 三色调 · Editorial Tri-Tone

### 设计理念
三色编辑系统：灰粉（#C4958A）× 芥末奶油（#F3EFE8）× 深勃艮第（#4A1625）。Bricolage Grotesque + Instrument Serif 双字体。时尚杂志跨页美学——三色调纪律、衬线/无衬线对比、高对比度排版。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #F2B6C6 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #F2D86A | 默认表面 |
| `--color-on-surface` | #7A1F35 | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | rgba(10,10,10,0.15) | 主边框 |
| `--color-surface-container-low` | #F2D86A | 卡片容器 |
| | | |
| `--pink` | #F2B6C6 | |
| `--pink-deep` | #F2B6C6 | |
| `--cream` | #F2D86A | |
| `--navy` | #7A1F35 | |
| `--forest` | #7A1F35 | |
| `--burgundy` | #7A1F35 | |
| `--lime` | #F2D86A | |
| `--sky` | #F2B6C6 | |
| `--terracotta` | #F2D86A | |
| `--butter` | #F2D86A | |
| `--ink` | #7A1F35 | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #F2B6C6 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #F2D86A | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #7A1F35 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | rgba(10,10,10,0.15) |  |
| 文字变体 | `--pink` | #F2B6C6 |  |
| 文字变体 | `--pink-deep` | #F2B6C6 |  |



### 排版规则
Instrument Serif 标题 48-96px；Bricolage Grotesque 正文 15-17px；标签 11-13px letter-spacing 0.12em；色板扩展：海军蓝/森林绿/勃艮第/青柠/天空/赤陶/黄油 7 个强调色可选。

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
| 16px |
| 44px |
| 300px |
| 240px |
| 0.35em |
| 56px |
| 28px |
| 64px |
| 76px |
| 40px |
| 540px |
| 220px |
| 30px |
| 84px |
| 200px |
| 26px |
| 320px |
| 22px |
| 48px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — editorial-tri-tone/brand.json
- **布局层** (`layout.json`): 间距系统 — editorial-tri-tone/layout.json
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


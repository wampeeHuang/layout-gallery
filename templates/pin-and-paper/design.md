## 别针便笺 · Pin & Paper

### 设计理念
黄纸底（#F7F3E0）× 安全别针 SVG 插画 × 墨水蓝手写 Caveat Brush × 纸纹肌理。手工制作的文学感——安全别针是签名图形元素（不是装饰），纸纹叠加层制造触觉。Caveat Brush 手写体让每页像手写笔记。

### 设计原则

- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **纸纹理**——叠加噪点/颗粒质感，模拟印刷品的触感
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #C2342B | 主强调色 |
| `--color-secondary` | #2D4FB8 | 辅强调色 |
| `--color-surface` | #EFE56A | 默认表面 |
| `--color-on-surface` | #1F3A8A | 主文字色 |
| `--color-on-surface-variant` | #2D4FB8 | 次级文字 |
| `--color-outline` | #3457C4 | 主边框 |
| `--color-surface-container-low` | #EFE56A | 卡片容器 |
| | | |
| `--paper` | #EFE56A | |
| `--paper-2` | #F5ECA0 | |
| `--paper-3` | #E8D85A | |
| `--cream` | #F8F1D6 | |
| `--kraft` | #C9A66B | |
| `--ink` | #1F3A8A | |
| `--ink-soft` | #2D4FB8 | |
| `--ink-line` | #3457C4 | |
| `--black` | #0E1430 | |
| `--red` | #C2342B | |
| `--olive` | #6B7A2E | |
| `--orange` | #D8702A | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #C2342B | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #EFE56A | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #1F3A8A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #2D4FB8 | 次级交互元素 |
| 边框色 | `--color-outline` | #3457C4 |  |
| 表面变体 | `--paper` | #EFE56A |  |
| 表面变体 | `--paper-2` | #F5ECA0 |  |



### 排版规则
Caveat Brush 手写标题 32-64px；Inter 正文 15-17px 行高 1.55；纸纹覆盖层 opacity 0.04-0.08；安全别针 SVG 装饰；分割线 1px rgba(0,0,0,0.08)；阴影 0 2px 8px / 0 8px 30px 双级。

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
| 18px |
| 15px |
| 16px |
| 196px |
| 38px |
| 96px |
| 22px |
| 44px |
| 84px |
| 20px |
| 32px |
| 168px |
| 36px |
| 50px |
| 28px |
| 19px |
| 14px |
| 110px |
| 21px |
| 88px |
| 70px |
| 24px |
| 92px |
| 60px |
| 26px |
| 360px |
| 130px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — pin-and-paper/brand.json
- **布局层** (`layout.json`): 间距系统 — pin-and-paper/layout.json
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


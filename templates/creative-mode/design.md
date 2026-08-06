## 创意模式 · Creative Mode

### 设计理念
奶油纸底（#F8F4ED）× 四色自信强调（绿#2E7D32/粉#C2185B/橙#EF6C00/黄#F9A825）× Archivo Black 展示字体。设计主导的自信美学——多色但每个颜色有明确分工：绿=成功指标、粉=强调文字、橙=CTA、黄=高亮面板。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤
- **克制配色**——颜色用于传达信息层级，非装饰



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #1F8A4C | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #EFE9D9 | 默认表面 |
| `--color-on-surface` | #F06CA8 | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | #0F0F0F | 主边框 |
| `--color-surface-container-low` | #EFE9D9 | 卡片容器 |
| | | |
| `--cream` | #EFE9D9 | |
| `--cream-2` | #E4DCC4 | |
| `--green` | #1F8A4C | |
| `--green-dark` | #136636 | |
| `--pink` | #F06CA8 | |
| `--pink-dark` | #D14E8B | |
| `--orange` | #E85A1F | |
| `--yellow` | #F5C518 | |
| `--ink` | #0F0F0F | |
| `--ink-2` | #2A2A2A | |
| `--rule` | #0F0F0F | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #1F8A4C | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #EFE9D9 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #F06CA8 | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | #0F0F0F |  |
| 表面变体 | `--cream` | #EFE9D9 |  |
| 表面变体 | `--cream-2` | #E4DCC4 |  |



### 排版规则
Archivo Black 标题 48-120px；正文 Inter 15-17px；标签大写 11-13px letter-spacing 0.1em；分割线 1px rgba(0,0,0,0.12)；阴影 0 2px 8px / 0 8px 30px 双级。

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
| 160px |
| 32px |
| 140px |
| 28px |
| 46px |
| 72px |
| 96px |
| 100px |
| 84px |
| 30px |
| 34px |
| 220px |
| 64px |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — creative-mode/brand.json
- **布局层** (`layout.json`): 间距系统 — creative-mode/layout.json
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


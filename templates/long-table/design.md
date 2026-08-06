## 长桌 · Long Table

### 设计理念
暖奶油（#FAF6F0）× 铁锈红（#C25A3C）晚宴美学。粗体大写 grotesk 标题 + Fraunces 衬线 + 药丸形轮廓按钮。灵感来自私房菜/晚宴俱乐部——温暖、亲密、现代 hospitality 品牌感。

### 设计原则

- **单色强调**——仅一个强调色贯穿全模板，其余用灰度收束
- **高对比度**——文字与背景对比强烈，确保远距离可读性
- **内容优先**——UI 退后，让内容占据视觉主导
- **充裕留白**——大量负空间制造呼吸感，不拥挤



### 颜色语义
| Token | 色值 | 语义 |
|-------|------|------|
| `--color-primary` | #333333 | 主强调色 |
| `--color-secondary` | #666666 | 辅强调色 |
| `--color-surface` | #FAF1E2 | 默认表面 |
| `--color-on-surface` | #B53D2A | 主文字色 |
| `--color-on-surface-variant` | #666666 | 次级文字 |
| `--color-outline` | #B53D2A | 主边框 |
| `--color-surface-container-low` | #FAF1E2 | 卡片容器 |
| | | |
| `--paper` | #FAF1E2 | |
| `--paper-d` | #F2E5CF | |
| `--paper-vd` | #E8D7B6 | |
| `--ink` | #B53D2A | |
| `--ink-dp` | #8E2D1F | |
| `--rule` | #B53D2A | |

### 六色系统

| 角色 | Token | 色值 | 说明 |
|------|-------|------|------|
| 主强调色 | `--color-primary` | #333333 | 按钮、链接、强调元素 |
| 表面色 | `--color-surface` | #FAF1E2 | 页面/幻灯片默认背景 |
| 主文字色 | `--color-on-surface` | #B53D2A | 正文、标题的文字颜色 |
| 辅强调色 | `--color-secondary` | #666666 | 次级交互元素 |
| 边框色 | `--color-outline` | #B53D2A |  |
| 表面变体 | `--paper` | #FAF1E2 |  |
| 表面变体 | `--paper-d` | #F2E5CF |  |



### 排版规则
Fraunces 衬线标题 36-80px；正文 Inter 15-17px；按钮 border-radius: 999px 药丸形 + 2px 边框轮廓线；分割线 1px rgba(0,0,0,0.08)；阴影 0 2px 8px / 0 8px 30px 双级。

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
| clamp(14px, 0.95vw, 16px) |
| clamp(11px, 0.78vw, 13px) |
| clamp(15px, 1.1vw, 20px) |
| clamp(18px, 1.4vw, 24px) |
| clamp(15px, 1.05vw, 18px) |
| clamp(20px, 1.6vw, 30px) |
| clamp(82px, min(8.8vw, 15vh), 180px) |
| clamp(17px, 1.2vw, 22px) |
| clamp(18px, 1.4vw, 26px) |
| clamp(180px, min(22vw, 38vh), 480px) |
| clamp(15px, 1.1vw, 18px) |
| clamp(72px, min(7.6vw, 13vh), 160px) |
| clamp(20px, 1.5vw, 28px) |
| clamp(16px, 1.2vw, 20px) |
| clamp(56px, min(6vw, 10vh), 120px) |
| clamp(28px, 2.4vw, 44px) |
| clamp(15px, 1vw, 17px) |
| clamp(18px, 1.3vw, 22px) |
| clamp(60px, min(6.4vw, 10.5vh), 140px) |
| clamp(20px, 1.6vw, 28px) |
| clamp(20px, 1.5vw, 26px) |
| clamp(48px, min(5vw, 8.4vh), 100px) |
| clamp(16px, 1.1vw, 20px) |
| clamp(40px, min(4.4vw, 7.4vh), 96px) |
| clamp(13px, 0.92vw, 15px) |
| clamp(18px, 1.3vw, 24px) |
| clamp(15px, 1.05vw, 17px) |
| clamp(13px, 0.95vw, 16px) |
| clamp(60px, min(6.4vw, 10vh), 130px) |


### Token 参考
- **品牌层** (`brand.json`): 颜色角色 + 字体 + 圆角 + 阴影 + 动效 — long-table/brand.json
- **布局层** (`layout.json`): 间距系统 — long-table/layout.json
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


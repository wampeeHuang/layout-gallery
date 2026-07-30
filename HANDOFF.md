# HANDOFF — 版式画廊

date: 2026-07-30

## Turbo 导航无抖动 (2026-07-30)

`@hotwired/turbo@8.0.12` CDN 注入 `meta/nav.html`，导航栏 `data-turbo-permanent` 跨页持久化，消除 MPA 导航闪烁。

### 改动清单

| 文件 | 改动 |
|------|------|
| `meta/nav.html` | +Turbo CDN script，`.site-nav` 加 `id="site-nav"` + `data-turbo-permanent`，+`@font-face` 字体别名，+JS 监听 `turbo:load` 更新 active 态 |
| `index.html` | `DOMContentLoaded`→`turbo:load`；删冗余 `@font-face`（nav.html 已提供） |
| `library.html` | `DOMContentLoaded`→`turbo:load`；删冗余 `@font-face`（nav.html 已提供） |

### 原理

- Turbo 拦截同源链接点击，fetch 新页面 → 替换 `<body>`（保留 `data-turbo-permanent` 元素）→ 触发 `turbo:load`
- **关键修复**：`data-turbo-permanent` 必须搭配 `id` 属性，Turbo 用 `id` 在旧/新页面间匹配 permanent 元素。没有 `id` 静默失败，每次仍然替换 DOM
- `turbo:load` 在首次加载和每次 Turbo 导航都触发，替代 `DOMContentLoaded`
- 服务端 `servePage()` 注入 `class="active"` 覆盖首次加载；JS `updateActive()` 覆盖后续 Turbo 导航
- `@font-face` 放 nav.html 确保所有页面字体解析一致，不再各自声明

### 验证

Puppeteer 实测：四页间 Turbo 导航，`#site-nav` 同 DOM 引用保持（`isSame: true`），宽 1440px、高 57px、y=0 全部一致，active 态正确切换。

## 品牌 Token 统一 & 页面宽度标准化 (2026-07-30)

四个页面全部注入同一份 `tokens.json` 的 `:root`，导航栏不再跳色。统一内容宽度 `1200px` + 两侧 `32px` padding。

### 改动清单

| 文件 | 改动 |
|------|------|
| `tokens.json` | 新增 `--page-wmax:1200px`、`--page-pad:32px` |
| `grow.html` | `:root` 替换为 `<!-- ROOT_INJECT -->`，保留 `--danger`/`--success` 在第二个 `:root`；body max-width+padding 移至 `.page-wrap` 修复导航栏被压缩 |
| `meta/learn-template.html` | `:root` 替换为 `<!-- ROOT_INJECT -->`，保留 `--font-serif`；`var(--pad)`→`var(--page-pad)`；`var(--wmax)`→`var(--page-wmax)` |
| `index.html` | 去 `--l-wmax`/`--l-pad`，改用 `--page-wmax`/`--page-pad`；去 eyebrow "Swiss Minimal · 设计基因套件"；去统计条 |
| `library.html` | `max-width:1500px/1520px`→`var(--page-wmax)`，`--space-2xl`→`--page-pad` |
| `server.js` | `/learn` 和 `/grow` 传 `galleryTokensPath`（原为 `null`） |
| `templates/.../layout-gallery/template.html` | 填充品牌范例内容（调色盘+字体层级+卡片组件），`:root` 从 tokens.json 自动同步 |

### 关键修复

- **跨页跳色**：learn 页 `--accent:#d4684e`（暖橙）→ gallery 的 `--accent:#2563eb`（蓝），导航栏不再跳色
- **grow.html `:root` 裸奔**：`<!-- ROOT_INJECT -->` 必须在 `<style>` 标签内，否则注入的 CSS 暴露为裸文本
- **grow.html 导航栏宽度不对**：`body{max-width:1200px}` 和 `body{padding:...}` 把导航栏也限制在 1200px 内，移至 `.page-wrap` 修复
- **index.html `tagHTML` bug**：`${tagHTML}` → `${tags.join('')}`，修复精选卡片 tag 不显示的 bug

## 导航重构 (2026-07-30)

四个页面全部挂载共享导航栏，`meta/nav.html` 是唯一来源。

| 页面 | 路径 | 文件 |
|------|------|------|
| 画廊（landing） | `/` | `index.html`（新建） |
| 版式库 | `/library` | `library.html`（原 index.html） |
| 知识库 | `/learn` | `meta/learn-template.html` |
| AI 萃取 | `/grow` | `grow.html` |

所有页面路由走 `server.js` 的 `servePage()` 辅助函数注入导航栏。`:root` 全部从 `tokens.json` 派生（一源双端闭环）。
导航栏 CSS 全部 `var(--token, fallback)` 适配不同页面的 `:root`。

## 本次会话新增 (2026-07-29)

### 生长 Agent 管线（四期）

| 文件 | 操作 | 说明 |
|------|------|------|
| scripts/growth-agent.js | 新建 | 六步管线：URL→tokens.json→:root，SSE 进度推送 |
| scripts/sync-roots.js | 新建 | tokens.json→:root CSS 自动生成+注入 template.html |
| scripts/audit-tokens.js | 新建 | Token 角色覆盖审计 |
| grow.html | 新建 | 生长 Agent UI，六步流水线可视化+SSE 实时日志+三Tab结果+审批 |
| server.js | 修改 | +4 路由：GET /grow, POST /api/grow(SSE), approve, reject |
| index.html | 修改 | header 加「生长 Agent」链接 |
| registry.json | 修改 | 新增模板条目 |

### 架构图

- v7: 修正 13 个对抗性审查问题（飞书白板）
- v8: 生长 Agent 子步骤+错误分支+审核门（飞书白板）
- v9: +UI 层（grow.html + /grow + SSE + approve/reject）`_runtime/pm-arch-v9.svg`

### 上半场

- meta/brand-template.html — 品牌套件元模板
- scripts/brand-renderer.js — 品牌页渲染器
- server.js — GET /brand/:slug, /api/token-contract, /api/template/:slug/tokens
- vercel.json — /brand/(.*) 路由

## 当前状态

- 线上: https://gallery.evopearl.com
- GitHub: wampeeHuang/layout-gallery
- 模板数: 46（registry.json）
- 生长管线: 代码完成，**未端到端测试**
- **一源双端闭环**：四个页面 `:root` 全部从 `tokens.json` 派生 ← 2026-07-30 完成
- **Turbo 导航**：导航栏 `data-turbo-permanent` 跨页持久化 ← 2026-07-30 完成

## 未完成

1. **[阻塞]** 设 `AIGOAPI_API_KEY` 环境变量 — 值 `sk-f0X9TrTs3eKDNur7lh02VaO8koR6JrXaMRgmhCUvOdjqt4eS`
2. **[阻塞]** 端到端测试生长管线
3. 批量 tokens.json — 44 个模板的 :root → tokens.json 反向提取
4. 速率限制 — POST /api/grow 无并发保护
5. `templates/_growth/` 进 .gitignore

## 关键配置

- AIGO: `AIGOAPI_API_KEY`, endpoint `https://aigoapi.com`, model `gemini-3.1-flash-image`
- DeepSeek: `DEEPSEEK_API_KEY` 已有, endpoint `https://api.deepseek.com`
- Server: `localhost:3080/3081`, `node server.js`

复盘: D:\workspace\_output\retrospectives\2026-07-29-layout-gallery-growth-agent.md

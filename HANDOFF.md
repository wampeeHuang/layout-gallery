# HANDOFF — 版式画廊

date: 2026-07-29

## 明天第一件事：首页品牌套件对齐

**问题**：`index.html` 完全脱离品牌套件体系。

- `:root` 硬编码 CSS 变量，不是从 `tokens.json` 派生
- 卡片/搜索/筛选/模态的视觉风格跟 `/brand/layout-gallery` 品牌页对不上
- 画廊自己是品牌套件系统的展示窗口，但外观没吃自己的狗粮

**解法方向**：
1. `index.html` 从 `templates/frontend-design/layout-gallery/tokens.json` 派生 `:root`
2. 或者更彻底的：首页也走 `brand-renderer.js` 包裹层，把卡片网格当品牌页的一个区段来渲染
3. 卡片预览 iframe 缩放逻辑保留，但视觉 chrome（header/filters/cards/modal）全部 token 化

**现状**：首页 250+ 行 CSS 跟 `brand-renderer` 14 区段品牌页是两条平行线，没有共享任何 token 或组件。

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
- 模板数: 44（registry.json）
- 生长管线: 代码完成，**未端到端测试**
- **首页与品牌套件体系脱节** ← 明天从这里开始

## 未完成

1. **[阻塞]** 设 `AIGOAPI_API_KEY` 环境变量 — 值 `sk-f0X9TrTs3eKDNur7lh02VaO8koR6JrXaMRgmhCUvOdjqt4eS`
2. **[阻塞]** 端到端测试生长管线
3. **首页品牌套件对齐** — 从 tokens.json 派生 :root，视觉统一
4. 批量 tokens.json — 44 个模板的 :root → tokens.json 反向提取
5. 速率限制 — POST /api/grow 无并发保护
6. `templates/_growth/` 进 .gitignore

## 关键配置

- AIGO: `AIGOAPI_API_KEY`, endpoint `https://aigoapi.com`, model `gemini-3.1-flash-image`
- DeepSeek: `DEEPSEEK_API_KEY` 已有, endpoint `https://api.deepseek.com`
- Server: `localhost:3080/3081`, `node server.js`

复盘: D:\workspace\_output\retrospectives\2026-07-29-layout-gallery-growth-agent.md

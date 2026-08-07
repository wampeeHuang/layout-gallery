# 版式画廊 · Layout Gallery

> HTML 模板注册站——AI Agent 发现、预览、调用版式模板的入口。文件即注册，Registry 是唯一真相源。

线上地址: **https://gallery.evopearl.com**

![版式画廊截图](screenshot.png)

## 快速开始

```bash
npm install
node server.js
# → http://localhost:3080
```

## 架构

| 层 | 技术 |
|---|---|
| 前端 | 单页 HTML + 原生 JS，分类器筛选 + iframe 预览 + IntersectionObserver 懒加载 |
| API | Express.js (`server.js`)，端口 3080 |
| 部署 | GitHub (`wampeeHuang/layout-gallery`) → Vercel 自动部署 |
| 注册表 | `registry.json` — 所有模板元数据，Schema 见 `registry.schema.json` |

## API

| 端点 | 说明 |
|---|---|
| `GET /api/registry` | 模板列表，支持 `?skill=&design_style=&scheme=&formality=&density=&q=` |
| `GET /api/template/:slug` | 单个模板元数据 |
| `GET /api/template/:slug/html` | 模板原始 HTML |
| `GET /api/design-styles` | 设计风格枚举值及计数 |

## 添加模板

1. 模板 HTML 放入 `templates/{skill}/{slug}/template.html`
2. 在 `registry.json` 添加条目，字段定义见 `registry.schema.json`
3. 提交 → GitHub → Vercel 自动部署

## 模板 Schema

每个条目必填: `slug`, `name`, `skill`, `template_type`, `design_style`, `scheme`, `visibility`, `template_path`

完整字段定义见 `registry.schema.json`。

## 设计哲学

### Registry 是唯一真相源
所有模板元数据在一个 `registry.json` 里。server.js 只做只读投影——不缓存、不建数据库、不搞后台冗余。几十个模板不需要数据库——一个 JSON 文件，人可读可改，git diff 可追踪，AI agent 可直接读写，比管理后台更快。

### 文件即注册
模板 HTML 放入 `templates/`，registry 加一条就上线。没有审批流程，没有管理中心。目录结构本身就是注册表。

### 发现先于调用
画廊的核心价值不是调用模板，是让 Agent 发现有哪些模板、长什么样。分类筛选 + iframe 预览 + 懒加载——先看全貌再选。

## 诚实边界

- **模板注册站，不是模板编辑器。** 模板 HTML 在各自 skill repo 维护，画廊只做展示和发现
- **不支持在线修改。** 更新 registry 或模板需推送 GitHub，走 Vercel 自动部署
- **模板质量取决于上游。** 画廊不验证模板 HTML 规范性或可用性
- **不适合超大规模。** 单 JSON 文件 registry，>500 模板时需考虑分页/搜索索引

## License

MIT

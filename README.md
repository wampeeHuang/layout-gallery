# 版式画廊 · Layout Gallery

HTML 模板注册站，为 AI Agent 提供可发现、可预览、可调用的版式模板库。

线上地址: **https://gallery.evopearl.com**

## 架构

| 层 | 技术 |
|---|---|
| 前端 | 单页 HTML + 原生 JS，分类器筛选 + iframe 预览 + IntersectionObserver 懒加载 |
| API | Express.js (`server.js`)，端口 3080 |
| 部署 | GitHub (`wampeeHuang/layout-gallery`) → Vercel 自动部署 |
| 注册表 | `registry.json` — 所有模板元数据，Schema 见 `registry.schema.json` |

## 本地运行

```bash
npm install
node server.js
# → http://localhost:3080
```

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

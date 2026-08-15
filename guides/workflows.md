# 工作流 · AI 操作手册

画廊操作入口。命令真相源见 `AGENTS.md` 门禁段，API 真相源见 `server/server.js`（本文不复制端点表，避免漂移）。

## 工作流 1：帮用户做幻灯片

1. 问：什么场景？多少人？什么调性？
2. `GET /api/registry?visual_family=&content_type=&q=` 按身份分类匹配
3. 推荐 2-3 个模板，说明各自特点，让用户选
4. 读 `templates/{slug}/design.md`（设计系统）+ `tokens.json`（token 契约）
5. 生成完整 HTML（拷 `<head>` + `<deck-stage>` + slides）
6. `node scripts/validate.mjs <slug>` 验证
7. 启动 `node server/server.js`，`http://localhost:3080` 预览

约束：一份 deck 一套主题，选中后不中途换 accent 色。

## 工作流 2：查看设计系统

- `GET /api/template/:slug` 元数据
- `GET /api/brand/:slug` 品牌套件（token 键值对 + palette + typography）
- `GET /api/template/:slug/tokens` 原始 CSS 变量
- 或直接读 `templates/{slug}/design.md`

## 工作流 3：迁移旧模板到标准化

1. 审计 `templates/{slug}/`：brand.json + layout.json → tokens.json
2. 写 `tokens.json`（DTCG 格式，`$type` 字段）
3. `node scripts/validate.mjs <slug>` 确保通过
4. `node scripts/compile.mjs <slug> --check` 查 body CSS 硬编码
5. `node scripts/compile.mjs <slug>` 替换 :root
6. 浏览器验证视觉一致性
7. `node scripts/validate.mjs --all` exit 0

## 工作流 4：生成品牌套件页

1. `GET /api/brand/:slug` 看 token 数据
2. 浏览器 `http://localhost:3080/brand/:slug` 看渲染
3. 改 `templates/{slug}/tokens.json` → `scripts/compile.mjs` → 刷新品牌页

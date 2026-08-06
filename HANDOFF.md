# HANDOFF — 版式画廊

date: 2026-08-05

## 当前状态

v2 架构迁移全部完成 + studio 模板导入 + 模板展示页上线。9/9 模板 v2 合规，P0 全通过。
服务器 `localhost:3080` 运行中。
Git: master ahead of origin（未 push）。

## 本次完成

### studio 模板导入
- [x] brand.json + layout.json + design.md + template.html（11 页幻灯）
- [x] registry.json 注册 + token-contract.json templateSpecific 豁免
- [x] P0 验证通过

### 模板展示页 `/template/:slug`
- [x] `scripts/render-markdown.js` — 零依赖 Markdown→HTML 转换器
- [x] `meta/showcase.html` — 展示页模板（design.md + 调色板 + 字号刻度 + iframe 预览）
- [x] `server.js` — `GET /template/:slug` 路由，注入模板自有 token
- [x] `library.html` — 卡片点击改为跳转 `/template/:slug`，底部双链接（设计详情 + 品牌套件）

展示页功能：
- 用模板自己的 brand.json + layout.json token 渲染整页
- design.md 渲染为 HTML（标题、表格、列表、代码）
- 调色板色块（仅域名颜色，过滤 MD3 标准角色）
- 字号刻度实时演示（用实际 font-size 渲染）
- 左侧 sticky iframe 预览模板实际效果

## 待办

- [ ] Google Fonts 检查：studio (Barlow, IBM Plex Mono) 中国网络可能加载失败
- [ ] 确认推公网 + git push
- [ ] 继续导入下一个上游模板（bold-poster 等 ~29 个）
- [ ] brutalist-paper design.md 是 YAML 格式，可转换为 gallery markdown 格式

## 关键文件

| 文件 | 作用 |
|------|------|
| `meta/token-contract.json` | Token 命名合约 |
| `scripts/validate-templates.js` | P0 门禁 CLI |
| `scripts/render-markdown.js` | Markdown→HTML 转换器 |
| `meta/showcase.html` | 模板展示页模板 |
| `server.js` | Express 服务器 + `/template/:slug` 路由 |
| `library.html` | 版式库（卡片→展示页） |

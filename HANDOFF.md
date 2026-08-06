# HANDOFF — 版式画廊

date: 2026-08-06

## 当前状态

v3 架构迁移完成。tokens.json 是唯一真相源，platform/ 工具链替代 scripts/。
28 模板全部通过 validate.mjs，服务器运行中。
Git commit ac73491（master, ahead of origin, 未 push）。

## 本次完成（Phase 1-7）

- [x] platform/compile.mjs — tokens.json → :root CSS + body 硬编码扫描
- [x] platform/validate.mjs — DTCG 类型校验（28/28 PASS）
- [x] platform/recipe-generator.mjs — 27 模板 batch 迁移 brand+layout → tokens.json
- [x] template-swiss 完整配方（hand-crafted tokens.json, themes.json, recipes.md, components.md）
- [x] server/ + public/ 目录迁移，server.js 内联 token 逻辑（去掉 sync-roots 依赖）
- [x] SKILL.md + guides/（how-to-pick, image-conventions, color-systems, checklist）
- [x] brand.json + layout.json 归档到 _archive/templates/
- [x] 旧 scripts/ 归档到 _archive/scripts/（仅保留 growth-agent.js）
- [x] token-contract.json 移入 schemas/
- [x] config/template-manifest.json 归档
- [x] AGENTS.md 删除

## 未完成

- [ ] 4 个模板 body CSS 清理：8-bit-orbit(17)、brutalist-paper(97)、studio(14)、layout-gallery(3) — var() fallback 陷阱
- [ ] 模板 design.md 仍引用 brand.json/layout.json 旧架构，需批量更新「真相源」描述
- [ ] CLAUDE.md 仍描述 brand.json+layout.json 拆分架构（行 310-343），需更新为 tokens.json 单源
- [ ] 推公网部署

## 关键文件

| 文件 | 作用 |
|------|------|
| platform/compile.mjs | 编译器：tokens.json → :root CSS + body 硬编码扫描 |
| platform/validate.mjs | DTCG 类型校验器 |
| platform/recipe-generator.mjs | 旧模板迁移工具 |
| platform/add-template.mjs | 新模板注册 |
| platform/import-upstream.mjs | 上游同步 |
| server/server.js | Express 服务器（3080） |
| server/brand-renderer.js | 品牌套件渲染 |
| schemas/token-contract.json | Token 命名合约 |
| guides/checklist.md | P0 通用门禁 |

## 工具链命令

```bash
node platform/validate.mjs --all          # 全量 token 校验
node platform/compile.mjs <slug>          # 编译单个模板
node platform/compile.mjs <slug> --check  # body CSS 扫描
node platform/recipe-generator.mjs --all  # 批量迁移（跳过已有 tokens.json）
node server/server.js                     # 启动服务
```

# HANDOFF — 版式画廊

date: 2026-08-01

## 骨架系统上线 (Route B 完成)

`template-renderer.js --all` 通过 7 个富骨架渲染 48/49 模板。tokens.json 为唯一真相源。

### 骨架（`templates/skeletons/`）

| 骨架 | 行数 | 路由 |
|------|------|------|
| editorial-single-page | 408 | single-page |
| product-listing | 273 | (待分配) |
| broadside-engine | ~600 | slide-deck: experimental, default |
| blue-professional | ~600 | slide-deck: swiss-minimal, institutional |
| retro-zine | 585 | slide-deck: editorial |
| capsule | 706 | slide-deck: warm-humanist + brand_kit |
| retro-windows | 869 | slide-deck: tech-cyberpunk |

### renderer 改动

- `matchSkeleton()` — template_type + design_style 智能路由
- `buildFontImports()` — 从 tokens.json brandKit.googleFonts 注入
- 7 个 `build*Content()` — 每骨架独立内容构建
- `renderTemplate()` — 注入 `{{FONT_IMPORTS}}` + `{{TOKEN_CSS}}` + 所有占位符

### 标准化 CSS 变量

所有骨架共用 28+ 变量：`--bg`, `--text`, `--accent`, `--accent-alt`, `--line`, `--surface`, `--bg-alt`, `--display`, `--body`, `--mono`, `--hand` 等。

### 验证结果

- 48/48 渲染成功，0 残留 `{{...}}`
- 1 跳过：pin-and-paper (无 tokens.json)

### 下一步

- pin-and-paper 需创建 tokens.json
- 骨架内容为占位文本，可按模板定制
- 新增设计风格时加骨架 + 路由规则

---

## 归档（安全回滚点）

| 方式 | 标识 | 恢复 |
|------|------|------|
| Git commit | `af7dc7a` | `git checkout af7dc7a -- templates/` |
| 本地 zip | `_archive-2026-08-01-templates.zip` (623KB) | 解压覆盖 `templates/` |

---

## extract-tokens.js — 48/49 完成

```bash
node scripts/extract-tokens.js brutalist-paper     # 单个
node scripts/extract-tokens.js --all               # 全量（跳过已有）
node scripts/extract-tokens.js --all --force        # 全量覆盖
```

---

## library.html 弹窗交互打磨

弹窗精简 + 交互统一 + 死代码清理。详见 commit `8f55318`。

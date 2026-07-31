# HANDOFF — 版式画廊

date: 2026-08-01

## 归档完成（安全回滚点）

`template-renderer.js --all` 前已双保险归档：

| 方式 | 标识 | 恢复 |
|------|------|------|
| Git commit | `af7dc7a` | `git checkout af7dc7a -- templates/` |
| 本地 zip | `_archive-2026-08-01-templates.zip` (623KB) | 解压覆盖 `templates/` |

## template-renderer.js — 致命缺陷，禁止 --all

**结论：renderer 当前是页面替换器，不是 token 注入器。跑 --all 会把 47 个高质量原版替换为千篇一律的骨架占位页。**

### 数据

- 骨架只有 2 个：`editorial-single-page.html` (384行) + `product-listing.html` (273行)
- 48 个模板全映射到这两个骨架
- 原版模板 636~2144 行，各有独特设计
- brutalist-paper (406行) 是唯一的受害者——已被覆盖

### 根因

renderer 逻辑是 `skeleton.replace({{PLACEHOLDER}}, value)` ——整页用骨架生成，不保留原版 HTML 结构。正确做法应该是：读原版 template.html → 只替换 `<style>` 内 `:root` 块 → 写回。

### 明天改法

1. **renderer 重构为原位替换**：parse 原版 HTML → 找到 `:root { ... }` 块 → 用 tokens.json 重算 CSS 变量值 → 替换 → 其余 HTML 不动
2. **先恢复 brutalist-paper 原版**：`git checkout af7dc7a -- templates/beautiful-html-templates/brutalist-paper/template.html`，用新 renderer 重新注入 token
3. **逐个验证**：挑 3~5 个不同体量的模板测试，确认 HTML 结构无损
4. 全部通过后再考虑批量

### 关键约束

- 原版 `:root` 变量名不统一（有的是 `--c-bg`，有的是 `--color-bg`），需要 renderer 做变量名映射，不能假设命名规范
- Google Fonts `<link>` 必须保留
- 多页面模板（slide-deck 类）当前骨架根本不支持

---

## extract-tokens.js — 48/49 完成 (2026-08-01)

- pin-and-paper 失败（无 `:root` 无 CSS 变量，需人工）
- 5 个手调 tokens.json 被 `--force` 覆盖，可从 `af7dc7a` 恢复

### CLI

```bash
node scripts/extract-tokens.js brutalist-paper     # 单个
node scripts/extract-tokens.js --all               # 全量（跳过已有）
node scripts/extract-tokens.js --all --force        # 全量覆盖
```

---

## library.html 弹窗交互打磨 (2026-08-01)

弹窗精简 + 交互统一 + 死代码清理。详见 commit `8f55318`。

### Agent 发现机制

server.js `/api/registry` 返回 `html_api` 字段。Agent 通过 API 发现模板 HTML 端点。

---

## 明天优先级

1. **P0** — renderer 重构为原位 token 注入（不改 HTML 结构）
2. **P1** — 恢复 brutalist-paper 原版 + 用新 renderer 验证
3. **P2** — pin-and-paper 手动 tokens.json
4. **P3** — 恢复被覆盖的 5 个手调 tokens.json

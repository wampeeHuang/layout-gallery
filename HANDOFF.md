# HANDOFF — 版式画廊

date: 2026-08-01

## extract-tokens.js — 批量 tokens.json 提取 (2026-08-01)

新建 `scripts/extract-tokens.js`，template.html → tokens.json 自动提取。

### 结果

- 48/49 模板成功提取 tokens.json
- 1 失败：pin-and-paper（无 `:root` 无 CSS 变量，需人工）
- 5 个手动精调的 tokens.json 被 `--force` 覆盖（brutalist-paper 等）

### CLI

```bash
node scripts/extract-tokens.js brutalist-paper     # 单个
node scripts/extract-tokens.js --all               # 全量（跳过已有）
node scripts/extract-tokens.js --all --force        # 全量覆盖
```

### 提取管线

```
template.html → parseRootBlock(:root) → extractVars
→ categorize(typography > spacing > radius > shadow > motion > color)
→ inferColorRoles(命名匹配 → 饱和度启发式)
→ buildTokensJSON → tokens.json
```

### 分类规则排序（关键）

typography/spacing/radius/shadow/motion 必须在 color 之前。color 规则里的 `text` 会贪婪匹配 `--text-xs`，如果 color 排前面会误分类。

### 待做

1. pin-and-paper 手动处理（无 CSS 变量，可能需要手动写 tokens.json）
2. `template-renderer.js --all` 重新渲染 template.html（会覆盖原始文件，需谨慎）
3. `scripts/extract-tokens.js` 备份被覆盖的 5 个手动精调 tokens.json

---

## library.html 弹窗交互打磨 (2026-08-01)

弹窗精简 + 交互统一 + 死代码清理。

### 弹窗当前内容

- 名称、tagline、风格分类、mood 标签、best_for / avoid_for
- 两个按钮：预览模板 + 品牌套件（均白底accent描边 → hover变蓝）
- 原则：鼠标到哪哪变蓝，所以默认不能是蓝的

### Agent 发现机制

server.js `/api/registry` 返回 `html_api` 字段。Agent 通过 API 发现模板 HTML 端点。

### 已删除

SKILL_LABELS、isLocal、copyPath 函数、modal-copy-btn CSS、palette-dot、css-var-row/name/val、modal-agent-hint、usage-hint、来源/密度过滤器、design-systems/ikea-designlang、design-systems/ikea-distill-design

---

## template-renderer.js — 自动渲染管线 (2026-07-31)

tokens.json → template.html 自动生成。

### CLI

```bash
node scripts/template-renderer.js brutalist-paper
node scripts/template-renderer.js --all
```

### 架构

```
tokens.json (唯一数据源)
    │
    ├─→ template-renderer.js ─→ template.html
    └─→ brand-renderer.js    ─→ brand-kit.html
```

### 待做

1. 更多骨架 — single-page-editorial、slide-deck、report
2. 卡片内容数据从 metadata 读取
3. 45 个模板补充 tokens.json ← 48/49 已完成 (2026-08-01)

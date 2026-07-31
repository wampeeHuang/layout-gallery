# HANDOFF — 版式画廊

date: 2026-08-01

## library.html 弹窗交互打磨

弹窗精简 + 交互统一 + 死代码清理。

### 弹窗设计原则

弹窗 = 快速决策（"这个版式适合我吗？"），品牌套件页 = 权威详情（"Token体系是什么？"）。
弹窗不重复品牌套件页内容。

### 弹窗当前内容

- 名称、tagline
- 风格分类（design_style · formality · scheme）
- mood 标签
- best_for / avoid_for
- 两个按钮：预览模板 + 品牌套件（均白底accent描边 → hover变蓝）

### 交互规范

- 两个按钮默认中性（白底 accent 描边），hover 变蓝（accent 实心 + 白字 + 上浮）
- 原则：鼠标到哪哪变蓝，所以默认不能是蓝的

### 已删除的死代码

SKILL_LABELS、isLocal、copyPath 函数、modal-copy-btn CSS、palette-dot、css-var-row/name/val、modal-agent-hint、usage-hint

### Agent 发现机制

server.js `/api/registry` 和 `/api/template/:slug` 返回 `html_api` 字段。
Agent 通过 API 发现模板 HTML 端点，无需读源码。

### 已删除的模板

design-systems/ikea-designlang、design-systems/ikea-distill-design（与 vercel-geist 重复）

---

## template-renderer.js — 自动渲染管线 (2026-07-31)

tokens.json → template.html 自动生成。骨架匹配 + CSS 变量注入 + 内容填充。

### CLI

```bash
node scripts/template-renderer.js brutalist-paper    # 单个模板
node scripts/template-renderer.js --all              # 全部有 tokens.json 的模板
```

### 架构

```
tokens.json (唯一数据源)
    │
    ├─→ template-renderer.js ─→ template.html (产品范例页)
    └─→ brand-renderer.js    ─→ brand-kit.html (品牌套件页)
```

### 待做

1. 更多骨架 — single-page-editorial、slide-deck、report 等
2. 卡片内容数据从 metadata 读取，不硬编码
3. 45 个模板补充 tokens.json

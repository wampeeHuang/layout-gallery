# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

遵守 [FOLDER-CONSTITUTION.md](../FOLDER-CONSTITUTION.md)。视觉设计遵守 [DESIGN.md](../DESIGN.md)。

## 架构

```
registry.json + templates/  ← 唯一真相源（Git 管理）
本地 :3080 → 读全量
线上 Vercel → 读 registry，过滤 visibility=public
```

## 启动

```bash
npm run dev
# → http://localhost:3080
```

## API（AI Agent 调用指南）

### 发现模板

```
GET /api/registry                          → 全量列表
GET /api/registry?type=slide-deck           → 按类型筛选
GET /api/registry?design_style=swiss-minimal → 按风格筛选
GET /api/registry?scheme=dark               → 按配色筛选
GET /api/registry?formality=high            → 按正式度筛选
GET /api/registry?density=high              → 按密度筛选
GET /api/registry?skill=beautiful-html-templates → 按来源筛选
GET /api/registry?q=report                  → 全文搜索（name/tagline/mood）
```

返回：`{ count: N, items: [{ slug, name, tagline, template_type, design_style, mood[], scheme, formality, density, palette[], css_variables[], features[], template_path, ... }] }`

### 获取模板详情

```
GET /api/template/:slug      → 单个模板完整元数据 + CSS 变量合约
GET /api/template/:slug/html → 原始 template.html
```

### 取值速查

```
GET /api/design-styles → 风格大类 + 模板数
```

## registry.json 字段说明（AI Agent 选择模板的决策链）

对 AI 最关键的字段，按决策优先级：

1. `template_type` — 用途类型：slide-deck | single-page | report
2. `design_style` — 风格大类：editorial | swiss-minimal | warm-humanist | tech-cyberpunk | experimental | institutional | eastern-zen
3. `scheme` — 配色方案：light | dark | mixed
4. `formality` — 正式度：low | medium-low | medium | medium-high | high
5. `density` — 信息密度：low | medium | medium-high | high
6. `mood[]` — 情绪标签（71 个）
7. `css_variables[]` — [{ name, default, description }] — AI 不看 HTML 就能知道可调哪些颜色/字体
8. `features[]` — 能力标记：[chart, code, table, citation]
9. `best_for` / `avoid_for` — 适用/不适用场景

## 模板来源

| 来源 | 数量 | 类型 |
|------|------|------|
| beautiful-html-templates | 35 | slide-deck |
| guizang-ppt-skill | 2 | slide-deck |
| frontend-design | 6 | single-page |

总计 43 模板（含在 3 个来源目录下）。

## 目录

```
templates/           ← 43 个模板 HTML（按来源分目录）
registry.json        ← 元数据 + CSS 变量合约（唯一真相源）
server.js            ← Express（端口 3080）
index.html           ← 前端画廊
scripts/             ← 构建/提取脚本
```

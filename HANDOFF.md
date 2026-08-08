# HANDOFF — 2026-08-09 Claude Code 会话

> 上次更新：2026-08-09
> 状态：标签体系整顿完成，品质三级角标上线，library.html 筛选器+tooltip 全部落地，生产服已重启
> 复盘：D:\workspace\_output\retrospectives\2026-08-09-layout-gallery-taxonomy.md

---

## 本次做了什么

### 1. 接入 Codex 架构审查

Codex 在今天上午完成了对项目的完整架构审查（14.5M token），产出详尽交接文档。核心结论：**不推倒重写，旧房改造。** 四个源头仓库职责分离，先建账再修承重墙。

审查文档位于：`_runtime/solution-design/layout-gallery-architecture-review/`

### 2. 跑通基线

```
git status: c539b0d, HANDOFF.md 已修改, CHECKPOINT.md 未跟踪
validate:   35 模板, 28 PASS / 7 FAIL / 77 issues
```

7 个 FAIL 全部是归藏颜色变体，各缺同样 11 个 token（--color-primary 等）。

### 3. 锁定四个源头（data/sources.lock.json）

| 源头 | 版本 | 类型 |
|------|------|------|
| beautiful-html-templates | commit `e5e204f` | 模板源 |
| guizang-ppt-skill | 37 文件 SHA256 快照 | 设计方法论 |
| frontend-slides | commit `9906a34` | Agent 工作流 |
| layout-gallery | commit `c539b0d` | 精选分发层 |

### 4. 建精选账（data/curation.json）

45 条目：28 published + 7 repairing + 10 excluded + 1 reviewing（brutalist-paper 来源待确认）。

7 个 repairing 模板已记录缺失的 11 个 token 和 6 个文件。10 个 excluded 模板来自 beautiful-html-templates 但从未入选，排除理由待评估。

### 5. 产品决策：三级质量体系

不与 Codex 交接冲突——HANDOFF Phase 2 的实施细则。

**方向：** 精选 ⭐ / 可用 📦 / 原料 🔧 三级。精选 = Agent 直接用好，可用 = 能跑需调，原料 = 需配 Skill。

**为什么不分"快餐/法餐"：** 把质量判断推给用户是不负责任。画廊替用户分级，用户看标签就行。

**为什么不统一标准：** 等 35 个都完美才开张不可能。先做 10-15 个精选验证模式，其余保持可用。原料区是护城河——Agent 有手艺才能用，恰好是 gallery 区别于普通模板站的深度。

详细文档：`inbox/quality-tiers.md`（含 35 行进度跟踪表）

### 6. 标签体系整顿 ✅（本会话完成）

~~design_style 实际 16 种值，schema 只认 10 种~~ → **已修。**

**产出：**
- `data/taxonomy.json` — 4 维度标签体系：visual_family(6) + content_type(7) + scheme(3) + tone(8)
- `data/curation.json` — 35 条目全部标注 visual_family / content_type / tone
- `schemas/taxonomy.schema.json` — JSON Schema 验证
- `scripts/validate-taxonomy.mjs` — 三步校验（schema→curation→registry cross-check），exit 0 通过
- `public/library.html` — 筛选器三行改读 taxonomy.json，卡片标签用 taxonomy 中文名，modal 显示分类标签
- `server/server.js` — 新增 GET /api/taxonomy + GET /api/registry 合并 curation 字段 + vf/ct 筛选参数

**分类学要素：**
| 维度 | 互斥 | 值 | 说明 |
|------|------|-----|------|
| visual_family | 是 | editorial/swiss/brutalist/retro/organic/graphic | 长什么样 |
| content_type | 是 | landing/portfolio/blog/corporate/dashboard/ecommerce/personal | 做什么用 |
| scheme | 是 | light/dark/mixed | 色调模式 |
| tone | 否 | dramatic/playful/warm/confident/sober/friendly/upbeat/punchy | 情绪标签 |

**分布：** editorial(17), swiss(5), brutalist(5), graphic(4), organic(3), retro(1) · blog(18), landing(10), corporate(6), portfolio(1)

验证：`node scripts/validate-taxonomy.mjs` → All checks PASS.

### 7. 品质三级角标 ✅

- **SVG 设计** — 取画廊 favicon 三栏 motif，变体表达层级：全实心=精选，两实一虚=可用，一实两虚=原料
- **卡片角标** — 每个模板卡片右上角显示品质角标（27 可用 + 7 原料）
- **品质筛选行** — toolbar 第一行"品质"，四种 chip 各带 SVG 图标，充当图例
- **标签悬停解释** — 四行筛选标签 hover 显示 tooltip（虚线边框 + `::after` 气泡），不用 ? 图标
- CSS 定制：`.filter-label[data-tip]` → `cursor:help` → `::after` 显示解释

---

## 当前文件状态

### 新建文件（本次+上次会话产出）

| 文件 | 说明 |
|------|------|
| `data/sources.lock.json` | 四源头版本锁定 |
| `data/curation.json` | 35 条精选状态 + 三维标签 |
| `data/taxonomy.json` | 4 维度标签体系定义 |
| `data/ai-system-prompt.md` | 从 meta/ 迁移过来 |
| `schemas/taxonomy.schema.json` | taxonomy.json 的 JSON Schema |
| `scripts/validate-taxonomy.mjs` | 三步标签校验脚本 |
| `public/learn.html` | 从 meta/learn-template.html 迁移 |
| `_runtime/architecture-overview.html` | 项目架构可视化（品牌页风格） |
| `inbox/2026-08-07-codex-handoff.md` | Codex 审查交接备份 |
| `inbox/quality-tiers.md` | 三级质量体系 + 跟踪表 |

### 删除

- `meta/` 目录 — learn.html 和 ai-system-prompt.md 均迁出，空目录已删

### 当前目录结构（仅显示相关）

```
layout-gallery/
├── data/
│   ├── sources.lock.json    ← 新建
│   └── curation.json        ← 新建
├── inbox/
│   ├── 2026-08-07-codex-handoff.md   ← 备份
│   ├── quality-tiers.md              ← 新建
│   └── taxonomy-plan.md              ← 新建
├── HANDOFF.md               ← 本文件
├── CHECKPOINT.md            ← Codex 产物，勿删
└── _runtime/
    └── solution-design/
        └── layout-gallery-architecture-review/   ← Codex 审查
```

---

## 下一步执行顺序

### 明天第一件事

按 `inbox/taxonomy-plan.md` 步骤 1 开始：

1. 写 taxonomy.json（6 个 visual_family + 8 个 tone + 收紧后的枚举）
2. 更新 curation.json 每个条目补 visual_family / tone / type 字段
3. 验证：`node -e "require('./data/taxonomy.json')"` 不报错

### Phase 0 剩余

- ⬜ index.html 筛选器也改为读 taxonomy（目前仅 library.html 已改）
- ⬜ 10 个 excluded 模板仍需逐个评估
- ⬜ 7 个 repairing 模板（归藏变体）仍需补 token
- ⬜ grow.html 已下架为"即将开放"预览页（ENABLE_GROW 守卫）
- ⬜ 校验脚本加入 CI（当前仅手动运行）

### Phase 1（精选区开张）

- ~~标签体系整顿~~ → 已完成，taxonomy.json + curation.json + validate-taxonomy.mjs 全部到位
- 选第一个精选模板（建议 broadside 或 studio）
- 走完整闭环：manifest → 截图 → 质量报告 → golden task
- 验证三级体系是否可操作

---

## 关键决策记录

### 决策 1：旧房改造，不重写
来源：Codex 审查。保留现有结构，先建账再修承重墙。

### 决策 2：四源头不合并
beautiful-html-templates / guizang-ppt-skill / frontend-slides / layout-gallery 各有职责边界。

### 决策 3：分三级而不是两级
不分"快餐/法餐"（推责任给用户），也不强求统一标准（自欺欺人）。精选/可用/原料三级，画廊替用户分级。

### 决策 4：registry 是生成物
手工 registry 已漂移。manifest + curation + quality report 是输入，registry 是输出。

### 决策 5：生产读，本地/CI 写
线上公开读，生成/审核/导入放本地。关闭匿名 POST 写入。

### 决策 6：先内容，后网站
模板包、来源、Agent 调用稳定前，不做 UI 重做或静态化。

---

## 红线提醒

- 不改模板 HTML（Phase 0-1 只动数据文件）
- 不删 CHECKPOINT.md
- 不 push
- 不用 PowerShell 重定向写项目文件（避免 UTF-16 LE）
- 不恢复生产匿名写入接口
- 不做 UI 重做

---

## 给下一位 Agent 的口令

1. 先读 inbox/ 下三份 md 文件
2. 读 data/curation.json 了解当前模板状态
3. 从 taxonomy-plan.md 步骤 1 开始执行
4. 每步做完验证，通过再下一步
5. PM 在盯 quality-tiers.md §7 跟踪表

---

## PM 视角：现在什么状态、下一步做什么

> 写给不看代码的人。工程细节在 `inbox/taxonomy-plan.md` 和 `inbox/quality-tiers.md`，这里说人话。

### 现在什么状态

| 维度 | 现状 | 问题 |
|------|------|------|
| 模板数量 | 35 个 HTML 模板 | — |
| 能用的 | 28 个能跑能看 | 缺截图、缺质量报告 |
| 不能用的 | 7 个归藏变体 | 各缺 11 个颜色 token |
| 标签 ✅ | 4 维度体系已上线 | 已整顿，16 种野生值 → 6+7+3+8 体系 |
| 精选 | 0 个 | 没有"Agent 拿去直接用"的模板 |
| 网站 | gallery.evopearl.com 在线 | 筛选器已更新（library.html） |

**一句话：标签搞定了，下一步是贴等级角标 + 做第一个精选。**

### 分 5 步走（按优先级）

#### 第 1 步：整顿标签体系 ✅ 已完成

**做了什么：** 16 种混乱标签重排成 6 个视觉家族 + 7 个内容类型 + 3 个色调 + 8 个情绪调性。35 个模板全部重新打标签。library.html 筛选器改读 taxonomy.json。

**产出：** `data/taxonomy.json` + `data/curation.json`（更新）+ `schemas/taxonomy.schema.json` + `scripts/validate-taxonomy.mjs`
**验证：** `node scripts/validate-taxonomy.mjs` → All checks PASS. 35 templates labeled.
**查看：** http://localhost:3080/library — 三行筛选器（视觉风格/内容类型/色调）

#### 第 2 步：给网站贴等级标签

**做什么：** 每个模板卡片显示 ⭐精选 / 📦可用 / 🔧需Skill 角标。加筛选器。

**PM 怎么看：** 打开 gallery.evopearl.com，每个卡片上有角标，顶部有筛选按钮。点"精选"只显示精选模板。

**产出：** 纯前端改动（index.html + library.html），不改数据库
**验证：** 浏览器打开，28 个显示 📦，7 个显示 🔧
**工期：** 半天

#### 第 3 步：做第一个精选模板

**做什么：** 挑 broadside 或 studio，补齐截图、质量报告、人工评分、金标准测试。走通完整流程，产出操作手册。

**PM 怎么看：** 网站上出现第一个 ⭐ 标签，点进去有 3 张截图轮播、质量评分、使用说明。

**产出：** 1 个 ⭐ 模板 + 操作手册（后面 14 个照搬）
**验证：** `/brand/broadside` 页面显示 3 张截图 + 评分 + 质量报告链接
**工期：** 1-2 天

#### 第 4 步：批量晋升 10-15 个精选

**做什么：** 用第三步验证过的流程，选最有潜力的模板批量操作。

**PM 怎么看：** 精选区开张，首页置顶 10-15 个 ⭐ 模板。

**产出：** 10-15 个 ⭐ 模板
**验证：** gallery.evopearl.com 首页置顶区 ≥ 10 个 ⭐ 卡片
**工期：** 3-5 天

#### 第 5 步：处理剩余欠账

**做什么：** 7 个归藏变体——补 token 升级或用其他方式处理。10 个没入选的模板——逐个评估，好的加入，不好的标注理由。

**PM 怎么看：** 所有 35 个模板都有明确归属，没有"待定"和"未知"。

**产出：** 原料区处理的处理、排除的排除，curation 里没有 Pending review
**验证：** `data/curation.json` 里 status 字段无一空白
**工期：** 2-3 天

### 当前进度跟踪

追踪 quality-tiers.md §7 那张表就行。35 行，逐行更新。

### 架构可视化

HTML 架构总览：`_runtime/architecture-overview.html`（浏览器直接打开即可查看完整架构图）

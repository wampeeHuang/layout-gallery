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

## 新增模板（标准工作流）

```
1. 把 template.html 放到 templates/{skill}/{slug}/template.html
2. 写元数据 JSON（参考 registry.schema.json 字段定义）
3. node scripts/add-template.js <元数据.json>
   → 自动提取 CSS 变量 → 校验 schema → 原子写入 registry.json
```

元数据 JSON 最小示例：
```json
{
  "slug": "my-template",
  "name": "我的模板",
  "skill": "beautiful-html-templates",
  "template_type": "slide-deck",
  "design_style": "editorial",
  "scheme": "light"
}
```

Schema 权威定义：`registry.schema.json`。所有字段、枚举值、必填项以它为准。

## 目录

```
templates/           ← 43 个模板 HTML（按来源分目录）
registry.json        ← 元数据 + CSS 变量合约（唯一真相源）
registry.schema.json ← JSON Schema 合约（字段+枚举+必填项）
server.js            ← Express（端口 3080，线上 PUBLIC_MODE 过滤 visibility=local）
index.html           ← 前端画廊
scripts/
  add-template.js    ← 新增模板（校验+CSS提取+原子写入）
  build-registry.js  ← 一次性迁移脚本（从旧 _index.json，已退役）
  extract-css-vars.js← 批量提取 CSS 变量
```

## 部署状态

**本地：** :3081 运行中。工具架 (:3099) 已注册，id=`layout-gallery`。

**线上：待部署**（3 步，~10 分钟）：
1. 创建 GitHub 仓库 `wampeeHuang/layout-gallery`（旧仓库 `skill-html-showcase` 保留回滚）
2. `git remote add origin` + `git push`
3. Vercel 导入 → 绑定 `layouts.blackcamellia.xin` → 设 `PUBLIC_MODE=true`

域名 `blackcamellia.xin` 在阿里云。Vercel 绑定需加 CNAME 记录。
旧画廊 :3080（`D:\projects\skill-html-showcase`）已停，可回滚。

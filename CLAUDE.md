# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

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
meta/                ← AI 操作文件（ai-prompt.md + token-contract）
  ai-prompt.md       ← 唯一 AI 提示词（原则 + token 表 + 合规清单）
  token-contract.css ← Token 命名契约
  token-contract.json← 机器可读版本
templates/           ← 44 个模板 HTML（按来源分目录）
prototype/           ← 原型文件（品牌套件页等）
registry.json        ← 元数据 + CSS 变量合约（唯一真相源）
registry.schema.json ← JSON Schema 合约（字段+枚举+必填项）
server.js            ← Express（端口 3080，线上 PUBLIC_MODE 过滤 visibility=local）
index.html           ← 前端画廊
scripts/
  add-template.js    ← 新增模板（校验+CSS提取+原子写入）
  build-registry.js  ← 一次性迁移脚本（从旧 _index.json，已退役）
  extract-css-vars.js← 批量提取 CSS 变量
```

## AI 输出治理

本项目 CSS 由 AI 生成，不由人写。`meta/ai-prompt.md` 是唯一的 AI 操作文件：
- **AI 读** `ai-prompt.md` → 生成 CSS → 自审 §7 合规清单（16 项）→ 不合规 = 重新生成
- **闭环中没有人**。AI 自己是第一道也是最后一道防线
- 设计原则体系见 Obsidian `设计原则-通用六条.md`（人读版本）

任何改 CSS 的操作，交付前必须通过 §7 合规清单。

## 文件纪律

### `meta/` — AI 操作文件，不是草稿本

`meta/` 是 AI 生成和审计的接口目录。只放 AI 运行时需要的操作文件：

| 文件 | 性质 | 读者 |
|------|------|------|
| `ai-prompt.md` | AI 提示词（原则 + token 表 + 合规清单） | AI |
| `token-contract.css` | Token 命名契约 | AI |
| `token-contract.json` | 机器可读版本 | AI / MCP API |

**硬规则：**
- `meta/` 不进草稿、不进过程文件、不进实验产物
- 新建文件前问：AI 运行时需要读这个文件吗？不需要 → 不进 meta/
- 过程产物放 `_runtime/`，任务结束删除
- 数据不进原则文件（已踩坑：visual-layer.json、design-principles.md 创建后又删除——两份都是过程文件，不该出现在 meta/）

### 文件创建自检

新建任何文件前：
1. 这个文件 AI 运行时需要吗？不需要 → `_runtime/`
2. 这个数据已有源吗？有 → 不建副本，引用源
3. 这是过程产物吗？是 → `_runtime/`，标注生命周期

## 部署状态

**线上：** https://gallery.evopearl.com（Vercel auto-deploy）
**GitHub：** wampeeHuang/layout-gallery
**本地：** :3081 运行中。工具架 (:3099) 已注册，id=`layout-gallery`。

# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

**MANDATORY: 任何模板改动（CSS/token/:root/registry），交付前必须跑 `node scripts/validate-templates.js`，exit 0 才能报完成。局部通过 ≠ 全局完成。**

## 任务分派（收到用户消息后，先判断再执行）

| 用户意图 | 动作 |
|---------|------|
| 修改模板 CSS / token / :root | 改 → 跑 `validate-templates.js` → exit 0 报完成 |
| 新增模板 | 读 §新增模板 → 按工作流执行 → 跑全量验证 |
| 迁移旧模板 | 读 §存量模板迁移工作流（12 步）→ 逐步执行 |
| 修 bug / 调参数 | 定位文件 → 改 → 跑全量验证 |
| 品牌套件问题 | 改 brand-renderer.js / brand-template.html → 重启 server → curl 验证 |
| 问架构 / 规范 | 读本文档 + `meta/token-contract.json`（MD3 标准） + Obsidian `web-design/md3-color-roles.md` |
| 收件箱有文件 | 检查 `inbox/`，处理完清空 |

## Token 命名标准

**全部颜色 token 采用 Material Design 3 角色体系（29 角色）。**

- 合约文件：`meta/token-contract.json`（W3C DTCG 格式，v4.0.0）
- 人类参考：`meta/TOKEN_STANDARD.md`
- 知识库：`D:\Obsidian\Raw\web-design\md3-color-roles.md`、`design-token-standards.md`
- 全局标准：`D:\Obsidian\Raw\web-design\design-token-standards.md`（四大体系对比）

**迁移完成（2026-08-05）**：6/6 模板已迁移到 MD3 新名。`migrationMap` 保留至下次合约清理。

## 架构

```
data/registry.json + templates/  ← 唯一真相源（Git 管理）
本地 :3080 → 读全量
线上 Vercel → 读 registry，过滤 visibility=public
inbox/                          ← 人-Agent 交互投料区（不进 git）
_archive/                       ← 永久留档（不进 git）
_runtime/                       ← 过程产物（不进 git，可删）
```

## P0 交付门禁（阻断交付，必须全部通过）

```
node scripts/validate-templates.js    # exit 0 = 全部通过，exit 1 = 阻断
```

| 门禁 | 检查什么 | 阈值 |
|------|----------|------|
| `tokens_schema` | brand/layout JSON 六分类 + brandKit 字段完整（v1 tokens.json 兼容） | 0 缺失 |
| `root_sync` | template.html `:root` 值 = brand+layout 合并值（或 tokens.json） | 0 漂移 |
| `standard_vars` | token 命名使用 token-contract.json 标准词汇（brand/layout 分区分检） | 0 方言 |
| `google_fonts` | template.html + token 文件无 Google Fonts 引用 | 0 引用 |
| `hardcoded` | CSS 颜色/字体/圆角/动效使用 var(--*) | 颜色≤10, 其余=0 |

**任何一项不通过 → 不算完成。不允许"局部通过=全局完成"。**

当前状态（2026-08-05）：

| 模板 | 通过 | 备注 |
|------|------|------|
| brutalist-paper | ✅ | — |
| template-swiss | ✅ | — |
| layout-gallery | ✅ | — |
| template | ✅ | — |
| 8-bit-orbit | ✅ | — |
| soft-editorial | ✅ | — |

**6/6 模板全部通过 5 道 P0 门禁。MD3 迁移已完成。**

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
GET /api/template/:slug        → 单个模板完整元数据 + CSS 变量合约
GET /api/template/:slug/html   → 原始 template.html
GET /api/template/:slug/tokens → 纯 CSS 变量键值对（从 template.html 提取）
```

### 品牌套件

```
GET /brand/:slug      → 品牌套件 HTML 页（token 表 + 组件预览 + 复制套件）
GET /brand/:slug.json → 品牌套件结构化数据（AI 可读）
```

### Token 合约

```
GET /api/token-contract → Token 命名标准 JSON
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

## 存量模板迁移工作流

将旧模板从 archive 恢复到标准化管线，11 个 editorial 模板实战验证。

### 执行步骤

```
1. 从 _archive-*.zip 恢复旧 template.html
2. 提取旧 :root → 识别 palette 变量 vs 待映射变量
3. VAR_MAP 映射旧命名 → 标准合约名（--c-* / --color-* / --paper/--ink → --bg/--text）
4. buildStandardRoot(tokens.json) → 生成标准化 :root（29 个合约变量 + 全部分类 token passthrough）
5. extractPreservedVars(旧:root, 标准:root行) → 保留模板特有 palette 变量
6. replaceVarRefs() → CSS 中 var(--旧名) → var(--标准名)
7. stripGoogleFonts() → 删 <link> 和 @import，字体名替换为系统字体栈
8. fixTokensColorNames() + fixTokensFonts() → tokens.json 同步修正
9. 补 brandKit.typeScale + spacingScale（从模板 CSS 推断）
10. 翻译内容为中文（模板 HTML + registry name/tagline/palette）
11. validate-templates.js → 验证通过
12. curl /brand/:slug → 验证无 broken ref、无 Google Fonts、无空白页
```

### AI 判断 vs 自动化

| 步骤 | 性质 | 原因 |
|------|------|------|
| 恢复旧 HTML、提取 :root | **自动化** | 正则匹配，无判断 |
| VAR_MAP 映射 | **自动化** | 查表替换 |
| 识别 palette vs 待映射变量 | **AI 判断** | `--ink` 在 A 模板是语义别名→映射，在 B 模板是 palette 色→保留；碰撞判定需语义理解 |
| 生成标准化 :root | **自动化** | `buildStandardRoot()` |
| 保留 palette 变量 | **自动化** | `extractPreservedVars()` — 排他逻辑：不在标准合约 + 不在 VAR_MAP + 不在 mappedConventions = 保留 |
| 替换 var() 引用 | **自动化** | VAR_MAP 查表 |
| 删 Google Fonts | **自动化** | 正则匹配 |
| typeScale/spacingScale 推断 | **AI 判断** | 需从 CSS font-size/gap/padding 提取并归纳为合理层级 |
| 内容翻译 | **AI 判断** | 自然语言 |
| registry 元数据 | **AI 判断** | name/tagline 需理解模板风格后撰写 |
| 验证 | **自动化** | `validate-templates.js` |
| 浏览器验证 | **自动化** | curl + grep broken refs / Google Fonts / 空白页 |

### AI 判断四原则

#### 1. 变量碰撞判定

问题：旧模板 `--ink: #xxx` 是语义别名（→ 映射为 `--text`）还是 palette 色（→ 保留原名原值）？

**判定标准（按顺序，命中即停）：**

| 优先级 | 判据 | 动作 |
|--------|------|------|
| 1 | 变量名在 VAR_MAP 中 → 查该模板 CSS 中此变量的**用途** | |
| 1a | 仅用于 `color:` / `background:` / `fill:` 等颜色属性 → 可能是 palette | 检查周围变量：同模板有 `--pink` `--cream` 等明显 palette 命名 → **保留** |
| 1b | 用于 `font-family:` / `font-size:` 等排版属性 → 是排版别名 | **映射** |
| 1c | 用于正文 `body { color: var(--ink) }` 且无其他 palette 变量 → 是语义别名 | **映射** |
| 2 | 变量名不在 VAR_MAP → 不在标准合约 → 不匹配任何 mappedConventions | **保留**（当前 `extractPreservedVars` 逻辑） |
| 3 | 同名变量在多个旧模板出现且值各不相同 → 是 palette 色 | **保留** |

**硬规则：** 变量去留判定后，必须在对应模板目录写 `MIGRATION.md` 记录每个变量的判定结果和依据。不要裸跑不留痕。

#### 2. typeScale / spacingScale 推断

从模板 CSS 中提取并归纳为 8 级字号 + 3 级间距。

**字号推断（必须产出 8 个 token）：**

```
--sz-display : 最大字号（hero 区 h1 或等效，含 clamp() 则保留）
--sz-h1      : 次大字号
--sz-h2      : 第三级
--sz-h3      : 第四级
--sz-lead    : 导语/引言字号（略大于 body）
--sz-body    : 正文基准（模板中最常见的基础字号）
--sz-caption : 图注/辅助文字（< body）
--sz-label   : 最小功能字号（tag/pill/按钮）
```

**提取方法：** 对模板 CSS 所有 `font-size` 值 → 去重 → 从大到小排序 → 按密度取 8 个层级。clamp() 值原样保留不展开。

**间距推断（必须产出 3 个 token）：**

```
--gap-lg : 段落/区块级间距（取 gap/padding 中最大的 1-2 个值）
--gap-md : 卡片/组件内间距（取中位数附近）
--gap-sm : 标签/按钮内间距（取最小的 1-2 个值）
```

**硬规则：** 值必须来自模板实际 CSS，不许凭空捏造。deck-stage 模板（1920×1080）的字号通常很大（100-500px），这是正常的，不要"修正"为标准网页字号。

#### 3. 内容翻译

**翻译范围：** 所有 `>` 和 `<` 之间的可见文本。不译：CSS 变量名、class 名、字体名、邮箱地址。

**质量门禁：**
- 翻译后 HTML 中残留英文（非专有名词）>10 个单词 → 不合格
- 短文本（<20 字）用 `>原始<` → `>译文<` 边界替换，安全且精确
- 长文本（>40 字）用精确字符串全局替换
- 含内联 HTML 标签的文本（`<em>` `<br/>` `<strong>`）→ 整个原文精确匹配替换

**硬规则：** 先 `extractEnglishTexts()` 导出全部英文文本清单 → AI 过一遍确认范围 → 再翻译。不要边翻译边发现新文本。

#### 4. name / tagline 撰写

**name（4-8 字）：** 中文名必须独立表意，不让用户需要看懂英文原名。
- 直译优先（Biennale Yellow → 双年展黄）
- 直译不通时取风格特征（Anthropic → 人类学，取模板的研究机构气质）
- 不加"模板""风格""版式"等后缀——名字就是名字

**tagline（15-40 字）：** 一句话说清三个东西：字体特征 + 配色特征 + 整体气质。
- 模式：`[字体] + [配色] + [氛围]`
- 例：`三色编辑系统：灰粉、芥末奶油、深酒红，Bricolage + Instrument Serif 字体组合。`
- 专有名词保留原名（字体名、颜色 hex 值）
- 不加"这个模板""适用于"等元描述——写模板是什么，不写用来干什么

**palette 色板名称：** 用中文描述色相，不直译英文。`cream_yellow` → `奶油` 不是 `奶油黄`。3 字以内。

**硬规则：** 写完后读一遍——去掉模板名，只读 tagline，能猜到说的是哪个模板吗？猜不到 = 重写。

### 本次踩坑及管线硬化

| 坑 | 根因 | 硬化措施 |
|----|------|----------|
| 5 模板空白 — palette 颜色全部丢失 | `extractPreservedVars(oldRoot)` 调用缺 `standardLines` 参数 → `standardLines.forEach` 对 undefined 静默失败 | `sync-roots.js` 加 `--preserve` 模式：合成新 :root 后做旧 :root 变量差集检查，缺失 → fail + 报告 |
| palette 色不进 :root | `buildStandardRoot` 只 passthrough typography/spacing/radius/shadow/motion，漏了 `color` 分类 | 已修复：passthrough 数组加 `'color'` |
| Google Fonts 去不干净 | 删了 template.html 但 tokens.json 字体 token 值仍是 Google Font 名 | `validate-templates.js` 加 Google Fonts 扫描：template.html + tokens.json 双端检查，命中 → fail |
| 卡片介绍英文 | 模板内容翻译了但 registry name/tagline 没动 | 新增检查项：模板内容中文 >50% 时，registry name/tagline 必含中文 |
| `>text<` 边界翻译漏 | 含 `<br/>` `<em>` 等内联标签的文本不匹配 `>text<` 模式 | 翻译用精确字符串替换，不用正则边界匹配 |

### `sync-roots.js` 待改造

当前 `sync-roots.js` 用 `tokens.json → :root` 全量覆盖，**会摧毁模板特有 palette 变量**。改造方向：

```
当前：tokens.json → 全量替换 :root  →  palette 变量丢失
改造：tokens.json → 生成标准化行 → 从旧:root提取非合约变量 → 合并 → :root
      即 buildStandardRoot() + extractPreservedVars() 逻辑内置
```

加 `--check` 模式时做差集审计：旧 :root 有但新 :root 没有的变量 → 列出 + 分类（合约/映射/palette/未知）。

## 新增模板（标准工作流）

### 有上游源（beautiful-html-templates）

```
1. 从 D:\tools\beautiful-html-templates\templates\{slug}\ 取 template.html + template.json + design.md
2. 复制到 D:\workspace\layout-gallery\templates\{slug}\
3. 如需翻页：改 template.html 引用 ../runtime/deck-stage.js
4. node scripts/extract-tokens.js {slug} --force → tokens.json
5. 更新 registry：中文 name/tagline + design_style + 扁平 template_path
6. 重启 server
```

### 无上游源（自制模板）

```
1. 把 template.html 放到 templates/{slug}/template.html
2. 写 design.md（YAML 头定义颜色/排版/间距）
3. 写 template.json（元数据，参考上游格式）
4. node scripts/extract-tokens.js {slug} --force → tokens.json
5. node scripts/add-template.js templates/{slug}/template.json
6. 重启 server
```

## 模板文件命名约定

每个模板目录含 5 个文件（v5 brand/layout 拆分后，tokens.json 过渡期保留）：

### 品牌层（brand.json）

**定义"长什么样"** — 跨站点可复用的视觉语言。迁移时逐值对齐上游 :root。

| 分类 | 变量前缀 | 例子 |
|------|----------|------|
| 颜色角色 | `--color-*` | `--color-primary`, `--color-surface`, `--color-on-surface` |
| 字体家族 | `--font-*` | `--font-display`, `--font-body`, `--font-mono` |
| 动效 | `--ease-*`, `--duration-*` | `--ease-standard`, `--duration-base` |
| 阴影 | `--elevation-*` | `--elevation-sm` |
| 圆角 | `--radius-*` | `--radius-base` |
| 自定义调色板 | 模板特有 | `--paper`, `--ink`, `--sun`（在 token-contract.json templateSpecific 注册） |

### 布局层（layout.json）

**定义"怎么排列"** — 站点自主定义，迁移时不强制对齐上游。改布局不会崩塌品牌。

| 分类 | 变量前缀 | 例子 |
|------|----------|------|
| 字号刻度 | `--text-*` | `--text-3xl`, `--text-base`, `--text-xs` |
| 间距刻度 | `--space-*` | `--space-page-wmax`, `--space-gap`, `--space-3xl` |
| typeScale | `--sz-*` | `--sz-display`, `--sz-body` |
| 纹理/光标 | — | `textures[]`, `cursor{}`（画廊专属） |

### 其他文件

| 文件 | 性质 | 说明 |
|------|------|------|
| `template.html` | 实现 | HTML 成品，引用 `var(--color-*)` 和 `var(--space-*)` |
| `template.json` | 元数据 | 画廊分类/搜索用 |
| `design.md` | 设计意图 | 上游设计规范，迁移时的视觉参考 |
| `tokens.json` | **过渡期保留** | v1 单文件结构，待全部模板拆分后删除 |

**为什么拆：** tokens.json 把品牌和布局混在一起 → 跨站点复用品牌时要从 tokens.json 里扒 → 布局改动了可能误伤品牌。拆开后 brand.json 只管视觉语言，layout.json 只管页面配置，互不干扰。

`deck-stage.js` 翻页器提到 `runtime/` 共享，不每模板复制。模板需要时引用 `../../runtime/deck-stage.js`。

## 目录

```
data/registry.json          ← 模板注册表（唯一真相源，Git 管理）
schemas/registry.schema.json ← JSON Schema 合约（字段+枚举+必填项）
config/template-manifest.json ← 模板文件合约（required/optional + validator 注册）
templates/                  ← 模板（扁平目录，每目录一个模板）
runtime/                    ← 共享运行时（deck-stage.js）
meta/                       ← AI 操作文件 + 品牌套件模板 + nav
prototype/                  ← 原型文件
scripts/
  add-template.js           ← 新增模板（校验+token检查+原子写入 registry）
  validate-templates.js     ← CLI 审计（文件完整性 + :root 同步）
  brand-renderer.js         ← 品牌套件页运行时渲染（/brand/:slug）
  sync-roots.js             ← tokens.json → :root 同步到 template.html
  growth-agent.js           ← 生长 Agent（URL→Puppeteer 抓取→DeepSeek 结构化→tokens.json）— 唯一萃取管线
  _archived/                ← 退役脚本（extract-external-tokens.js 手写版、generate-demo-page.js 通用模板）
  audit-tokens.js           ← Token 角色覆盖审计
  extract-css-vars.js       ← 批量提取 CSS 变量
  build-registry.js         ← 一次性迁移脚本（已退役）
server.js                   ← Express（端口 3080，线上 PUBLIC_MODE 过滤）
index.html                  ← 画廊首页
library.html                ← 模板库浏览页
grow.html                   ← 生长 Agent 操作页
```

## AI 输出治理

本项目 CSS 由 AI 生成，不由人写。`meta/ai-system-prompt.md` 是唯一的 AI 操作文件：
- **AI 读** `ai-system-prompt.md` → 生成 CSS → 自审 §7 合规清单（16 项）→ 不合规 = 重新生成
- **闭环中没有人**。AI 自己是第一道也是最后一道防线
- 设计原则体系见 Obsidian `设计原则-通用六条.md`（人读版本）

任何改 CSS 的操作，交付前必须通过 §7 合规清单。

## 文件纪律

### `meta/` — AI 操作文件，不是草稿本

`meta/` 是 AI 生成和审计的接口目录。只放 AI 运行时需要的操作文件：

| 文件 | 性质 | 读者 |
|------|------|------|
| `ai-system-prompt.md` | AI 提示词（原则 + token 表 + 合规清单） | AI |
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

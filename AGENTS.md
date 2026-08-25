# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

**门禁：任何模板改动，交付前 `node scripts/validate.mjs --all` exit 0 才能报完成。**

## 架构 (v3)

真相单向流：tokens.json → compile.mjs → :root → template.html → server.js → 浏览器。

```
定义层   templates/{slug}/   tokens.json(唯一视觉真相) + template.html(读 token) + design.md(为什么)
契约层   data/               registry(目录契约) + taxonomy(分类枚举)
         schemas/            token-contract(命名契约) + JSON Schema
机器层   scripts/            生成器(compile) + 门禁(validate/check) + 注册(add-template)
生长层   growth/             AI 萃取管线(growth-agent，非确定性，生产不部署)
运行时层 server/             Express :3080，读 registry 渲染 + API
页面层   public/             人读页(index/library/grow) + deck-stage.js
产物层   generated/          quality-report(重跑可得)
```

非 git：inbox/(投料) _runtime/(过程) _archive/(留档) generated/(产物)

## 内容真相源（/learn）

/learn 全部内容（方法论文章、书籍推荐、工具、灵感）真相源在 Obsidian wiki（`D:\Obsidian\wiki\`），网站是派生呈现端。**铁律：改内容先改 wiki 源，过 `D:\Obsidian` 的 `node scripts/check.js wiki` 门禁，再复现到网站；禁止下游先漂移。** 发现下游比上游多内容（描述更全/新增条目）→ 同步回上游，以 wiki 为准。

- 方法论文章已接生成器：改 wiki → `npm run generate:articles` → 复现文章 + 方法论卡片。机制细节（真相流 / 卡片数据源 / demo 双图 / 问号门禁 / 排版契约）见 `guides/methodology-articles.md`。
- 书籍区已接生成器：改 wiki 书籍推荐.md（分组/书单顺序）或 `D:\Obsidian\Raw\书籍\` 书页（英文名/完整简介/封面）→ `npm run generate:books` → 复现 learn.html 书籍卡片 + 缺封面自动补齐。**生成器即门禁**：wikilink 解析、书名字段、内容简介、封面任一缺失 exit 非 0，不得手工改卡片（marker 块全量重写）。
- 工具/灵感区（learn.html）暂手工维护、无生成器——改 wiki 后需手动同步 learn.html，架构未闭环。

## P0 交付门禁

```bash
node scripts/validate.mjs --all    # 全量 PASS, exit 0
node scripts/compile.mjs <slug> --check  # body CSS 硬编码扫描
```

| 门禁 | 检查 | 阈值 |
|------|------|------|
| DTCG $type | value 格式与 $type 匹配 | 0 错误 |
| 必填 token | 16 个合约 token 存在 | 0 缺失 |
| 命名规范 | --kebab-case | 0 违规 |
| 无重复 | 跨 group 无同名 token | 0 重复 |
| body CSS | 无硬编码 hex/rgba/font-family | 0 硬编码 |

## 启动

```bash
node server/server.js    # → http://localhost:3080
```

## API 速查

```
GET /api/registry                      → 全量列表（支持 ?visual_family/content_type/scheme/formality/density/skill/q）
GET /api/registry?q=report             → 全文搜索
GET /api/template/:slug                → 模板详情 + CSS 变量合约
GET /api/template/:slug/html           → 原始 template.html
GET /api/template/:slug/tokens         → CSS 变量键值对
GET /api/template/:slug/audit          → Token 角色覆盖审计
GET /api/brand/:slug                   → 品牌套件结构化数据
GET /brand/:slug                       → 品牌套件 HTML 页
GET /api/token-contract                → Token 命名标准
GET /api/design-styles                 → 风格大类 + 计数
GET /api/prompt                        → AI system prompt
POST /api/grow                         → SSE 生长管线
POST /api/grow/approve                 → 注册到 registry
POST /api/grow/reject                  → 清理临时文件
```

## 模板目录结构

```
templates/{slug}/
  template.html       ← HTML 成品，引用 var(--*)
  tokens.json         ← 唯一真相源（DTCG 格式，6 分类：color/typography/spacing/radius/shadow/motion）
  design.md           ← 设计意图（YAML 头：颜色/排版/间距/动效）
```

## 新增模板

```
1. 准备 template.html + tokens.json + design.md → templates/{slug}/
2. 跑 scripts/add-template.mjs 注册
3. 跑 scripts/validate.mjs {slug} → 验证通过
4. 更新 registry.json（name/tagline 人工撰写）
```

## 工具链

```bash
node scripts/validate.mjs --all          # 全量 token 校验
node scripts/compile.mjs <slug>          # 编译：tokens.json → :root CSS
node scripts/compile.mjs <slug> --check  # body CSS 硬编码扫描
node scripts/add-template.mjs <slug>     # 新模板注册
```

## 部署

- 线上：https://gallery.evopearl.com（Vercel）
- GitHub：wampeeHuang/layout-gallery
- 本地：:3080。工具架 (:3099) 已注册 id=`html-gallery`（机器主键，与 .project 一致；GitHub/Vercel/目录名为 layout-gallery，同一项目）

# 版式画廊 · Layout Gallery

> HTML 模板注册站——AI Agent 发现、预览、调用版式模板的入口。文件即注册，Registry 是唯一真相源。

线上地址: **https://gallery.evopearl.com**

## 快速开始

```bash
npm install
node server/server.js   # → http://localhost:3080
```

## 目录结构

```
layout-gallery/
├── .project                    # Codex 部署配置（id / domain / pipeline）
├── .gitignore                  # git 忽略规则
├── README.md                   # 人：是什么 / 线上地址 / 怎么跑
├── AGENTS.md                   # AI：架构真相 + 门禁命令 + API
├── CLAUDE.md                   # Claude 入口：@AGENTS.md + 专属补充
├── package.json                # 依赖 + npm scripts
├── package-lock.json           # 依赖锁
├── vercel.json                 # Vercel 部署配置
│
├── data/                       # 契约层（目录 + 分类枚举）
│   ├── registry.json           #   模板注册表（目录契约 + 身份分类）
│   ├── taxonomy.json           #   分类维度 + 枚举
│   ├── sources.lock.json       #   上游来源锁
│   └── ai-system-prompt.md     #   agent 提示词
├── schemas/                    # 契约层（命名契约 + JSON Schema）
│   ├── token-contract.json     #   命名契约 ← 视觉命名唯一真相
│   ├── template.schema.json
│   ├── registry.schema.json
│   ├── taxonomy.schema.json
│   └── quality-report.schema.json
├── templates/                  # 定义层（作者真相源，每套 3 文件）
│   └── {slug}/
│       ├── tokens.json         #   唯一视觉真相源（DTCG 格式）
│       ├── template.html       #   可运行基准（读 token）
│       └── design.md           #   为什么 + 换内容规则
├── scripts/                    # 机器层（生成器 + 门禁 + 注册）
│   ├── compile.mjs             #   token → :root CSS
│   ├── tokens-to-css.cjs       #   生成器核心（generateRoot）
│   ├── validate.mjs            #   命名合规 + 类型校验
│   ├── validate-taxonomy.mjs   #   身份分类枚举校验
│   ├── check.mjs               #   总门禁（编排全部）
│   ├── add-template.mjs        #   新模板注册
│   ├── generate.mjs            #   批量生成产物
│   ├── template-package.cjs    #   模板包读取 / 校验
│   └── template-migration-report.mjs  #   迁移报告
├── growth/                     # 生长层（AI 萃取，非确定性，生产不部署）
│   └── growth-agent.js         #   /api/grow 管线
├── server/                     # 运行时层（API + 页面注入）
│   ├── server.js               #   Express :3080
│   ├── brand-renderer.js       #   品牌套件渲染
│   ├── nav.html                #   页面注入片段
│   ├── footer.html             #   页面注入片段
│   └── brand-template.html     #   品牌套件模板
├── public/                     # 页面层（人读页 + 前端运行时）
│   ├── index.html              #   画廊首页
│   ├── library.html            #   版式库浏览器
│   ├── learn.html              #   学习页
│   ├── grow.html               #   AI 萃取界面
│   ├── template-detail.html    #   模板详情页
│   └── deck-stage.js           #   deck 幻灯片组件
└── guides/                     # 指南层（跨模板通用指南）
    ├── how-to-pick.md          #   选模板决策树
    ├── workflows.md            #   AI 操作工作流
    ├── checklist.md            #   P0 门禁
    ├── color-systems.md        #   颜色体系
    ├── image-conventions.md    #   图片约定
    └── research-curation-quality-system-20260809.md  #   策展质量体系

不进 git：inbox/(投料)  _runtime/(过程)  _archive/(留档)  generated/(产物)
```

## 设计哲学

### Registry 是唯一真相源

所有模板元数据在一个 `registry.json` 里。server.js 只做只读投影——不缓存、不建数据库、不搞后台冗余。几十个模板不需要数据库——一个 JSON 文件，人可读可改，git diff 可追踪，AI agent 可直接读写，比管理后台更快。

### 文件即注册

模板三件套放入 `templates/{slug}/`，registry 加一条就上线。没有审批流程，没有管理中心。目录结构本身就是注册表。

### 发现先于调用

画廊的核心价值不是调用模板，是让 Agent 发现有哪些模板、长什么样。分类筛选 + iframe 预览 + 懒加载——先看全貌再选。

## API

| 端点 | 说明 |
|---|---|
| `GET /api/registry` | 模板列表，支持 `?visual_family=&content_type=&scheme=&formality=&density=&skill=&q=` |
| `GET /api/template/:slug` | 单个模板元数据 + CSS 变量合约 |
| `GET /api/template/:slug/html` | 模板原始 HTML |
| `GET /api/template/:slug/tokens` | CSS 变量键值对 |
| `GET /api/template/:slug/audit` | Token 角色覆盖审计 |
| `GET /api/design-styles` | 设计风格枚举值及计数 |

完整 API 见 `AGENTS.md`。

## 添加模板

1. 准备 `template.html` + `tokens.json` + `design.md` → `templates/{slug}/`
2. 跑 `node scripts/add-template.mjs <slug>` 注册
3. 跑 `node scripts/validate.mjs <slug>` 验证通过
4. 更新 `registry.json`（name/tagline 人工撰写）
5. 提交 → GitHub → Vercel 自动部署

## 模板 Schema

每个条目必填: `slug`, `name`, `skill`, `scheme`, `visibility`, `template_path`

完整字段定义见 `schemas/registry.schema.json`。

## 诚实边界

- **模板注册站，不是模板编辑器。** 模板在本仓库 `templates/` 维护，画廊只做展示和发现
- **不支持在线修改。** 更新 registry 或模板需推送 GitHub，走 Vercel 自动部署
- **模板质量取决于上游。** 画廊校验 token 命名合规，但不验证模板 HTML 的视觉可用性
- **不适合超大规模。** 单 JSON 文件 registry，>500 模板时需考虑分页/搜索索引

## License

MIT

# 版式画廊 · Layout Gallery

HTML 模板注册站，为 AI Agent 提供可发现、可预览、可调用的版式模板库。

线上地址: **https://gallery.evopearl.com**

## 目录结构

```
layout-gallery/
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
│   └── brand-renderer.js       #   品牌套件渲染
├── public/                     # 页面层（人读页 + 前端运行时）
│   ├── index.html              #   画廊首页
│   ├── library.html            #   版式库浏览器
│   ├── grow.html               #   AI 萃取界面
│   └── deck-stage.js           #   deck 幻灯片组件
└── guides/                     # 指南层（跨模板通用指南）

不进 git：inbox/(投料)  _runtime/(过程)  _archive/(留档)  generated/(产物)
```

## 本地运行

```bash
npm install
node server/server.js   # → http://localhost:3080
```

## 详情

- 架构 / 门禁 / API / 工具链 → `AGENTS.md`
- 模板字段定义 → `schemas/registry.schema.json`
- 模板选择指南 → `guides/how-to-pick.md`

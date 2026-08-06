# Layout Gallery

版式画廊 — 28 套 HTML 幻灯片模板库。双用途：人类浏览网站 + AI Agent 调用入口。

## 触发条件

当用户需要以下任一操作时激活本技能：

- 制作幻灯片 / PPT / 演示文稿 / deck
- 选模板（按场景、风格、情绪匹配）
- 生成品牌套件（brand kit）
- 查看模板设计系统（token / 颜色 / 字体 / 间距）
- 新模板入库 / 旧模板标准化迁移

## 资源地图

```
layout-gallery/
├── SKILL.md              ← 本文件（你正在读的）
├── CLAUDE.md             ← 项目宪法（Agent 操作红线）
├── server/               ← Express 服务（localhost:3080）
│   └── server.js
├── platform/             ← 工具链
│   ├── compile.mjs       ← tokens.json → :root 编译
│   └── validate.mjs      ← 类型校验（--all 全量）
├── public/               ← 静态页面
│   ├── index.html        ← 画廊首页
│   └── library.html      ← 版式库浏览器
├── guides/               ← 通用指南
│   ├── how-to-pick.md    ← 选模板决策树
│   ├── image-conventions.md
│   ├── color-systems.md
│   └── checklist.md      ← P0 通用门禁
├── templates/            ← 28 套模板
│   └── {slug}/
│       ├── template.html ← 完整 HTML（含 :root + 所有 slide）
│       ├── tokens.json   ← ✨ 唯一真相源（生成架构）
│       ├── design.md     ← 人类可读设计概要
│       ├── recipes.md    ← AI 生成配方
│       ├── themes.json   ← 主题色预设
│       ├── components.md ← 组件类名目录
│       └── screenshot.png
└── data/
    └── registry.json     ← 模板索引（28 条目）
```

## 核心工作流

### 工作流 1：帮用户选模板做幻灯片

1. 问用户：什么场景？多少人？什么调性？
2. 查 `data/registry.json` 或调 `GET /api/registry`，按 `occasion`/`tone`/`mood` 匹配
3. 推荐 2-3 个模板，说明各自特点，让用户选
4. 读对应 `templates/{slug}/design.md` 了解设计系统
5. 读 `templates/{slug}/recipes.md` 看生成配方
6. 查 `templates/{slug}/themes.json` 选主题色
7. 生成完整 HTML（拷贝 `<head>` + `<deck-stage>` + slides）
8. 跑 `node platform/validate.mjs <slug>` 验证
9. 告诉用户：文件已生成，启动 `node server/server.js` 可在 `http://localhost:3080` 预览

### 工作流 2：查看模板设计系统

1. 调 `GET /api/template/:slug` 拿元数据
2. 调 `GET /api/brand/:slug` 拿品牌套件（token 键值对 + palette + typography）
3. 调 `GET /api/template/:slug/tokens` 拿原始 CSS 变量
4. 或者直接读 `templates/{slug}/design.md` 看设计概要

### 工作流 3：迁移旧模板到标准化

1. 审计 `templates/{slug}/`：brand.json + layout.json → tokens.json
2. 写 `tokens.json`（DTCG 格式，`$type` 字段）
3. 跑 `node platform/validate.mjs <slug>` → 确保通过
4. 跑 `node platform/compile.mjs <slug> --check` → 检查 body CSS
5. 跑 `node platform/compile.mjs <slug>` → 替换 :root
6. 创建 `recipes.md` + `themes.json` + `components.md`
7. 浏览器验证视觉一致性
8. 跑 `node platform/validate.mjs --all` → exit 0

### 工作流 4：生成品牌套件页面

1. 调 `GET /api/brand/:slug` 查看 token 数据
2. 浏览器访问 `http://localhost:3080/brand/:slug` 看渲染结果
3. 如需修改：编辑 `templates/{slug}/tokens.json` → `compile.mjs` → 刷新品牌页

## API 端点

| 端点 | 用途 |
|------|------|
| `GET /api/registry?type=&design_style=&q=` | 模板索引（支持过滤+搜索） |
| `GET /api/template/:slug` | 单模板详情 |
| `GET /api/template/:slug/html` | 原始模板 HTML |
| `GET /api/template/:slug/tokens` | CSS 变量键值对 |
| `GET /api/template/:slug/audit` | Token 角色覆盖审计 |
| `GET /api/brand/:slug` | 品牌套件（结构化 token + palette） |
| `GET /api/design-styles` | 所有设计风格及模板数 |
| `GET /api/token-contract` | MD3 Token 命名标准 |
| `GET /api/prompt` | AI 系统提示词 |
| `POST /api/grow` | SSE 生长管线（从 URL 萃取模板） |
| `POST /api/grow/approve` | 注册萃取结果到 registry |
| `POST /api/grow/reject` | 清理临时文件 |

## 工具链

```bash
# 编译（tokens.json → :root CSS）
node platform/compile.mjs <slug>           # 写入 template.html
node platform/compile.mjs <slug> --dry-run # 只输出 :root
node platform/compile.mjs <slug> --check   # 只扫描 body CSS

# 校验（类型 + 必填 + 去重）
node platform/validate.mjs <slug>          # 单模板
node platform/validate.mjs --all           # 全量
```

## 设计原则

1. **tokens.json 是唯一真相源** — 颜色、字体、间距、动效全部从这里生成 :root，不手动编辑 :root
2. **编译器阻断硬编码** — `compile.mjs` 扫描 body CSS，硬编码值不通过
3. **7 文件标准** — 每个模板 template.html + tokens.json + design.md + recipes.md + themes.json + components.md + screenshot.png
4. **MD3 颜色角色** — 标准模板走 29 色体系，模板特有 token 注册在 `meta/token-contract.json` 的 `templateSpecific`
5. **一份 deck 一套主题** — 选中主题后不中途换 accent 色

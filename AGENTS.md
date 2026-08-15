# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

**门禁：任何模板改动，交付前 `node scripts/validate.mjs --all` exit 0 才能报完成。**

## 架构 (v3)

```
tokens.json (DTCG 格式)  ← 唯一真相源
    ↓ scripts/compile.mjs
:root CSS 块注入 template.html

data/registry.json         ← 模板注册表（Git 管理，目录契约）
data/taxonomy.json         ← 分类维度 + 枚举（检索标签唯一真相源）
scripts/                  ← 工具链（compile / validate / add-template）
server/server.js           ← Express :3080
public/                    ← 静态页面（index / library / grow）
schemas/                   ← JSON Schema + token-contract.json
guides/                    ← 跨模板通用指南
inbox/                     ← 人-Agent 投料区（不进 git）
_archive/                  ← 永久留档（不进 git）
_runtime/                  ← 过程产物（不进 git）
```

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
- 本地：:3080。工具架 (:3099) 已注册 id=`layout-gallery`

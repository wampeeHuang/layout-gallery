# HANDOFF — 版式画廊

date: 2026-08-02

## 当前状态

- **49/49 合约合规**，零 Google Fonts，零真实品牌引用
- 服务器 `localhost:3080` 运行中，brand 页正常
- 提交 `48d70f9` 已落地

## 已完成

- [x] 25 个非标模板迁移到 20 标准 CSS 变量名
- [x] 49 模板全量品牌审计（替换 Pinterest/Vercel/IKEA/LinkedIn/Instagram/Figma/Claude/Slack 等）
- [x] 22 个模板推断 typeScale/spacingScale
- [x] 修复 brandKit.colorRoles 同步 + :root 重建
- [x] 修复 brand 页 500（typeScale 格式契约断裂）
- [x] `isShorthandValue()` 守卫：CSS 简写值不参与 VAR_MAP
- [x] `_migrate-editorial.js` 扩展为通用迁移脚本（5 目录全覆盖）

## 待办

### 紧急
- [ ] **brutalist-paper 缺 tokens.json** — 启动审计报 `缺 tokens.json (1): brutalist-paper`
- [ ] 服务器重启后需手动 `node server.js`（无 PM2/systemd 守护）

### 管道加固
- [ ] Google Fonts 扫描进 `validate-templates.js`
- [ ] `sync-roots.js --preserve` 模式：保留模板特有变量不被覆盖
- [ ] template-renderer.js 标准变量名修复（task #38）
- [ ] validator 加标准名强制校验（task #19）

### 内容深化
- [ ] 加深中文翻译：capsule, creative-mode, peoples-platform, playful, studio, coral, bold-poster

## 关键文件

| 文件 | 作用 |
|------|------|
| `scripts/_migrate-editorial.js` | 通用迁移脚本，VAR_MAP + PRESERVE_PATTERNS + isShorthandValue |
| `scripts/brand-renderer.js` | 品牌页渲染，line 584 已加防御 |
| `data/token-contract.json` | 20 标准变量名契约 |
| `scripts/validate-templates.js` | 模板校验器 |

## 复盘

`D:\workspace\_output\retrospectives\2026-08-02-gallery-49-compliance.md`

## 新增 tips（agentboard）

- `css-variable-shorthand-vs-scalar-mapping.md` — CSS 变量映射须区分简写/标量
- `metadata-priority-inversion-actual-vs-hint.md` — 元数据不能覆盖实际数据
- `producer-consumer-format-contract.md` — 生产/消费格式契约须在边界校验

# HANDOFF — 版式画廊

date: 2026-08-05

## 当前状态

MD3 迁移全部完成，遗留兼容层已清理。6/6 模板通过 5 道 P0 门禁。
服务器 `localhost:3080` 运行中，全页面正常。

## 本次完成

- [x] MD3 29 角色体系迁移（color/typography/spacing/radius/shadow/motion）
- [x] 3 处同步迁移（tokens.json :root + template :root + CSS var() 引用）
- [x] 6/6 模板 + 4/4 网站页面逐页验证
- [x] 令牌合约标准化（token-contract.json v4.0.0 + TOKEN_STANDARD.md）
- [x] validate-templates.js 适配嵌套 color 子分组 + migrationMap 过渡
- [x] migrate-tokens.js 三处同步迁移脚本
- [x] archive/ → _archive/，runtime/ → _runtime/ 命名标准化
- [x] legacy aliases 摘除（19 行）
- [x] migrationMap 清理（46 行）
- [x] library 卡片预览不显示——根因 Turbo 合并 <head> 导致首页 CSS 污染
  - server.js: 页面 CSS 标记 data-turbo-track="dynamic"
  - nav.html: 导航状态同步器只注册一次，避免重复绑定
  - index.html: 移除跨页残留的首页 init 监听器
  - library.html: iframe 改用根路径、先绑回调再设 src、窗口 resize 重新缩放

## 待办

- [ ] Derived accent colors 用 CSS color-mix() 恢复（可选）
- [ ] 确认推公网时机

## 关键文件

| 文件 | 作用 |
|------|------|
| `meta/token-contract.json` | Token 命名合约 v4.0.0（MD3 29 角色，migrationMap 已清理） |
| `meta/TOKEN_STANDARD.md` | Token 命名标准（人类参考） |
| `scripts/validate-templates.js` | 5 道 P0 门禁 CLI |
| `scripts/migrate-tokens.js` | MD3 迁移脚本（可复用） |
| `scripts/sync-roots.js` | tokens.json → :root 生成器 |
| `scripts/brand-renderer.js` | 品牌套件页渲染器 |
| `templates/*/tokens.json` | 各模板设计 token（已全部 MD3 迁移） |
| `templates/*/template.html` | 各模板 HTML（已全部 MD3 迁移） |
| `server.js` | Express 服务器，Turbo data-turbo-track="dynamic" 标记 |

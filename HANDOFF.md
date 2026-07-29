# HANDOFF — 版式画廊部署

date: 2026-07-29

## 当前状态

- 线上: https://gallery.evopearl.com
- GitHub: wampeeHuang/layout-gallery
- Vercel auto-deploy: 正常
- 模板数: 44（registry.json），其中 17 个 public
- **一期完成**: Schema 升级 + Token 命名契约 + index.html CSS 变量全量提取
- **本次完成**: 设计原则两层体系 7+5 + AI 提示词合并

## 本次会话完成 (2026-07-29)

### 设计原则体系：两层 7+5

**Layer 1 (Universal, 7)**: #1-6 通用六条 + #7 静态优先
- 锚定 Dieter Rams (1976) + W3C DTCG (2025.10)

**Layer 2 (AI Output Constraints, 5)**: #8 可审计 → #9 确定性 → #10 排版即编辑 → #11 CSS 是接口协议 → #12 按面分级
- 每一条是 AI 输出约束。不合规 = 重新生成
- Layer 3 (项目约定) 为空——项目数据不进原则文件

### 文件合并决策

`meta/design-principles.md` 与 `meta/ai-prompt.md` 内容重叠——原则就是 AI 提示词。
→ 合并为 `meta/ai-prompt.md`（唯一 AI 操作文件，只有 AI 读）
→ 人读版本在 Obsidian `设计原则-通用六条.md`
→ `meta/visual-layer.json` 已删除（数据在 brand-kit-gallery.html 和 ai-prompt.md §5 中，无程序读取）

### 关键修正历程
1. 原 #10 视觉层独立 → 降级为信息架构说明，非原则
2. 原 #11 Anti-Slop → 重写为按面分级（三级边界表）
3. 零碎数 → Layer 2 #9 确定性
4. 换行即设计 → Layer 2 #10（文本层）+ #11（代码层）
5. 静态优先 → Layer 1 #7
6. 全部原则受众从"人审+AI"改为"AI"——人不在循环内
7. Layer 3 归零
8. design-principles.md + ai-prompt.md 合并为单一文件

### 文件更新
- `meta/ai-prompt.md` — 唯一 AI 操作文件（原则 + token 值表 + §7 合规清单），只有 AI 读
- `meta/token-contract.css` — Token 命名契约
- `meta/token-contract.json` — 机器可读版本
- `prototype/brand-kit-gallery.html` — 视觉层面板 + 引用更新指向 ai-prompt.md
- `D:\Obsidian\Raw\web-design\设计原则-通用六条.md` — 人读版本，标注 AI 操作文件路径

## 二期待做

- brand-template.html 元模板（品牌页渲染规则）
- /brand/{slug}/ 品牌套件路由
- 模板迁移试点（选 1 个模板补全 css_variables role/group 映射）
- 动效补充: 页面入场 stagger、卡片骨架屏、品牌 Logo 动效

## 文件清单

- `index.html` — :root 31 tokens，CSS 全量重构
- `prototype/brand-kit-gallery.html` — Token 表 + 视觉层面板 + AI 提示词
- `meta/ai-prompt.md` — 唯一 AI 操作文件（7 原则 + token 表 + 合规清单）
- `meta/token-contract.css` — Token 命名契约
- `meta/token-contract.json` — 机器可读版本
- `registry.schema.json` — role/group 字段已加
- `registry.json` — 示例条目已更新
- `D:\Obsidian\Raw\web-design\设计原则-通用六条.md` — 人读版本

@AGENTS.md

# Claude 专属补充

架构、门禁、API、工具链见 `AGENTS.md`（共享真相）。

## 关键外部参考

- `schemas/token-contract.json` — 16 个必填 token 命名合约
- `guides/checklist.md` — P0 通用门禁
- `guides/how-to-pick.md` — 模板选择指南
- `guides/color-systems.md` — 颜色体系说明
- `guides/image-conventions.md` — 图片约定
- `guides/workflows.md` — 工作流（做幻灯片 / 迁移 / 品牌套件）
- `guides/research-curation-quality-system-20260809.md` — 调研/策展质量系统
- `guides/methodology-articles.md` — 方法论文章体系机制（真相流 / 卡片数据源 / demo 双图 / 问号门禁 / 排版契约）
- `D:\tools\guizang-ppt-skill-main\references\` — 归藏配方上游（themes / layouts / components / checklist）

## 方法论文章（/learn）

wiki 是唯一真相源，`npm run generate:articles` 复现产物。**页面层是呈现端，永远由生成器复现，不手工改 HTML**（含 learn.html 方法论卡片——`METHODOLOGY_CARDS` 双标记区内）。详见 `AGENTS.md` §方法论文章体系 + `guides/methodology-articles.md`。

## 文件纪律

- `inbox/` 是用户投料区，Agent 只读，处理完清空，不往里写
- 过程产物放 `_runtime/`，任务结束删除
- 新建文件前问：AI 运行时需要读吗？不需要 → `_runtime/`
- 不改相邻代码、不顺手重构、不删死代码（除非你制造的孤儿）

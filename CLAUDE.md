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
- `D:\tools\guizang-ppt-skill-main\references\` — 归藏配方上游（themes / layouts / components / checklist）

## 文件纪律

- `inbox/` 是用户投料区，Agent 只读，处理完清空，不往里写
- 过程产物放 `_runtime/`，任务结束删除
- 新建文件前问：AI 运行时需要读吗？不需要 → `_runtime/`
- 不改相邻代码、不顺手重构、不删死代码（除非你制造的孤儿）

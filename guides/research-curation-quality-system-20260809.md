# 精选质量体系外部调研（2026-08-09）

## 调研目标

为 layout-gallery 确定一套可执行、可审计、可持续提升“精选率”的质量体系，同时保持“四层边界，不合并上游”：上游继续创作，layout-gallery 只负责标准化、审查、投影与分发。

重点判断：知识映射类资产能否进入 `curated`，以及“效果可复现”在晋级规则中应当扮演什么角色。

## 关键问题

1. `raw / usable / curated` 是否能覆盖可执行模板、知识映射、工作流与混合包，还是需要拆成多套等级？
2. 成熟体系如何区分资产类型、质量、复现性、来源可信度与展示等级？
3. `curated` 应采用哪些不可被平均分掩盖的硬门槛？
4. 如何在不稀释“精选”含义的情况下，尽可能让更多资产达到精选？
5. 不同资产所声称的“效果”应怎样定义、验证与复现？

## 预期输出

- 外部体系证据与可借鉴原则
- 两个可落地方案的对比与选型
- 分类型的三级质量门禁
- 知识映射的精选判定规则
- 数据模型、审查流水线、迁移与治理建议

## 调研记录

> 本节将在每轮外部检索后持续追加。

### 检索 1：分层、复现与标准化（2026-08-09）

- Databricks 将 Bronze / Silver / Gold 定义为数据随验证、清洗和面向业务的加工逐步增质的流水层；它适合解释“原始摄取 → 标准化 → 消费投影”，但不直接等价于产品认证等级。来源：https://docs.databricks.com/gcp/en/lakehouse/medallion
- ACM 的工件评审把“可获得”“功能完备”“可复用”和“结果已复现”分成不同徽章；核心启示是：资产本体质量与结果复现是两种证据，不能压成一个模糊分数。来源：https://www.acm.org/publications/policies/artifact-review-badging
- DTCG 2025.10 规范提供 token 类型、分组、引用与错误条件，可作为模板类资产的结构合约；但它只证明格式和互操作性，不证明视觉效果。来源：https://www.designtokens.org/tr/2025.10/format/
- 初步判断：`curated` 应是“声明的关键效果已被证据支持”的认证，而不是固定要求某一种文件形态；复现应为独立证据轴并成为精选的必要条件之一。

### 检索 2：知识资产的结构、溯源与复用（2026-08-09）

- W3C PROV-O 用 Entity / Activity / Agent 及派生关系表达“谁、基于什么、通过什么过程产生了当前结果”；这为知识映射的节点/边来源、生成工具版本与审核责任提供了通用模型。来源：https://www.w3.org/TR/prov-o/
- W3C SHACL 把知识图谱的数据图与约束图分开，并要求验证器产出明确的 conformance 与逐项结果；知识映射因此完全可以拥有类似模板 schema gate 的机器门禁。来源：https://www.w3.org/TR/shacl/
- FAIR 原则把 Findable、Accessible、Interoperable、Reusable 作为数字资产可复用的高层条件，并强调机器可读元数据、清晰许可和详细溯源；说明“不是可渲染页面”不等于“无法精选”。来源：https://doi.org/10.1038/sdata.2016.18
- Great Expectations 把 Expectation Suite、固定的 Validation Definition、结果和后续动作分开；可借鉴为“资产类型对应证据配置，运行后生成不可手写的报告”。来源：https://docs.greatexpectations.io/docs/core/run_validations/create_a_validation_definition/
- 初步判断：知识映射的精选效果应定义为“在声明范围内，能稳定支持检索、解释与决策，并可回溯到证据”，而不是套用 token、配方数或视觉评分。

### 检索 3：效果基线、运行谱系与可验证生成（2026-08-09）

- Playwright 的视觉比较把基准图、运行环境和允许差异阈值都显式化，并警告操作系统、浏览器版本、字体与硬件会影响像素结果；所以“跑过一次”不足以称为稳定复现，必须绑定环境矩阵与容差。来源：https://playwright.dev/docs/next/test-snapshots
- Playwright 的 ARIA snapshot 说明视觉快照应与精确断言、可访问性结构断言结合；大快照本身存在被随手接受、掩盖错误的风险。来源：https://playwright.dev/docs/aria-snapshots
- OpenLineage 用 Run / Job / Dataset 和可扩展 Facet 记录运行上下文，适合作为每次审查运行的证据壳；同一资产可保留多次验证事实，而不把一次结果永久写死在 registry。来源：https://openlineage.io/docs/1.40.0/guides/facets/
- SLSA provenance 明确记录产物在何时、何处、以何种过程生成，使消费者能够验证过程、必要时重建产物；其分级也证明“有 provenance”和“provenance 足够抗篡改”是不同成熟度。来源：https://slsa.dev/spec/v1.2/build-track-basics

### 阶段小结（累计 3 轮检索）

1. 湖仓分层适合描述 layout-gallery 的处理流水线，不足以单独定义精选产品承诺。
2. 成熟体系普遍采用多轴证据：结构合规、来源/过程、功能、复用、结果复现彼此独立。
3. 三级标签可以保留，但必须是统一的“信任结论”；各资产类型通过不同 evidence profile 证明同一个结论。
4. “可复现”是精选必要条件，不是充分条件；还需来源许可、声明范围、结构合规、使用说明、人工责任与失效策略。
5. 知识映射可以精选，其可复现效果不是像素，而是限定问题集上的检索/解释/决策表现及逐条证据链。

### 检索 4：知识图谱质量与下游效果（2026-08-09）

- KGrEaT 指出只测知识图谱的正确性与完整性不能代表“是否有用”，并用固定的下游任务设置比较不同知识图谱；这直接支持“结构门禁 + golden questions / downstream tasks”的双层验证。来源：https://arxiv.org/abs/2308.10537
- 知识图谱完整性系统综述归纳了准确性、完整性、时效性、溯源与可访问性等多个质量维度，并强调完整性存在多种语义；因此不能声称“全局完整”，必须先声明范围与使用场景。来源：https://doi.org/10.1109/ACCESS.2021.3056622
- KGQA leaderboard 研究指出，缺少统一、持续维护的基准和可比结果会削弱信任；这支持为知识映射保存版本化 golden question 集、运行配置与历史结果。来源：https://aclanthology.org/2022.lrec-1.321/
- NeurIPS 2025 对 16 个常用 KGQA 数据集的人工审计发现基准自身可能存在明显事实错误；所以 golden 集也必须有来源、评审人和版本，不能把“测试通过”当作无条件真理。来源：https://proceedings.neurips.cc/paper_files/paper/2025/hash/61a57ab030670598c4200b31100d254c-Abstract-Datasets_and_Benchmarks_Track.html
- 进一步判断：知识映射精选应证明“范围内的结构正确 + 来源可信 + 下游任务有效 + 失效时会克制”，而非追求无法验证的绝对完整。

### 检索 5：ACM 分离式认证的细则复核（2026-08-09）

- ACM SIGSIM 采用 ACM 工件徽章规则，将 Functional 定义为已文档化、一致、完整、可执行且带验证证据；Reusable 是在此基础上进一步支持复用与改造；Results Reproduced 则要求他人再次取得主要结果。来源：https://sigsim.acm.org/conf/pads/2026/blog/artifact-evaluation/
- 对 layout-gallery 的直接启示：`usable` 可对应“功能与声明一致”，`curated` 可对应“可复用且关键效果已复现”；但来源可得性、结果复现和展示推荐仍应保留独立证据/状态，避免一个标签承担所有语义。

## 最终调研简报

### 核心结论

采用“统一三级等级 + 分类型 evidence profile”。知识映射可以进入 curated；它用检索、关系解释、边界/拒答、冲突处理、时效和 claim-to-source 溯源证明效果。可复现是 curated 的必要条件，但来源许可、可复用性、人工签署和证据时效同样是硬门禁。

### 关键事实

| 事实 | 对本项目的含义 |
|---|---|
| 湖仓分层强调数据随加工逐步增质 | 可借鉴处理流水线，不应直接等同产品质量标签 |
| ACM 将 Functional、Reusable、Results Reproduced 分开 | usable 与 curated 应区分功能成功、可复用和独立复现 |
| PROV-O / SLSA 明确记录来源、过程和责任主体 | 每份证据必须锁定 source hash、runner/profile 版本和签署人 |
| SHACL 可为知识图谱生成 conformance 报告 | 知识映射能拥有机器硬门禁，不是只能人工主观审查 |
| Playwright 的视觉基线受环境影响 | 模板复现必须固定浏览器、字体、系统和 diff threshold |
| KGrEaT 等研究主张用下游任务评价知识图谱 | knowledge profile 必须包含版本化 golden questions |
| benchmark 自身可能有事实问题 | golden set 也要有来源、版本、评审人和失效机制 |

### 来源表

| 来源 | 类型 | 采用内容 |
|---|---|---|
| https://docs.databricks.com/gcp/en/lakehouse/medallion | 官方文档 | 增量增质分层 |
| https://sigsim.acm.org/conf/pads/2026/blog/artifact-evaluation/ | ACM 官方会议规则 | 工件功能/复用/结果复现分离 |
| https://www.w3.org/TR/prov-o/ | W3C Recommendation | 通用溯源语义 |
| https://www.w3.org/TR/shacl/ | W3C Recommendation | 图约束与验证报告 |
| https://doi.org/10.1038/sdata.2016.18 | 原始研究论文 | FAIR 数字资产复用原则 |
| https://playwright.dev/docs/next/test-snapshots | 官方文档 | 视觉基线、环境与容差 |
| https://slsa.dev/spec/v1.2/build-track-basics | 官方规范 | provenance 成熟度 |
| https://arxiv.org/abs/2308.10537 | 原始研究论文 | 知识图谱下游任务评估 |
| https://aclanthology.org/2022.lrec-1.321/ | 原始研究论文 | KGQA 可比基准与复现信任 |

### 待验证问题

1. `knowledge-map/v1` 的 12 题最低规模是否足以覆盖第一个真实知识映射；应在试点后按覆盖率而非主观感觉调整。
2. 模板家族证据可继承到何种粒度，需要先定义 hash 边界（结构、token、内容、运行环境）。
3. 非确定性 Agent 结果的“独立 runner”应使用同模型不同会话，还是不同模型；V1 建议先固定模型和参数，仅验证流程复现。
4. freshness SLA 应由资产声明并由 profile 给默认值，不能全库统一写死。

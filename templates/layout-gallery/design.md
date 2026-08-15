---
version: 1
name: 版式画廊 · Layout Gallery
description: 以鼠尾草绿、衬线标题、细网格和大留白构成的精选版式目录。结构即纹理；零圆角框架与克制动效强化机构感，不用装饰性假数据制造繁荣。
scheme: light
qualityTier: standard
colors:
  accent: "#3D6B4A"
  accent-soft: "#EEF4EF"
  bg: "#FFFFFF"
  surface: "#F4F4F5"
  text: "#18181B"
  text-soft: "#52525B"
  line: "#D4D4D8"
typography:
  display: "Noto Serif SC, Source Han Serif SC, Songti SC, SimSun, serif"
  body: "Noto Sans SC, Inter, Segoe UI, PingFang SC, system-ui, sans-serif"
  mono: "SF Mono, Consolas, Cascadia Code, ui-monospace, monospace"
spacing:
  page-wmax: 1732px
  page-pad: 48px
  gap: 16px
  gutter: 24px
  section: 64px
radius: 0px
motion:
  duration-base: 200ms
  reduced-motion: required
---

## 设计意图

这是平台自身的标准预览，不是“纸媒宣言”展示页，也不是虚构数据的缩略图陈列。首屏先解释精选边界，目录展示真实可用条目，质量证据与 Agent 使用入口紧随其后。任何数字、等级和状态都必须能追溯到仓库文件或生成报告。

## Anatomy

以下结构均来自当前 `template.html`，可直接被后续 Agent 定位和复用：

| 结构 | 真实用途 | 约束 |
|---|---|---|
| `.masthead` / `.nav` | 品牌身份与页内导航 | 保持低高度、细边线，不增加营销式主导航 |
| `.hero` / `.hero-aside` | 价值主张与收录边界 | 不展示无法验证的模板数量、评分或承诺 |
| `.filters` / `[data-filter]` | 目录筛选状态 | 必须键盘可达；无匹配项时显示真实空状态 |
| `.catalog` / `.template-card` | 实际收录项和版式预览 | 卡片数据必须来自仓库现有 slug；缩略预览体现版式差异 |
| `.evidence-grid` / `.gate` | 质量门禁证据 | 只引用可生成的质量报告，不手写“全部通过” |
| `.agent-panel` / `.read-order` | Agent 最短使用路径 | 明示四文件读取顺序并提供可复制提示词 |
| `.stress` / `.stress-list` | 长文案与混合字符压力测试 | 保留中英数混排、长标题和窄屏检验内容 |

## 使用规则

1. 先读取 `template.json` 确认类型、能力与质量层级。
2. 再读取 `tokens.json`；所有视觉值从 token 引用，正文 CSS 不新增裸色值、像素值或字体栈。
3. 读取本文件理解结构语义，不把示例文案误当成组件 API。
4. 最后以 `template.html` 为唯一可运行基准；复制结构可以，伪造条目和质量结论不可以。
5. 新增交互必须支持键盘和 `prefers-reduced-motion`；不得用行内样式表达运行时状态。
6. 主题只有存在真实差量时才能写入 `tokens.json.themes`，空主题不迁移。

## 上线门禁

```bash
npm run check -- --slug layout-gallery
```

报告写入 `generated/layout-gallery/quality-report.json`。只有该命令 8/8 通过，且目录内容可追溯，才能维持 `standard/listed`；“精选”仍需真实复现证据与人工审查，不由页面自封。

# P0 门禁 Checklist

模板改动交付前必须通过全部门禁。本清单覆盖基础设施 + 风格 A（电子杂志）+ 风格 B（瑞士国际主义）。

## P1 四文件合同（新包默认）

- [ ] `template.json` 存在，且通过 `schemas/template.schema.json`：身份、来源、许可、taxonomy、能力、生命周期齐全
- [ ] `design.md` 是唯一意图文档，包含真实 Anatomy 与 Usage patterns；不再新增 `components.md` / `recipes.md`
- [ ] `tokens.json` 是唯一机器控制面；`themes` 只在存在真实 token 差量时出现
- [ ] `template.html` 是 canonical executable reference，内容可替换后仍能运行
- [ ] `generated/<slug>/` 的质量报告与评审签名只作为派生证据，不回写作者文件
- [ ] legacy 七文件包允许双读，但 `components.md`、`recipes.md`、`themes.json` 不得成为新包的必需输入

迁移/差异报告：

```bash
node scripts/template-migration-report.mjs <slug>
```

新模板注册默认写入 `lifecycle.qualityTier=blocked`、`lifecycle.exposure=hidden`，通过质量与上架门禁后才可提升等级。

---

## 运行验证

```bash
node scripts/validate.mjs --all    # exit 0 才能报完成
node scripts/compile.mjs <slug> --check  # body CSS 硬编码扫描
```

---

## A. 基础设施门禁（所有模板通用）

### Token 完整性
- [ ] `tokens.json` 存在且格式正确
- [ ] 所有必填 token 已声明（16 个合约 token）
- [ ] 无重复 token name
- [ ] 所有 `$type` 与 `value` 格式匹配
- [ ] 命名规范：`--kebab-case`，无违规

### 编译门禁
- [ ] `compile.mjs <slug>` exit 0
- [ ] `compile.mjs <slug> --check` exit 0（无未定义 var() 引用，无 var() fallback 陷阱，无硬编码 hex/rgba/font-family）

### 文件存在（legacy 兼容包）
- [ ] template.html 存在且包含 `:root` 块
- [ ] design.md 存在（四文件必需）
- [ ] recipes.md 存在（legacy 可选）
- [ ] themes.json 存在（legacy 可选）
- [ ] components.md 存在（legacy 可选）

### 语法 & 安全
- [ ] JSON 文件可解析
- [ ] HTML 结构完整（`<html>` / `<head>` / `<body>` 闭合）
- [ ] CSS `:root` 块无语法错误
- [ ] 无 `eval()` / `innerHTML` 注入点

---

## B. 风格 A 电子杂志 · 门禁

### B1. 字体分工（最核心规则）
- [ ] 衬线（`var(--serif-zh)` / `var(--serif-en)`）：标题、金句、数字 — 视觉重音
- [ ] 非衬线（`var(--sans-zh)`）：正文、大段阅读 — 信息密度
- [ ] 等宽（`var(--mono)`）：kicker、meta、foot 标签 — 装饰节奏
- [ ] 英文词强调用 `<em class="en">`（Playfair Display 斜体）

### B2. 主题节奏
- [ ] light/dark 交替，不连续超过 3 页同色
- [ ] hero 只给封面、金句页、章节过渡、结尾
- [ ] hero 页文字要少（遮罩薄，背景复杂）
- [ ] 8 页以上 deck 至少有 1 个 hero dark + 1 个 hero light

### B3. 图片规则
- [ ] 图片网格用 `height:Nvh` 固定高度，不用 `aspect-ratio`
- [ ] 同一组图片同一高度类
- [ ] `object-position:top center`（只裁底部）
- [ ] 信息图/截图加 `.fit-contain`
- [ ] 禁止 `align-self:end`
- [ ] 禁止厚边框/阴影

### B4. chrome vs kicker
- [ ] chrome 左是栏目标签（跨页稳定），右是页号
- [ ] kicker 是本页独一份的引导句
- [ ] chrome 和 kicker 不写同一句话（不同义翻译）

### B5. 动效
- [ ] 所有正文页至少给 kicker/主标题/lead/callout/stat-card/figure 加 `data-anim`
- [ ] Hero 页自动 hero recipe（不需加 `data-animate`）
- [ ] 大引用 → `data-animate="quote"` + `data-anim="line"`
- [ ] Before/After 对比 → `data-animate="directional"` + left/right
- [ ] Pipeline → `data-animate="pipeline"` + `data-anim="step"`
- [ ] `grep -c 'data-anim'` 数量 ≥ 页数 × 3

### B6. 禁止
- [ ] 禁止 emoji 作图标（用 Lucide via CDN）
- [ ] 禁止大标题 1 字 1 行（长标题用 `<br>` 手工断行）
- [ ] 禁止图片原图奇葩比例（固定用 16/10、4/3、3/2、1/1、16/9）

---

## C. 风格 B 瑞士国际主义 · 门禁

### C0. Swiss Locked Mode
- [ ] 正文页只使用 S01-S22
- [ ] 每个 `<section>` 写 `data-layout="Sxx"`
- [ ] 不临时发明 P23/P24 之外的正文结构
- [ ] 顶部中文标题默认左对齐（除 S03/S09/S10）
- [ ] SVG 不写可见文字

### C1. 画布对齐（最常踩）
- [ ] 主体区 `padding:0`，不用二次叠加水平 padding
- [ ] chrome-min 和主体间距由 `chrome-min{margin-bottom:48px}` 提供
- [ ] canvas-card 子元素间用 grid `gap`，不靠 margin/padding 堆
- [ ] split 模式例外：`canvas-card{padding:0}`，half 自己定 padding

### C2. head 区结构
- [ ] kicker（t-meta/t-cat）必须在大标题上方（flex column，不要左右排）
- [ ] head 外层可用 grid `1fr auto`，内层仍保持 flex column

### C3. 字重阶梯
- [ ] 越大越细越小越粗：≥8vw→200，4-7.9vw→200-300，1.8-3.9vw→300-400，1-1.7vw→400-500，13-15px→500-600
- [ ] 同一页内字号小的元素字重 ≥ 字号大的元素
- [ ] 16px 左右小字禁止 weight 300
- [ ] 封面/accent 反白强调用 `italic+weight 300`，不用 accent 色（蓝压蓝）

### C4. 字号下限
- [ ] 正文 ≥ 18px
- [ ] 卡片描述/列表/caption/图注 ≥ 16px
- [ ] meta/kicker/mono label ≥ 14px
- [ ] 内容超出时先删减文案或拆页，不降字号硬塞

### C5. 双约束限高
- [ ] `min(Xvw, Yvh)` 中 Y ≥ X × 1.6
- [ ] h-hero: `min(11.6vw, 19vh)`
- [ ] h-xl 章节标题: `min(7vw, 12vh)` ~ `min(7.4vw, 13vh)`
- [ ] 大数字 KPI: `min(8.4vw, 14vh)`
- [ ] 中文标题根据长度降级（见 recipes.md § 中文大标题字号分档）

### C6. 封面/封底
- [ ] 封面强制 `<section class="slide accent">`（满屏 IKB，不是 light 白底）
- [ ] `.canvas-card` 内首个元素 `<canvas class="ascii-bg">`
- [ ] 封面不要写"01"等大编号（chrome-min 已显示）
- [ ] 封底 `slide.split` + 左 `half.b-accent` + ASCII canvas + 右 paper takeaway
- [ ] 第 03 条 takeaway 用 `var(--accent)` 强调
- [ ] `grep -c "ascii-bg"` ≥ 2

### C7. 卡片填充（互斥）
- [ ] card-fill / card-ink / card-accent 互斥，不混用
- [ ] 禁止 card-accent + 描边
- [ ] 只允许单一 accent 焦点

### C8. 图片规则
- [ ] 图片容器直角无圆角无阴影
- [ ] 单张大图 + KPI → S22（比例 21:9，照片 `object-position:center 35%`）
- [ ] 多图 → S15/S16 原始网格骨架改造（统一比例统一高度）
- [ ] 白底信息图容器用 `var(--paper)` 白底，不用灰底包白图
- [ ] 只有边缘无法区分时才加 `.swiss-lined`
- [ ] 生成图不包含页眉/页脚/标题/页码/角标/边框

### C9. 底部 nav 安全区
- [ ] 内容最低处距分页 dot ≥ 3vh
- [ ] 需要贴底时加 `.nav-safe-bottom` / `.nav-safe-bottom-tight`

### C10. 版式多样性
- [ ] 7-8 页 deck 至少使用 6 个不同 S 编号
- [ ] 不连续 3 页同一种主体结构
- [ ] 内容数据类型必须匹配版式（有数据用 P6/P7/P20/P21，无数据用 P3/P4/P10/P13/P19）

### C11. 动效
- [ ] 每页一个语义化 recipe（不用统一 fade-up）
- [ ] 叶子元素加 `data-anim`，不在容器上加
- [ ] 数据图表页用对应 recipe（tower-grow / hbar-grow / stacked-ledger / tech-spec）

### C12. 禁止
- [ ] 禁止 `text-align:center` 用在顶部中文大标题
- [ ] 禁止卡片加 `border-radius`
- [ ] 禁止自己画 SVG 图标（用 Lucide）
- [ ] 禁止 SVG 里写 `<text>` 可见文字
- [ ] 禁止 9px 圆形装饰点（用 8×8 直角方块或 mono 文字）
- [ ] 禁止图片容器灰底包白底信息图

---

## D. 通用交互门禁

- [ ] ← → 翻页正常
- [ ] 底部圆点数量与总页数匹配
- [ ] chrome 里的页码和实际页号一致
- [ ] 低功耗模式（B 键）停止 WebGL/ASCII RAF，内容仍可见
- [ ] motion.min.js 加载失败时所有 data-anim 强制 opacity:1

---

## 不通过 = 不交付

`node scripts/validate.mjs --all` exit 0 才能报完成。局部通过不等于全局完成。

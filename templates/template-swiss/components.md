# Components · Style B 瑞士国际主义

template.html 已定义所有样式，本文档描述每个组件的用法和约束。

---

## Canvas & Slide 外壳

```html
<section class="slide">          <!-- 默认白底页 -->
<section class="slide grey">     <!-- 95% surface + 5% ink 浅灰底 -->
<section class="slide dark">     <!-- ink 黑底，surface 反白文字 -->
<section class="slide accent">   <!-- accent (IKB) 蓝底，白色文字 -->
<section class="slide accent hero">  <!-- Hero 页：透出 WebGL 网格背景 -->
<section class="slide split">    <!-- 左右对开半屏，canvas-card padding=0 -->
```

**canvas-card** — 瑞士风核心容器（100vw × 100vh，直角无圆角）：

```html
<div class="canvas-card">
  <!-- 所有内容 -->
</div>
```

- `padding: 5.6vh 5vw 4.4vh`，flex column
- `.slide.split .canvas-card` → `padding:0; flex-direction:row`
- `.slide.dark .canvas-card` → ink 底 surface 字
- `.slide.accent .canvas-card` → accent 底 white 字

**dark/accent 交替**：每 2-3 页切换。accent 页只给封面(P1)、收尾(P9)、关键宣言——不连续超过 1 页。

---

## 字体 Typography

Swiss 字体分工是最大规则。风格 A(电子杂志)和风格 B(瑞士)类名同名但语义不同——不可混用。

### Expressive 大字 (vw-based，越大越细)

| Class | 用途 | 字重 | 字号 |
|---|---|---|---|
| `.h-hero` | 英文巨字宣言 | 200 | 11vw |
| `.h-hero-zh` | 中文巨字宣言 | 200 | 8.4vw |
| `.h-xl` | 英文章节标题 | 200 | 6vw |
| `.h-xl-zh` | 中文章节标题 | 200 | 5vw |
| `.h-md` | 中型标题 | 300 | 2.6vw |
| `.h-sub` | 副标题 | 400 | 2.2vw |
| `.lead` | 引导段 | 400 | 1.55vw |
| `.body` | 正文 | 400 | ~1.05vw |
| `.body-sm` | 小正文 | 400 | ~0.84vw |
| `.meta` | mono 元信息 | 500 | ~0.78vw |

**字重阶梯（核心）**："越大越细，越小越粗"

| 字号区间 | 推荐字重 | 典型场景 |
|---|---|---|
| ≥ 8vw | 200 (ExtraLight) | 封面大字、h-statement |
| 4-7.9vw | 200-300 | 章节标题、大编号 |
| 1.8-3.9vw | 300-400 | 中型标题、中号数字 |
| 1-1.7vw / 16-20px | 400-500 | 正文、卡片描述 |
| 13-15px | 500-600 | meta、kicker、caption |

**硬规则**：同一页内，字号越小的元素字重必须 ≥ 字号越大的元素。

### Productive 小字 (px-based，Carbon 2x Grid)

| Class | 用途 | 字重 | 字号 |
|---|---|---|---|
| `.t-cat` | 分类标签 / eyebrow | 600 | 11px |
| `.t-meta` | 页眉页脚 / breadcrumb | 500 | 11px |
| `.t-helper` | 辅助说明 / caption | 400 | 12px |
| `.t-body-sm` | 列表项 / 表格行 | 400 | 14px |
| `.t-body` | 段落 / 描述 | 400 | 16px |
| `.t-body-emp` | 强调正文 | 600 | 16px |
| `.t-h-prod` | section 内标题 | 600 | 20px |

**最小字号下限**（投屏不可更小）：

| 文本类型 | 最小 |
|---|---|
| 正文段落 / 主要说明 | 18px |
| 卡片描述 / 列表 / caption / 图注 | 16px |
| meta / kicker / mono label / 图表标签 | 14px |

**字体栈**：
- `var(--font-body)` = Inter / Helvetica Neue / system-ui（全站 sans-serif）
- `var(--font-mono)` = JetBrains Mono / IBM Plex Mono（数据 / 标签 / chrome）
- 中文大标题字号降级表见 recipes.md § 中文大标题字号分档

**字体强调**：
- 封面/accent 反白大标题内强调字：`font-style:italic;font-weight:300`，不用 accent 色（蓝压蓝看不见）
- mono 数字：`font-feature-settings:"tnum","ss01"`

---

## Chrome & Foot

每页顶部和底部的元信息条：

```html
<header class="chrome-min">
  <div class="l">Section · Chapter Name</div>
  <div class="r">SS · 26.05.10 · 01 / NN</div>
</header>
<!-- 页面主体 -->
<footer class="chrome-min">
  <div class="l">Footnote · Source</div>
  <div class="r">— · —</div>
</footer>
```

**规则**：
- `.chrome-min` 自带 `margin-bottom: 48px (--sp-9)`，不要在主体区额外加 margin-top
- chrome 左是栏目标签（跨页稳定），右是页号
- accent slide 上 chrome 颜色自动适配（`color: rgba(255,255,255,.62)`）

---

## Color & Fill 系统

### Slide 级背景

| Class | 背景 | 文字色 |
|---|---|---|
| (default) | `--paper` #fafaf8 | `--ink` #0a0a0a |
| `.grey` | 95% surface + 5% ink | ink |
| `.dark` | `--ink` #0a0a0a | surface |
| `.accent` | `--accent` (IKB) | white |

### 卡片填充（互斥）

| Class | 角色 | 用法 |
|---|---|---|
| `.card-fill` | 灰底中性卡 | 多卡并列、统计卡、默认选择 |
| `.card-ink` | ink 黑底反转 | hero 块、宣言半屏 |
| `.card-accent` | accent 蓝底唯一焦点 | 一组中突出一项 |
| `.card-outlined` | 描边锚点框 | hairline 分割，非卡片 |

禁止混用：蓝底+描边、灰底+描边。只允许单一 accent 焦点。

### 色块

| Class | 效果 |
|---|---|
| `.accent-block` | accent 蓝底，白色文字，padding 2.4vh 2vw |
| `.ink-block` | ink 黑底，surface 文字 |
| `.grey-block` | 浅灰底 |
| `.mark` | 行内 accent 蓝高亮，白色文字 |
| `.mark.ink` | 行内 ink 黑高亮 |
| `.underline-accent` | accent 蓝底部下划线 |

---

## Grid 网格系统

16 列 Carbon 2x Grid 改造，`gap: 16px`。

### 经典分栏

| Class | 列比 | 用途 |
|---|---|---|
| `.grid-2-7-5` | 7:5 | 左文右图/数据 |
| `.grid-2-6-6` | 1:1 | 左右均分 |
| `.grid-2-8-4` | 8:4 | 左宽右窄 |
| `.grid-2-4-8` | 4:8 | 左窄右宽 |
| `.grid-3` | 1:1:1 | 三列均分 |
| `.grid-3-3` | 1:1:1 × auto | 三列，行高自动 |
| `.grid-4` | 2×2 | 四象限 |
| `.grid-6` | 3×2 | 六格矩阵 |

### 通用 grid

```html
<div style="display:grid;grid-template-columns:repeat(16,1fr);gap:16px">
  <div style="grid-column:span 8">左半</div>
  <div style="grid-column:span 8">右半</div>
</div>
```

### 工具类

| Class | 效果 |
|---|---|
| `.col` | flex column, gap 2vh |
| `.row` | flex row, align center, gap 2vw |
| `.fill` | flex:1 |
| `.center` | 居中 |
| `.top` / `.bottom` | align-self start/end |
| `.va-center` | align-self center |

---

## Kicker & Meta 标签

**t-cat** — 标题上方分类标签（等宽、Semibold、全大写）：

```html
<div class="t-cat">METHODOLOGY · 03</div>
<div class="t-cat accent">PRIMARY FOCUS</div>
```

**t-meta** — 页眉页脚 / breadcrumb（等宽、Medium）：

```html
<div class="t-meta">Section · Chapter · 01 / 22</div>
```

**规则**：
- kicker 必须在大标题上方（上下结构），不要压成左右
- 正文卡片内 kicker 可省略

---

## Cards 卡片

### Sub-card（网格卡片）

```html
<div class="sub-card">
  <div class="nb-corner">01</div>
  <i data-lucide="compass" class="lucide"></i>
  <div class="ttl">卡片标题</div>
  <div class="desc">一行描述文字。</div>
</div>
```

变体：`.sub-card.accent`(蓝底) `.sub-card.ink`(黑底)

### Card fill 通用卡片

```html
<div class="card-fill" style="padding:2.4vh 1.6vw">
  <div class="t-meta">— 01 / SLASH</div>
  <h3>卡片标题</h3>
  <p>描述内容</p>
</div>
```

---

## Stat / KPI 数字

### Stat Card

```html
<div class="stat-card">
  <div class="stat-label">Duration</div>
  <div class="stat-nb">64 <span class="stat-unit">天</span></div>
  <div class="stat-note">从 0 到现在</div>
</div>
```

变体：`.stat-card.thin`(细顶线) `.stat-card.accent-top`(蓝顶线)

### KPI 薄数字

```html
<div class="kpi-thin">90K<span class="unit">+</span></div>
<div class="kpi-thin accent">127×</div>
<div class="kpi-thin-sm">3.4h<span class="unit">/day</span></div>
```

`kpi-thin`(14vw, weight 200) — 越大越细。`kpi-thin-sm`(5.6vw, weight 250)。

### KPI Row（4 列）

```html
<div class="kpi-row-4">
  <div class="kpi-cell">
    <div class="lbl">METRIC A</div>
    <div class="nb">90K<span class="unit">+</span></div>
    <div class="note">说明文字</div>
  </div>
  <!-- ×4 -->
</div>
```

---

## Timeline 时间线

### 纵向 Vertical (P2)

```html
<div class="timeline-v">
  <div class="tl-node">
    <div class="dot"></div>
    <div class="yr">2023</div>
    <div class="multi">1<small class="unit">×</small></div>
    <div class="desc">Prompt Engineering Era</div>
  </div>
  <!-- 重复 N 个 tl-node -->
</div>
```

- axis 列固定 24px，dot 直径 8px，绝对定位对齐虚线
- `.tl-node.accent` — accent 蓝 dot + 蓝数字

### 横向 Horizontal (P11)

```html
<div class="timeline-h">
  <div class="tl-row">
    <div class="th-node up">
      <div class="label">
        <div class="yr">2023</div>
        <div class="name">Phase 1</div>
      </div>
      <div class="dot"></div>
    </div>
    <!-- 交替 up/down，4-7 个节点 -->
  </div>
</div>
```

- dot 8px 实心圆，轴线 1px dashed
- 节点 label 上下交替防碰撞

---

## Bar Chart 柱状图

### 横向 H-Bar (P7)

```html
<div class="h-bar-chart">
  <div class="bar-row">
    <span class="bar-label">Anthropic Advisor</span>
    <span class="bar-track">
      <span class="bar-fill" style="width:84%"></span>
    </span>
    <span class="bar-value">84</span>
  </div>
  <!-- 5-10 rows -->
</div>
```

### KPI Tower 不等高柱 (P6)

```html
<div class="bar-towers">
  <div class="bar-tower">
    <div class="cap"><i data-lucide="layers"></i></div>
    <div class="body-block h-2">
      <div class="lbl">SKILLS</div>
      <div class="nb">90K<span class="unit">+</span></div>
      <div class="sub">跨 14 个领域</div>
    </div>
  </div>
  <!-- ×4，h-1~h-4 不同高度 -->
</div>
```

`.body-block.b-accent` 突出唯一焦点列。

---

## Pipeline / Step 流水线

```html
<div class="pipeline-section">
  <div class="pipeline-label">文本侧 · Text Pipeline</div>
  <div class="pipeline" data-cols="5">
    <div class="step">
      <div class="step-nb">01</div>
      <div class="step-title">Draft</div>
      <div class="step-desc">AI 起草初稿</div>
    </div>
    <!-- 更多 step -->
  </div>
</div>
```

`data-cols="3|4|5|6"`，单行 ≤6 个。

---

## Stack Blocks 三层色块 (P5)

```html
<div class="stack-row">
  <div class="stack-block b-accent">
    <div class="layer-nb">01 / Foundation</div>
    <div class="layer-ttl">第一层标题</div>
    <div class="layer-desc">描述内容</div>
  </div>
  <div class="stack-block b-grey">
    <!-- 同上结构 -->
  </div>
  <div class="stack-block b-ink">
    <!-- 同上结构 -->
  </div>
</div>
```

三色：`b-accent`(蓝) / `b-grey`(灰) / `b-ink`(黑)

---

## Dot / Ring / Cross 矩阵装饰

```html
<div class="dot-mat" style="width:36vw;height:36vw;position:absolute;right:0;top:0"></div>
<div class="ring-mat lg" style="width:18vw;height:18vw;position:absolute;left:5vw;bottom:5vh"></div>
<div class="cross-mat" style="width:24vw;height:24vw"></div>
```

| Class | 效果 | 变体 |
|---|---|---|
| `.dot-mat` | 实心圆点矩阵 | `.lg` `.xl` `.dense` |
| `.ring-mat` | 描边圆圈矩阵 | `.lg` |
| `.cross-mat` | × 号矩阵 (SVG mask) | `.lg` |

位置用 absolute 定位，不占网格流。

---

## Figure 图片框

```html
<figure class="tile">
  <div class="frame-img r-16x10">
    <img src="images/xxx.png" alt="说明">
  </div>
  <figcaption class="swiss-img-caption">
    <strong>图片标题</strong>
    <span>16:10 · cover</span>
  </figcaption>
</figure>
```

### 关键约束

1. 图片网格用 `height:Nvh` 固定高度：`.h-16` / `.h-18` / `.h-22` / `.h-26` / `.h-28` / `.h-32`
2. 单张主图用比例类：`.r-21x9` / `.r-16x9` / `.r-16x10` / `.r-4x3` / `.r-3x2` / `.r-1x1`
3. 同一组图片同一高度类
4. 信息图/截图加 `.fit-contain`，避免文字被裁
5. 纪实照片用 `object-fit:cover`，白底信息图容器背景用 `var(--paper)` 不套灰底
6. 只有图片边缘无法区分时才加 `.swiss-lined`（顶部 accent 线）
7. S22 照片主体放中央安全区：`.pos-face` (center 35%)
8. 禁止图片容器灰底包白底信息图

### Swiss Image Split (P23, 实验)

```html
<div class="swiss-img-split">
  <div class="swiss-img-copy">
    <div class="t-cat accent">Why it matters</div>
    <p class="lead">2-3 行解释。</p>
  </div>
  <figure class="tile">
    <div class="frame-img r-16x10 fit-contain">
      <img src="images/xxx.png" alt="">
    </div>
    <figcaption class="swiss-img-caption">...</figcaption>
  </figure>
</div>
```

变体：`.swiss-img-split.reverse`(左图右文) `.swiss-img-split.align-image-bottom`(底对齐+nav 安全区)

### Swiss Image Grid (P24, 实验)

```html
<div class="swiss-img-grid">
  <figure class="tile">
    <div class="frame-img h-26 fit-contain"><img src="a.png" alt=""></div>
    <figcaption class="swiss-img-caption"><strong>01</strong><span>证据 A</span></figcaption>
  </figure>
  <!-- ×3, 同高同比例 -->
</div>
```

---

## Icons 图标

禁止 emoji。用 Lucide via CDN：

```html
<i data-lucide="compass" class="ico-lg"></i>
<i data-lucide="target" class="ico-md"></i>
<i data-lucide="check-circle" class="ico-sm"></i>
```

| Class | 尺寸 | 用途 |
|---|---|---|
| `.ico-lg` | 2.4vw | pillar / hero 装饰 |
| `.ico-md` | 1.6vw | 列表项 / 标题旁 |
| `.ico-sm` | 1vw | inline |

常用图标：`compass` / `target` / `share-2` / `users` / `crown` / `gem` / `workflow` / `bar-chart-3` / `palette` / `sparkles` / `check-circle` / `x-circle` / `arrow-right` / `arrow-up-right` / `square-stack` / `layers` / `route` / `network` / `grid-2x2` / `trending-up` / `activity` / `star` / `badge-check` / `search-check` / `link` / `handshake` / `repeat` / `eye` / `bookmark`

**禁止自己画 SVG 图标**——用 Lucide。

---

## ASCII 呼吸场 (IKB 封面/封底专用)

```html
<div class="canvas-card">
  <canvas class="ascii-bg" aria-hidden="true"></canvas>
  <!-- 其他内容自动 z-index:1 浮在上层 -->
</div>
```

- 仅用于 P1 Cover（全屏 IKB）和 P9 Closing（左半 IKB）
- 模板底部 IIFE 自动驱动 sin/cos 二维噪声呼吸场
- `.canvas-card > *:not(.ascii-bg)` 自动 `z-index:1`

---

## Cover Split (P1 经典变体)

左 ink + 右 paper 对开封面：

```html
<div class="canvas-card cover-split">
  <div class="cover-ink">
    <span class="t-cat">Volume 18 · 2026</span>
    <h1 class="h-hero">Thin Harness,<br>Fat Skills.</h1>
    <span class="t-meta">— Kevin · 2026-05</span>
  </div>
  <div class="cover-paper">
    <p class="lead">薄型承载层，厚重技能。</p>
    <ul class="meta-list">
      <li>22 PAGES</li><li>SWISS · IKB</li><li>MP-75</li>
    </ul>
  </div>
</div>
```

---

## Duo Compare (P8)

```html
<div class="duo-compare">
  <div class="duo-half">
    <span class="t-cat">Before</span>
    <h2>交给模型</h2>
  </div>
  <span class="vrule"></span>
  <div class="duo-half">
    <span class="t-cat">After</span>
    <h2>交给代码</h2>
  </div>
</div>
```

---

## Closing Split (P9 经典变体)

```html
<div class="closing-split">
  <div class="cl-ink">
    <p class="line-mega">Build it<br>once.</p>
    <p class="line-mega">It runs<br>forever.</p>
  </div>
  <div class="cl-paper">
    <ul class="takeaway-list">
      <li><span class="num">01</span><h4>Skill</h4><p>...</p></li>
      <!-- 2 more -->
    </ul>
  </div>
</div>
```

---

## Swiss Map Component (S08 扩展)

用于地理/路线/人物住所关系。仍是 `data-layout="S08"`，右侧插槽替换为 MapLibre 地图。

### 必要资源

```html
<link href="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.js"></script>
```

### 页面骨架

```html
<section class="slide" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <header class="chrome-min">...</header>
    <h2 class="h-xl-zh">地点标题</h2>
    <div class="history-map-grid">
      <aside class="history-side">
        <div class="history-side-head">
          <div class="big">左侧标题</div>
          <div class="small">辅助说明</div>
        </div>
        <div class="relation-card">
          <div class="nb">01</div>
          <div>
            <div class="ttl">A ↔ B</div>
            <div class="desc">关系说明</div>
          </div>
        </div>
        <!-- 3 more relation-card -->
      </aside>
      <div class="map-panel">
        <div class="map-title">
          <div class="k">RELATION MAP</div>
          <div class="t">地点 / 人物 / 事件</div>
        </div>
        <div class="map-controls">
          <button class="map-ctrl" data-map-ctrl="zoom-in">+</button>
          <button class="map-ctrl" data-map-ctrl="zoom-out">-</button>
          <button class="map-ctrl drag" data-map-ctrl="drag">DRAG</button>
        </div>
        <div id="swiss-map" class="swiss-map" data-points='[...]' data-relations='[...]'>
          <div class="map-static"><!-- fallback --></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 数据契约

```js
const MAP_POINTS = [
  { id: 'a', name: '名称', meta: '标签', coord: [lng, lat], x: 62, y: 68, accent: true },
];
const MAP_RELATIONS = [['a', 'b']];
```

### 硬规则

- 右上角必须有 `+` / `-` / `DRAG` 控制
- 默认禁用滚轮缩放和拖动（避免触发翻页）
- CDN 失败时静态 fallback 仍可读（点位 + 关系线 + 卡片）
- SVG 只画 fallback 关系线，不写文字

完整 CSS + JS 见 `map-component.md`。

---

## Motion 动效系统

Motion One (4KB) 驱动翻页入场动画。

### 数据属性

```html
<section class="slide" data-animate="hero">     <!-- recipe 在 section 上 -->
<div data-anim="head">标题区</div>               <!-- anim 在叶子元素上 -->
<div data-anim="left">左列</div>
<div data-anim="right">右列</div>
<span data-anim="line" style="display:block">引用行</span>
```

### Recipe 一览

| recipe | 触发 | 行为 | 代表版式 |
|---|---|---|---|
| cascade (默认) | 不加 `data-animate` | stagger 淡入，75ms/step | 正文页 |
| hero | `.hero` slide 自动 | 慢节奏，160ms/step | P1/P9 |
| timeline-vertical | `data-animate="timeline-vertical"` | 节点由上到下点亮 | P2 |
| statement-rise | `data-animate="statement-rise"` | 大字按词序错峰升起 | P3 |
| six-cells | `data-animate="six-cells"` | 6 格 z 形顺序点亮 | P4 |
| sub-stack | `data-animate="sub-stack"` | 3 卡阶梯式右滑入 | P5 |
| tower-grow | `data-animate="tower-grow"` | 数字弹入 → tower scaleY 拉起 | P6 |
| hbar-grow | `data-animate="hbar-grow"` | bar width 0→target | P7 |
| duo-mirror | `data-animate="duo-mirror"` | 中线拉开 → 左右镜像入场 | P8 |
| split-statement | `data-animate="split-statement"` | 左 ink 升起 → 右 takeaway 尾随 | P9 |
| matrix-statement | `data-animate="matrix-statement"` | 文字逐行 → 点阵推入 | P10 |
| timeline-walk | `data-animate="timeline-walk"` | 节点左→右依次点亮 | P11 |
| manifesto | `data-animate="manifesto"` | 大字错峰 → ink 条铺开 | P12 |
| three-forces | `data-animate="three-forces"` | 左 hero 横移 → 右卡滑入 | P13 |
| loop-form | `data-animate="loop-form"` | 步骤序列 → SVG 圆环描线 | P14 |
| matrix-fill | `data-animate="matrix-fill"` | 12 格随机棋盘渐显 | P15 |
| field-notes | `data-animate="field-notes"` | 6 卡 z 形顺序点亮 | P16 |
| system-diagram | `data-animate="system-diagram"` | 同心圆外→内 scale | P17 |
| why-now | `data-animate="why-now"` | 三列递进 → 巨数 count-up | P18 |
| four-cards | `data-animate="four-cards"` | 蓝线 width 0→100% → 4 列推入 | P19 |
| stacked-ledger | `data-animate="stacked-ledger"` | 数字升起 → 标签滑入 | P20 |
| tech-spec | `data-animate="tech-spec"` | hero 淡入 → KPI 顶线画出 → 竖线弹起 | P21 |
| image-hero | `data-animate="image-hero"` | 图 zoom-out → 白块推开 → KPI 顶线画出 | P22 |

### 决策树

1. `.hero` slide? → 自动 hero
2. 数据图表 (P2/P6/P7/P20/P21)? → 对应语义 recipe
3. 对比/时间线/系统图 (P8/P11/P14/P17)? → 对应语义 recipe
4. 矩阵/卡片组 (P4/P5/P13/P15/P16/P18/P19)? → 对应语义 recipe
5. 其他 → cascade

### data-anim 加哪里

- 叶子元素：t-cat / h-xl / lead / stat-card / figure / sub-card / tl-node / bar-row
- 多列结构每列加，逐列淡入
- 不在容器（.grid-6 / .canvas-card）上加
- 某页想跳过动效：整页不加 `data-anim`

### 缓动

- `EASE_PROD` `cubic-bezier(.2,0,.38,.9)` — productive (120-240ms)
- `EASE_ENTRY` `cubic-bezier(0,0,.3,1)` — expressive (400-700ms)
- `EASE_PAGE` `cubic-bezier(.77,0,.175,1)` — 翻页 (900ms)

### 降级

Motion One 加载失败 → 所有 `data-anim` 强制 `opacity:1`。低功耗模式 (`body.low-power`) 停止所有动画。

---

## P0 对齐法则

生成每页前必须过这 5 条：

1. **不要二次叠加水平 padding** — `.canvas-card` 自带 `5vw`，主体不能再加水平 padding
2. **kicker 必须在标题上方** — 上下 flex column，不要压成左右
3. **双约束限高 `min(Xvw, Yvh)` 中 Y ≥ X × 1.6** — 防止字号被高度截断
4. **canvas-card 子元素间用 grid gap，不靠 margin/padding 堆**
5. **底部 nav 安全区** — 内容最低处距分页 dot ≥ 3vh

---

## 版式选择速查

| 内容意图 | 版式 |
|---|---|
| Deck 封面 | P1 Cover (accent + ASCII) |
| 演化对比 / 时间轴 | P2 Vertical Timeline |
| 一句口号 / 章节起 | P3 Statement / P10 Dot Matrix |
| 6 项概念定义 | P4 Six Cells |
| 三步流程 | P5 Three Sub-cards |
| 4 项数据高度对比 | P6 KPI Tower |
| 5-10 项排名 | P7 H-Bar Chart |
| Before/After 双轨 | P8 Duo Compare |
| Deck 收尾 | P9 Closing Manifesto |
| 多步流程 (横) | P11 Horizontal Timeline |
| 阶段性结论 + ink 通栏 | P12 Manifesto + Banner |
| 3 概念深化 | P13 Three Forces |
| 闭环流程 | P14 Loop Diagram |
| 8-12 项矩阵 + 总数据 | P15 Image Matrix |
| 6 项快讯小卡 | P16 Multi-card Brief |
| 三层嵌套架构 | P17 System Diagram |
| 三论点 + 数据 | P18 Why Now |
| 4 项等权特性 | P19 Four Cards |
| 4-6 行账单 KPI | P20 Stacked Ledger |
| 产品规格 / benchmark | P21 Tech Spec |
| 案例图 + KPI | P22 Image Hero |
| 地点 / 路线 / 人物关系 | S08 + Swiss Map Component |

---

## 禁止清单

- 禁止 `text-align:center` 用在顶部中文大标题
- 禁止卡片加 `border-radius`（必须直角）
- 禁止 `.card-accent` 上又加描边（填充类型互斥）
- 禁止自己画 SVG 图标（用 Lucide）
- 禁止 SVG 里写 `<text>` 可见文字
- 禁止图片容器灰底包白底信息图
- 禁止 9px 圆形装饰点（用 8×8 直角方块或 mono 文字）
- 禁止大字号不限高（永远 `min(Xvw, Yvh)`）
- 禁止临时发明 P23/P24 之外的正文结构（用 S15/S16/S22 改造）
- 禁止连续 3 页同一种主体结构

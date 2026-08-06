# Components · Style A (电子杂志 × 电子墨水)

template.html 已定义所有样式，本文档描述每个组件的用法和约束。

---

## 基础 Slide 外壳

```html
<section class="slide light">   <!-- 浅色页 -->
<section class="slide dark">    <!-- 深色页 -->
<section class="slide hero light">  <!-- Hero 浅色，遮罩 12-16%，WebGL 大幅透出 -->
<section class="slide hero dark">   <!-- Hero 深色 -->
```

**light/dark 交替**：每 2-3 页切换一次，不连续超过 3 页同色。翻页时 WebGL 自动渐变过渡。

**hero**：只给封面、金句页、章节过渡、结尾。hero 页文字要少——遮罩薄，背景复杂。

---

## 字体 Typography

字体分工是本模板最重要的规则：

| Class | 用途 | 字体 |
|---|---|---|
| `.h-hero` | 超大标题 (Hero 页) | Playfair Display 700, 10vw |
| `.h-xl` | 页面主标题 | Noto Serif SC 700, ~4.6vw |
| `.h-sub` | 副标题 | Noto Serif SC 600, ~3.2vw |
| `.h-md` | 区块小标题 | Noto Serif SC 500, ~1.9vw |
| `.lead` | 引导段（比正文大） | Noto Serif SC 400, ~1.9vw |
| `.kicker` | 标题上方引导句 | IBM Plex Mono, 12px uppercase |
| `.meta-row` | 元信息标签行 | IBM Plex Mono, ~0.88vw |
| `.callout` / `.callout-src` | 引用框 | Noto Serif SC / 衬线 |

**核心规则**：
- 衬线（`var(--serif-zh)` / `var(--serif-en)`）：标题、金句、数字 — 视觉重音
- 非衬线（`var(--sans-zh)`）：正文、大段阅读 — 信息密度
- 等宽（`var(--mono)`）：kicker、meta、foot 标签 — 装饰节奏

**强调技巧**：
- `<em class="en">英文词</em>` → Playfair Display 斜体
- `<em style="opacity:.65">短语</em>` → 标题后半段淡出

---

## Chrome & Foot

每页顶部和底部的元信息条：

```html
<div class="chrome">
  <div>第一幕 · 硬数据</div>
  <div>Act I · 02 / 27</div>
</div>
<!-- 页面主体 -->
<div class="foot">
  <div>页码说明 · Page Description</div>
  <div>— · —</div>
</div>
```

**规则**：
- chrome 左是栏目标签（跨页稳定），右是页号
- foot 左是中文说明，右是英文/装饰标记
- chrome 和 kicker 不写同一句话（见 recipes.md § chrome vs kicker）

---

## Callout 引用框

```html
<div class="callout" data-anim>
  "金句内容，可以换行。<br>第二行。"
  <div class="callout-src">— 出处</div>
</div>
```

不带出处的精简版：去掉 `.callout-src`。

---

## Stat 数字矩阵

```html
<div class="stat-card" data-anim>
  <div class="stat-label">Duration</div>
  <div class="stat-nb">64 <span class="stat-unit">天</span></div>
  <div class="stat-note">从 0 到现在</div>
</div>
```

三段式：`.stat-label` 等宽小标签 → `.stat-nb` 巨数字 → `.stat-note` 注释。
数字 2-3 位字符，用 K/M 简写。常用容器：`.grid-6`(3×2)、`.grid-4`(2×2)。

---

## Tag & Kicker

**Kicker** — 标题上方引导句（等宽、全大写、小字号）：
```html
<div class="kicker">过去 64 天 · 开发篇</div>
```

**Tag** — 标签胶囊：
```html
<div style="display:flex;gap:1.6vw;flex-wrap:wrap">
  <div class="tag">早上 10 点起床</div>
  <div class="tag">周二 / 四下午健身</div>
</div>
```

---

## Figure 图片框

最易踩坑的组件：

```html
<figure class="frame-img r-16x10" data-anim>
  <img src="images/xxx.png" alt="说明">
  <figcaption class="img-cap">平台 · 289K</figcaption>
</figure>
```

### 关键约束

1. **图片网格用 `height:Nvh` 固定高度**，不用 `aspect-ratio`。推荐：`h-16`(小型) / `h-18`(紧凑) / `h-22`(标准) / `h-26`(突出) / `h-28`(大图)。
2. 单张主图用比例类：`.r-16x9` / `.r-16x10` / `.r-4x3` / `.r-3x2` / `.r-3x4` / `.r-1x1`。
3. **同一组图片同一高度类**。
4. `object-position:top center` 已在 CSS 设好，只裁底部。
5. 信息图/截图加 `.fit-contain`，避免文字被裁。
6. 禁止 `align-self:end`。

### 图片占位符

```html
<div class="img-slot r-4x3">
  <span class="plus">+</span>
  <span class="label">截图位置</span>
</div>
```

---

## Pipeline 流水线

```html
<div class="pipeline-section">
  <div class="pipeline-label">文本侧 · Text Pipeline</div>
  <div class="pipeline">
    <div class="step" data-anim="step">
      <div class="step-nb">01</div>
      <div class="step-title">Draft</div>
      <div class="step-desc">AI 起草初稿</div>
    </div>
    <!-- 更多 step -->
  </div>
</div>
```

单行 ≤5 个 step。多组用多个 `.pipeline-section`。

---

## Icons 图标

禁止 emoji。用 Lucide via CDN：

```html
<i data-lucide="compass" class="ico-lg"></i>
<i data-lucide="target" class="ico-md"></i>
<i data-lucide="check-circle" class="ico-sm"></i>
```

常用图标：`compass` / `target` / `share-2` / `users` / `crown` / `gem` / `workflow` / `bar-chart-3` / `palette` / `sparkles` / `check-circle` / `x-circle` / `arrow-right` / `arrow-up-right`

---

## Ghost 巨型背景字

```html
<div class="ghost" style="right:-6vw;top:-8vh">BUT</div>
```

字号 34vw，opacity 0.06。英文单词或数字（01/02/03、BUT/NOW/HERE）。注意同页其他内容加 `z-index:2`。

---

## Highlight 荧光标记

```html
<span class="hi">不是</span>
<span class="hi">一次性爆发</span>
```

文字底部半透明高亮条。只对 1-3 个关键词使用。

---

## Motion 动效系统

Motion One (4KB) 驱动翻页入场动画。降级保底：加载失败时所有 `data-anim` 强制 `opacity:1`。

### 5 种 recipe

| recipe | 触发 | 行为 | 适合 |
|---|---|---|---|
| cascade (默认) | 不加 `data-animate` | 逐个 stagger 淡入, 75ms/step | 正文页 |
| hero | `.hero` slide 自动 | 慢节奏, 160ms/step | 封面/幕封 |
| quote | `data-animate="quote"` | `data-anim="line"` 550ms 逐句揭示 | 大引用 |
| directional | `data-animate="directional"` | `left` 左滑入 → `right` 右滑入 | A vs B |
| pipeline | `data-animate="pipeline"` | 按 →/空格逐步点亮, 全亮才翻页 | 流水线 |

### 决策树

1. `.hero` slide? → 不加，自动 hero
2. 大引用金句? → `data-animate="quote"`
3. 左右对比? → `data-animate="directional"`
4. 分步讲解? → `data-animate="pipeline"`
5. 其他 → 什么也不加，自动 cascade

### data-anim 加哪里

- 叶子元素：kicker / h1 / h-xl / lead / callout / stat-card / figure / tag
- 多列结构每列加，逐列淡入
- 不在容器（`.grid-6` / `.frame`）上加
- 某页想跳过动效：整页不加 `data-anim`

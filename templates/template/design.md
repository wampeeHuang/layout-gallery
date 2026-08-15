---
version: alpha
name: 归藏PPT · Style A 电子杂志
description: Electronic magazine aesthetic — near-black ink on warm grey paper, Playfair Display + Source Serif 4 serif typography. Dual-layer WebGL canvas background with light/dark mode transition. Editorial longform layout with generous whitespace and subtle shadows. Feels like a digital quarterly on a tablet.

colors:
  paper: "#f1efea"
  paper-tint: "#e8e5de"
  ink: "#0a0a0b"
  ink-tint: "#18181a"
  accent: "#333333"
  accent-hover: "#515151"
  accent-alt: "#888888"
  line: "rgba(10, 10, 11, 0.18)"
  surface: "#f1efea"

color-aliases:
  background: paper
  text-primary: ink
  text-secondary: ink-tint
  border: line

typography:
  serif-en:
    fontFamily: "Playfair Display, Source Serif 4, Georgia, serif"
    role: "English serif display"
  serif-body-en:
    fontFamily: "Source Serif 4, Georgia, serif"
    role: "English serif body"
  serif-zh:
    fontFamily: "Noto Serif SC, source-han-serif-sc, serif"
    role: "Chinese serif"
  sans-zh:
    fontFamily: "Noto Sans SC, source-han-sans-sc, sans-serif"
    role: "Chinese sans"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    role: "code and labels"

spacing:
  page-wmax: 1200px
  page-pad: 32px
  gap: 24px
  gutter: 24px
  space-2xl: 48px
  space-lg: 24px
  space-sm: 12px
  space-2xs: 4px

radius: 0px
scheme: light

shadows:
  shadow-sm: "0 1px 3px rgba(0,0,0,0.06)"
  shadow-md: "0 8px 30px rgba(0,0,0,0.1)"

motion:
  ease-default: "0.18s ease"
  duration-base: 150ms


---

# Recipes · Style A (电子杂志 × 电子墨水)

AI Agent 用此模板生成幻灯片的操作配方。10 种布局骨架，每种都是完整可粘贴的 `<section class="slide ...">...</section>` 代码块。

---

## 前置条件

- `tokens.json` 已编译到 `template.html` 的 `:root` 块
- `runtime/deck-stage.js` 加载为 Web Component
- 主题色从 `themes.json` 的 5 套预设中选一套，不允许自定义 hex

---

## 生成前必读 (Pre-flight)

### A. 类名约束

所有类名来自 `template.html` 的 `<style>` 块，不发明新类名。不确定时 grep template.html 确认。
如需自定义，用 `style="..."` inline。

### B. 图片比例规范

| 场景 | 推荐比例 | 写法 |
|------|---------|------|
| 左文右图 主图 | 16:10 或 4:3 | `.frame-img.r-16x10` 或 `.frame-img.r-4x3` |
| 图片网格（多图对比） | 统一 | `.frame-img.h-22` / `.frame-img.h-26`，不用 aspect-ratio |
| 小型面板组 | 统一 | `.frame-img.h-16` / `.frame-img.h-18`，同组同高 |
| 左小图 + 右文字 | 1:1 或 3:2 | `.frame-img.r-1x1` 或 `.frame-img.r-3x2` |
| 全屏主视觉 | 16:9 | `.frame-img.r-16x9` |
| 信息图 / 截图再设计 | 16:9 或 16:10 | `.frame-img.r-16x9.fit-contain` |
| 图文混排小插图 | 3:2 或 3:4 | `.frame-img.r-3x2` 或 `.frame-img.r-3x4` |

图片必须包在 `<figure class="frame-img">` 里。默认 `object-fit:cover + object-position:top center`，只裁底部。信息图和截图加 `.fit-contain`。

### C. 图片垂直对齐

- 左文右图页：图片从正文高度开始，可加 `style="margin-top:7vh"` 到 `9vh`
- 信息图对齐正文首行或说明文字，不跟大标题顶端齐平
- 多图面板统一高度类，不混用
- 禁止 `align-self:end`（flex/grid 外无效）或 `position:absolute + bottom:0`（会被 foot 遮挡）

### D. 标题与正文间距

- 两段式页面标题和内容间 `margin-top:6vh` 到 `8vh`
- 居中大标题用 `.center` 或 `text-align:center; margin-inline:auto`

---

## 主题节奏规划

每页 `<section>` 必须带 `light` / `dark` / `hero light` / `hero dark`。JS 根据 class 推断主题切换 WebGL canvas。

### 按布局默认主题

| Layout | 默认主题 | 原因 |
|---|---|---|
| 1. 开场封面 | `hero dark` | 开场仪式感 |
| 2. 章节幕封 | `hero dark` 与 `hero light` 交替 | 呼吸节奏 |
| 3. 大字报(数据) | `light` | 数字需纸白底 |
| 4. 左文右图 | `light` / `dark` 交替 | 节奏主力 |
| 5. 图片网格 | `light` | 截图需亮底 |
| 6. Pipeline | `light` | 流程图需清晰 |
| 7. 问题页 | `hero dark` | 强视觉冲击 |
| 8. 大引用 | `dark` 优先 | 金句仪式感 |
| 9. 对比页 | `light` | 双列需清晰 |
| 10. 图文混排 | `light` / `dark` 交替 | 节奏 |

### 节奏硬规则

- 禁止连续 3 页以上相同主题
- 禁止 8 页以上 deck 没有至少 1 个 `hero dark` + 1 个 `hero light`
- 禁止整个 deck 只有 light 没有 dark
- 每 3-4 页插入 1 个 hero

### 8 页节奏模板

| 页 | 主题 | 布局 |
|---|---|---|
| 1 | `hero dark` | 封面 |
| 2 | `light` | 大字报 |
| 3 | `dark` | 左文右图 |
| 4 | `light` | Pipeline |
| 5 | `hero light` | 章节幕封 |
| 6 | `dark` | 左文右图 or 大引用 |
| 7 | `hero dark` | 问题页 |
| 8 | `light` | 大引用/结尾 |

---

## 动效系统 (Motion One 驱动)

在 `<section>` 上加 `data-animate="<recipe>"` 选择动画风格；每个入场元素加 `data-anim`。翻到此页时 Motion One 逐个淡入。

| recipe | 效果 | 适合布局 |
|---|---|---|
| 默认(cascade) | 自动级联淡入 | 正文页 (Layout 3/4/5/10) |
| `hero` | 更慢更有仪式感 | hero 页 (Layout 1/2/7) |
| `quote` | 逐句揭示, 550ms stagger | 大引用 (Layout 8) |
| `directional` | 左进→分割→右进 | 对比 (Layout 9) |
| `pipeline` | 按→/空格逐步点亮, 全亮才翻页 | 流水线 (Layout 6) |

降级保底：motion.min.js 加载失败时，所有 `data-anim` 元素强制 `opacity:1`。不带动效的页不加 `data-anim` 即可。

---

## 基础结构

```html
<section class="slide [light|dark|hero light|hero dark]">
  <div class="chrome">
    <div>栏目名 · 子标签</div>
    <div>ACT · 页号 / 总页数</div>
  </div>
  <!-- 主内容 -->
  <div class="foot">
    <div>页码说明 · Page Description</div>
    <div>— · —</div>
  </div>
</section>
```

### chrome 和 kicker 区分

| 位置 | 角色 | 性质 | 例子 |
|------|------|------|------|
| `.chrome` 左上 | 杂志页眉/导航元数据 | 稳定，跨页可复用 | "Act II · Workflow" |
| `.chrome` 右上 | 页号 + 幕号 | 固定格式 | "Act II · 15/25" |
| `.kicker` | 本页独一份的引导句 | 每页不同，短句有戏剧性 | "BUT" / "Phase 01 · 设计阶段" |

chrome 是栏目标签，kicker 是本页钩子，不互相翻译。

---

## Layout 1: 开场封面 (Hero Cover)

```html
<section class="slide hero dark">
  <div class="chrome">
    <div>A Talk · 2026</div>
    <div>Vol.01</div>
  </div>
  <div class="frame" style="display:grid; gap:4vh; align-content:center; min-height:80vh">
    <div class="kicker" data-anim>私享会 · 作者名</div>
    <h1 class="h-hero" data-anim>主标题</h1>
    <h2 class="h-sub" data-anim>副标题</h2>
    <p class="lead" style="max-width:60vw" data-anim>
      一句有力的引语，点破主题。
    </p>
    <div class="meta-row" data-anim>
      <span>演讲者</span><span>·</span><span>身份描述</span>
    </div>
  </div>
  <div class="foot">
    <div>一场关于主题的分享</div>
    <div>— 2026 —</div>
  </div>
</section>
```

**要点**：`hero dark` 让 WebGL 暗底透出。`h-hero` 最大字号 10vw。`min-height:80vh + align-content:center` 垂直居中。

---

## Layout 2: 章节幕封 (Act Divider)

```html
<section class="slide hero light">
  <div class="chrome">
    <div>第一幕 · 硬数据</div>
    <div>Act I · 01 / 25</div>
  </div>
  <div class="frame" style="display:grid; gap:6vh; align-content:center; min-height:80vh">
    <div class="kicker" data-anim>Act I</div>
    <h1 class="h-hero" style="font-size:8.5vw" data-anim>硬数据</h1>
    <p class="lead" style="max-width:55vw" data-anim>
      先看数字，再谈方法。
    </p>
  </div>
  <div class="foot">
    <div>第一幕引子</div>
    <div>— · —</div>
  </div>
</section>
```

**要点**：极简，kicker + 大标题 + 引语。两个幕封交替 hero light / hero dark。字号视长度调 8-10vw。

---

## Layout 3: 数据大字报 (Big Numbers Grid)

```html
<section class="slide light">
  <div class="chrome">
    <div>数据篇</div>
    <div>Act I · 02 / 25</div>
  </div>
  <div class="frame" style="padding-top:3vh">
    <div class="kicker" data-anim>引导句</div>
    <h2 class="h-xl" data-anim>标题</h2>
    <p class="lead" style="margin-bottom:2vh" data-anim>一行说明。</p>

    <div class="grid-6" style="margin-top:2vh">
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">128 <span class="stat-unit">单位</span></div>
        <div class="stat-note">注释</div>
      </div>
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">64K+</div>
        <div class="stat-note">注释</div>
      </div>
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">5,166</div>
        <div class="stat-note">注释</div>
      </div>
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">41K+</div>
        <div class="stat-note">注释</div>
      </div>
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">19</div>
        <div class="stat-note">注释</div>
      </div>
      <div class="stat-card" data-anim>
        <div class="stat-label">标签</div>
        <div class="stat-nb">608+</div>
        <div class="stat-note">注释</div>
      </div>
    </div>
  </div>
  <div class="foot">
    <div>数据来源</div>
    <div>Act I · Numbers</div>
  </div>
</section>
```

**要点**：`.grid-6` 3×2 网格。数字 2-3 位字符，用 K/M 简写。间距已实测上限，内容更多时删卡片不压 foot。

---

## Layout 4: 左文右图 (Quote + Image)

```html
<section class="slide light">
  <div class="chrome">
    <div>身份反差</div>
    <div>03 / 25</div>
  </div>
  <div class="frame grid-2-7-5" style="padding-top:6vh">
    <div style="display:flex; flex-direction:column; justify-content:space-between; gap:3vh">
      <div>
        <div class="kicker" data-anim>BUT</div>
        <h2 class="h-xl" style="white-space:nowrap; font-size:7.2vw" data-anim>
          我不是程序员。
        </h2>
        <p class="lead" style="margin-top:3vh" data-anim>
          大学毕业之后再也没写过一行代码。过去十年做的是 UI 设计和 AI 特效。
        </p>
      </div>
      <div class="callout" data-anim>
        "这东西在三年前，需要一个十人团队做一年。"
        <div class="callout-src">— 一个观察者的判断</div>
      </div>
    </div>
    <figure class="frame-img r-16x10" data-anim>
      <img src="images/example.png" alt="截图描述">
      <figcaption class="img-cap">产品截图</figcaption>
    </figure>
  </div>
  <div class="foot">
    <div>Page 03 · 我不是程序员</div>
    <div>— · —</div>
  </div>
</section>
```

**要点**：`grid-2-7-5` 左 7 右 5。左列 flex column + `justify-content:space-between`：标题贴顶，callout 贴底。图片用标准比例 `.r-16x10`，不加 `align-self:end`。

---

## Layout 5: 图片网格 (多图对比)

```html
<section class="slide light">
  <div class="chrome">
    <div>平台实证</div>
    <div>05 / 27</div>
  </div>
  <div class="frame" style="padding-top:3vh">
    <div class="kicker" data-anim>Proof · 实证</div>
    <h2 class="h-xl" data-anim>10 个平台 · 6 张截图</h2>

    <div class="grid-3-3" style="margin-top:3vh">
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p1.png" alt="平台 1">
        <figcaption class="img-cap">平台 · 289K</figcaption>
      </figure>
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p2.png" alt="平台 2">
        <figcaption class="img-cap">平台 · 137K</figcaption>
      </figure>
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p3.png" alt="平台 3">
        <figcaption class="img-cap">平台 · 96K</figcaption>
      </figure>
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p4.png" alt="平台 4">
        <figcaption class="img-cap">平台 · 26K</figcaption>
      </figure>
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p5.png" alt="平台 5">
        <figcaption class="img-cap">平台 · 19K</figcaption>
      </figure>
      <figure class="frame-img" style="height:26vh" data-anim>
        <img src="images/p6.png" alt="平台 6">
        <figcaption class="img-cap">平台 · 10K</figcaption>
      </figure>
    </div>
  </div>
  <div class="foot">
    <div>截图时间 · 2026</div>
    <div>Page 05 · 实证</div>
  </div>
</section>
```

**要点**：每个 `frame-img` 写死 `height:NNvh`，不用 aspect-ratio。`figcaption.img-cap` 在框内底边，不额外占高。3×2 + 图注时 `26vh` 是上限，标题更长降到 `22vh`。

---

## Layout 6: 流水线 (Pipeline)

```html
<section class="slide light" data-animate="pipeline">
  <div class="chrome">
    <div>我的工作流</div>
    <div>Act II · 15 / 27</div>
  </div>
  <div class="frame">
    <div class="kicker">Pipeline · 流水线</div>
    <h2 class="h-xl">两条流水线</h2>

    <div class="pipeline-section">
      <div class="pipeline-label">文本侧 · Text Pipeline</div>
      <div class="pipeline">
        <div class="step" data-anim="step">
          <div class="step-nb">01</div>
          <div class="step-title">Draft</div>
          <div class="step-desc">AI 起草初稿</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">02</div>
          <div class="step-title">Polish</div>
          <div class="step-desc">AI 润色去 AI 味</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">03</div>
          <div class="step-title">Morph</div>
          <div class="step-desc">AI 变形多平台</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">04</div>
          <div class="step-title">Illustrate</div>
          <div class="step-desc">AI 生成信息图</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">05</div>
          <div class="step-title">Distribute</div>
          <div class="step-desc">一键分发 9 平台</div>
        </div>
      </div>
    </div>

    <div class="pipeline-section">
      <div class="pipeline-label">视觉 · 视频侧</div>
      <div class="pipeline">
        <div class="step" data-anim="step">
          <div class="step-nb">06</div>
          <div class="step-title">Cut</div>
          <div class="step-desc">AI 剪辑</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">07</div>
          <div class="step-title">Wrap</div>
          <div class="step-desc">AI 包装</div>
        </div>
        <div class="step" data-anim="step">
          <div class="step-nb">08</div>
          <div class="step-title">Cover</div>
          <div class="step-desc">AI 生成封面</div>
        </div>
      </div>
    </div>
  </div>
  <div class="foot">
    <div>Page 15 · 内容工厂</div>
    <div>Workflow</div>
  </div>
</section>
```

**要点**：`data-animate="pipeline"`，每个 `.step` 加 `data-anim="step"`。翻到时步骤 `opacity:.15`，按 →/空格逐步点亮，全亮才翻页。单行 ≤5 个步骤。

---

## Layout 7: 悬念收束 / 问题页 (Hero Question)

```html
<section class="slide hero dark">
  <div class="chrome">
    <div>留给你的问题</div>
    <div>24 / 27</div>
  </div>
  <div class="frame" style="display:grid; gap:8vh; align-content:center; min-height:80vh">
    <div class="kicker" data-anim>The Question</div>
    <h1 class="h-hero" style="font-size:7vw; line-height:1.15">
      <span data-anim style="display:block">你的公司里，</span>
      <span data-anim style="display:block">哪些岗位本来就</span>
      <span data-anim style="display:block">不该由人来做？</span>
    </h1>
    <p class="lead" style="max-width:50vw" data-anim>
      这个问题，不是技术问题，是架构问题。
    </p>
  </div>
  <div class="foot">
    <div>Page 24 · The Question</div>
    <div>— · —</div>
  </div>
</section>
```

**要点**：Hero 页留白越多越好，只放一个问题。`h-hero` 字号视长度 7-10vw。用 `<span display:block>` 断行在语义处。

---

## Layout 8: 大引用页 (Big Quote)

```html
<section class="slide dark" data-animate="quote">
  <div class="chrome">
    <div>The Takeaway · 核心金句</div>
    <div>18 / 25</div>
  </div>
  <div class="frame" style="display:grid; gap:5vh; align-content:center; min-height:80vh">
    <div class="kicker" data-anim>Quote · 金句</div>
    <blockquote style="font-family:var(--serif-zh); font-weight:700; font-size:5.8vw; line-height:1.2; letter-spacing:-.01em; max-width:72vw">
      <span data-anim="line" style="display:block">"没有交接，</span>
      <span data-anim="line" style="display:block">所有人都在构建。"</span>
    </blockquote>
    <p class="lead" style="max-width:55vw; opacity:.65" data-anim>
      英文原文在此。<br>
      第二行。
    </p>
    <div class="meta-row" data-anim>
      <span>— 作者名</span><span>·</span><span>日期</span>
    </div>
  </div>
  <div class="foot">
    <div>Page 18 · 金句</div>
    <div>— · —</div>
  </div>
</section>
```

**要点**：整页留白，只放大引用 + 出处。`<blockquote>` 用 inline style 5-6vw，不用 `h-hero`。英文原文 `opacity:.65` 制造层级。`data-animate="quote"` 逐句揭示。

---

## Layout 9: 并列对比 (A vs B)

```html
<section class="slide light" data-animate="directional">
  <div class="chrome">
    <div>旧 vs 新 · The Shift</div>
    <div>12 / 25</div>
  </div>
  <div class="frame" style="padding-top:5vh">
    <div class="kicker" data-anim>Before / After · 范式转变</div>
    <h2 class="h-xl" style="margin-bottom:4vh" data-anim>从 A 到 B</h2>

    <div class="grid-2-6-6" style="gap:5vw 4vh">
      <div data-anim="left" style="padding:3vh 2vw; border-left:3px solid currentColor; opacity:.55">
        <div class="kicker" style="opacity:.9">Before · 旧模式</div>
        <h3 class="h-md" style="margin-top:2vh">旧模式标题</h3>
        <ul style="margin-top:3vh; padding-left:1.2em; display:flex; flex-direction:column; gap:1.4vh; font-family:var(--sans-zh); font-size:max(14px,1.1vw); line-height:1.55">
          <li>旧模式要点 1</li>
          <li>旧模式要点 2</li>
          <li>旧模式要点 3</li>
          <li>旧模式要点 4</li>
        </ul>
      </div>
      <div data-anim="right" style="padding:3vh 2vw; border-left:3px solid currentColor">
        <div class="kicker" style="opacity:.9">After · 新模式</div>
        <h3 class="h-md" style="margin-top:2vh">新模式标题</h3>
        <ul style="margin-top:3vh; padding-left:1.2em; display:flex; flex-direction:column; gap:1.4vh; font-family:var(--sans-zh); font-size:max(14px,1.1vw); line-height:1.55">
          <li>新模式要点 1</li>
          <li>新模式要点 2</li>
          <li>新模式要点 3</li>
          <li>新模式要点 4</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="foot">
    <div>Page 12 · 范式转变</div>
    <div>Before / After</div>
  </div>
</section>
```

**要点**：`grid-2-6-6` 1:1。左列 `opacity:.55` 弱化旧模式。两列统一 `border-left:3px solid + padding-left` 引用块感。`data-animate="directional"` 左进→右进。

---

## Layout 10: 图文混排 (Lead Image + Side Text)

```html
<section class="slide light">
  <div class="chrome">
    <div>Design First · 设计先行</div>
    <div>08 / 16</div>
  </div>
  <div class="frame grid-2-8-4" style="padding-top:6vh">
    <div>
      <div class="kicker" data-anim>Phase 01 · 设计阶段</div>
      <h2 class="h-xl" style="margin-top:1vh; margin-bottom:3vh" data-anim>设计先行 · 2 周</h2>

      <p class="lead" style="margin-bottom:3vh" data-anim>
        在 Figma 中完成视觉探索与设计系统，网格/排版/颜色变量/可复用组件。
      </p>

      <p data-anim style="font-family:var(--sans-zh); font-size:max(14px,1.15vw); line-height:1.75; opacity:.78; margin-bottom:2.4vh">
        两周之内，视觉风格、粗略结构、方向性内容全部稳定。这是扎实的传统设计流程。
      </p>

      <div class="callout" style="margin-top:3vh" data-anim>
        "This phase was pretty standard. Just a solid Web design process."
        <div class="callout-src">— 出处</div>
      </div>
    </div>
    <figure class="frame-img r-3x4" data-anim>
      <img src="images/figma.png" alt="设计稿截图">
      <figcaption class="img-cap">Figma · Design System</figcaption>
    </figure>
  </div>
  <div class="foot">
    <div>Page 08 · Design First</div>
    <div>约 2 周</div>
  </div>
</section>
```

**要点**：`grid-2-8-4`(8:4) 正文主导。左列信息层级：kicker → 大标题 → lead → 正文 → callout。右列竖版 3:4 图，不抢注意力。

---

## 常用网格参考

| 类名 | 配比 | 用途 |
|---|---|---|
| `.grid-2-6-6` | 6:6 (1:1) | 对半分 |
| `.grid-2-7-5` | 7:5 | 文字为主 + 辅助图 |
| `.grid-2-8-4` | 8:4 (2:1) | 大段文字 + 小图 |
| `.grid-3` | 1:1:1 | 3 项并列 |
| `.grid-3-3` | 3×2 | 6 图矩阵 |
| `.grid-6` | 3×2 | 6 数据卡片 |

所有网格默认 `gap: 3vw 4vh`。

---

## 页面节奏建议

1. **Hero Cover** (第 1 页)
2. **Act Divider** (第一幕开场，hero light 或 hero dark)
3. **Big Numbers** (抛硬数据)
4. **Quote + Image** (身份反差/挂钩)
5. **Image Grid** (证据支撑)
6. **Hero Question** (幕收束，留悬念)
7. ... 第二幕、第三幕同节奏 ...
8. **Hero Close** (最后一页)

hero 与非 hero 2-3:1 比例交错，不连续超过 3 页 non-hero，不连续超过 2 页 hero。

---

## 验证

```bash
node scripts/validate.mjs template
```


---

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

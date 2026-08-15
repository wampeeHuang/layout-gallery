---
version: alpha
name: 归藏PPT · Style B 瑞士国际主义
description: Swiss International Style — Klein-blue accent (#002FA7) on near-white paper, Inter/Helvetica sans-serif throughout. Grid-based asymmetric layouts, modular scale spacing, and monospace data labels. Clean, rational, and rigorously systematic. Feels like a Bauhaus exhibition catalog.

colors:
  paper: "#fafaf8"
  ink: "#0a0a0a"
  accent: "#002FA7"
  accent-hover: "#1e4dc5"
  accent-alt: "#525252"
  grey-1: "#f0f0ee"
  grey-2: "#d4d4d2"
  grey-3: "#a8a8a4"
  line: "rgba(10, 10, 10, 0.15)"
  surface: "#fafaf8"

color-aliases:
  background: paper
  text-primary: ink
  text-secondary: accent-alt
  border: line

typography:
  sans:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, system-ui, sans-serif"
    role: "all display and body text"
  sans-zh:
    fontFamily: "PingFang SC, Hiragino Sans GB, Source Han Sans SC, Noto Sans SC, Microsoft YaHei, sans-serif"
    role: "Chinese text"
  mono:
    fontFamily: "JetBrains Mono, IBM Plex Mono, SF Mono, Consolas, monospace"
    role: "code, data, and KPI labels"

spacing:
  page-wmax: 1200px
  page-pad: 32px
  gap: 24px
  gutter: 24px
  sp-3: 8px
  sp-4: 12px
  sp-5: 16px
  sp-6: 24px
  sp-7: 32px
  sp-8: 40px
  sp-9: 48px
  sp-10: 64px
  sp-11: 80px
  sp-12: 96px
  sp-13: 160px

radius: 4px
scheme: light

shadows:
  shadow-sm: "0 1px 3px rgba(0,0,0,0.06)"
  shadow-md: "0 8px 30px rgba(0,0,0,0.1)"

motion:
  ease-default: "0.18s ease"
  duration-base: 150ms


---

# Recipes · Style B (瑞士国际主义)

AI Agent 生成 Swiss 幻灯片的操作配方。22 个登记版式 S01-S22，严格模块化网格。

---

## Swiss Locked Mode（先读）

每个正文页必须从 S01-S22 中选择，在 `<section>` 上写 `data-layout="Sxx"`。默认禁止发明登记外的正文结构。P23/P24 属历史实验区，默认禁用。

关键约束：
- 顶部中文标题左对齐在左上内容轴，不居中
- 需要单张大图用 S22 Image Hero，多图用 S15/S16 网格改造
- 地点/路线/城市关系用 S08 + Swiss Map Component
- SVG 只画几何，不写可见文字，标签放 HTML 里

---

## 设计语言基线

**配色**：`--paper` #fafaf8 白底，`--ink` #0a0a0a 黑墨，`--accent` 单色锚点（IKB 蓝默认/黄/绿/橙 四套），文字三级灰阶 `--text-primary/secondary/helper`，发丝线 `--border-subtle` #e0e0e0。

**字体**：`var(--sans)` Inter/Helvetica Neue + `var(--mono)` JetBrains Mono。字重："越大越细，越小越粗"——≥8vw 用 200，4-7.9vw 用 200-300，1.8-3.9vw 用 300-400，1-1.7vw/16-20px 用 400-500，13-15px 小字用 500-600。大标题 `letter-spacing:-.04em; line-height:.9`。

**中文大标题字号分档**：

| 中文标题形态 | 推荐字号 |
|---|---|
| 1 行, ≤8 字符 | `min(6.4vw, 11.2vh)` |
| 2 行, 每行 ≤8 字符 | `min(5.8vw, 10.2vh)` |
| 2 行, 任一行 9-12 字符 | `min(5.2vw, 9.2vh)` |
| 3 行或更长 | 改写标题；不能改时 `min(4.6vw, 8.2vh)` |

**演示最小字号**：正文 ≥18px，卡片描述/列表/图注 ≥16px，meta/kicker/mono label ≥14px。

**网格**：16 列 `grid-template-columns:repeat(16,1fr); gap:16px`。Spacing token：`--sp-3` 8 / `--sp-4` 12 / `--sp-5` 16 / `--sp-6` 24 / `--sp-7` 32 / `--sp-8` 40 / `--sp-9` 48 / `--sp-10` 64 / `--sp-11` 80 / `--sp-12` 96 / `--sp-13` 160。

**画布**：`.canvas-card` 100vw×100vh，直角无圆角，padding `5.6vh 5vw 4.4vh`。右下角 B 切换低功耗模式。

---

## P0 对齐法则

### 1. 不二次叠加水平 padding
`.canvas-card` 自带 `padding:5.6vh 5vw 4.4vh`。chrome-min、主体、footnote 共用 5vw 边线。主体区用 `padding:0` + grid gap 控间距。

### 2. kicker 在大标题上方，不压成左右
t-meta/t-cat 与大标题上下结构，用 flex column。

### 3. 双约束限高 `min(Xvw, Yvh)` 中 Y ≥ X×1.6
标准屏 1vw:1vh ≈ 1.78。推荐：h-hero `min(11.6vw, 19vh)`，h-xl `min(7vw, 12vh)`，大数字 KPI `min(8.4vw, 14vh)`。

### 4. canvas-card 子元素之间用 grid gap，不靠 margin/padding 堆
chrome-min 自带 `margin-bottom:48px`。主体区用 `display:grid; gap:Nvh`，不在子块里加 margin-top。

### 5. 底部安全区：主内容不触及 nav
nav 固定在 `bottom:2vh`，占约 93vh 后区域。`--nav-safe-bottom:8vh`。

---

## 卡片填充规则

| 类型 | 类名 | 角色 |
|---|---|---|
| Ink 黑底 | `.card-ink` | 反转/宣言 |
| Accent 蓝填充 | `.card-accent` | 唯一焦点 |
| Grey 灰底 | `.card-fill` | 默认中性 |
| Outlined 描边 | `.card-outlined` | hairline 分割框 |

禁止混用（蓝底+蓝描边、灰底+描边等）。

---

## 图片使用原则

- 图片是网格中的证据块，不是装饰背景
- 所有图片容器直角、无阴影、无圆角，默认不加外框
- 白底信息图/流程图/UI 图：容器背景必须是 `var(--paper)`
- 图片边缘无法区分时才加 `.swiss-lined` 顶部 accent 线
- 纪实照片用 cover 只裁底部/边缘；截图用 `.fit-contain`
- 优先比例：S22 横幅 `21:9`，S15/S16 统一 `21:9` 或 `16:10`
- S22 照片主体放中央安全区，用 `object-position:center 35%`

---

## 动效原则

每页一个语义化 recipe，与图形语义耦合。缓动：`EASE_PROD` `cubic-bezier(.2,0,.38,.9)` 120-240ms；`EASE_ENTRY` `cubic-bezier(0,0,.3,1)` 400-700ms。

---

## 22 个登记版式

### S01 · Cover · 封面页

IKB 满屏 + ASCII 呼吸场。`<section class="slide accent">` 满屏 IKB。`.canvas-card` 内首位 `<canvas class="ascii-bg">`。主标题反白 weight 200，强调字用斜体。不放大编号。

```html
<section class="slide accent" data-layout="S01" data-animate="hero">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min">
      <div class="l">[栏目标签]</div>
      <div class="r">01 / NN</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div class="t-meta" style="color:rgba(255,255,255,.78)">[章节英文]</div>
      <h1 style="align-self:center;font-family:var(--sans);font-weight:200;font-size:min(11.6vw,19vh);line-height:.94;letter-spacing:-.025em;color:#fff">
        [中文主标题]<br/>
        <span style="font-style:italic;font-weight:300">[斜体强调词]</span>
      </h1>
      <div style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div class="lead" style="max-width:52ch;color:rgba(255,255,255,.86);font-weight:300">[副标/引子]</div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">[作者 · 日期]</div>
          <div class="t-meta" style="color:rgba(255,255,255,.6)">→ swipe / arrow keys</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

动效：`hero` — ASCII 字符场持续呼吸，文字 fade-up 序列入场。

---

### S02 · Vertical Timeline · 纵向时间轴

演化对比/年代变迁/版本迭代（2-5 节点）。每节点必须有"年份+量化数值+描述"三件套。

```html
<section class="slide" data-layout="S02" data-animate="timeline-vertical">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">02 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">EVOLUTION · TIMELINE</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="timeline-v">
        <div class="tl-node"><div class="tl-axis"><span class="dot"></span></div>
          <div class="tl-body"><span class="yr">2023</span><span class="multi">1<small>×</small></span><p class="desc">[描述]</p></div>
        </div>
        <!-- 重复 N 个 tl-node -->
      </div>
    </div>
  </div>
</section>
```

动效：`timeline-vertical` — dot 先 pop 再扩，文字横向滑入。

---

### S03 · Split Statement · 极简陈述

中心论点/章节起始/口号。一句话 8-12 词，不承载数据或列表。

```html
<section class="slide" data-layout="S03" data-animate="statement-rise">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">03 / NN</div></header>
    <h1 class="h-statement"><span>[词1]</span> <span>[词2]</span><br><span>[词3]</span> <span>[词4]</span></h1>
    <span class="stmt-anchor">— Statement 03</span>
  </div>
</section>
```

动效：`statement-rise` — 大字按词序错峰升起，每词延迟 180ms。

---

### S04 · Six Cells · 六格定义

6 个并列概念定义。数量必须=6。每格：图标+编号+短标题+一行描述。

```html
<section class="slide" data-layout="S04" data-animate="six-cells">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">04 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">DEFINITIONS</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(6.4vw,11.2vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="cell-6">
        <div class="cell"><i data-lucide="square-stack"></i><span class="cell-num">01</span><h4>[标题]</h4><p>[一行描述]</p></div>
        <!-- 5 more -->
      </div>
    </div>
  </div>
</section>
```

动效：`six-cells` — 6 格 Z 形点亮，每格 90ms。

---

### S05 · Three Sub-cards · 三子卡

三步流程/三类对比。数量必须=3。每卡：编号+标题+1-2 行描述。

```html
<section class="slide" data-layout="S05" data-animate="sub-stack">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">05 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">THREE FORCES</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="sub-card-stack">
        <article class="card-fill sub-card"><span class="big-num">01</span><h4>[标题]</h4><p>[描述]</p></article>
        <article class="card-fill sub-card"><span class="big-num">02</span><h4>[标题]</h4><p>[描述]</p></article>
        <article class="card-fill sub-card"><span class="big-num">03</span><h4>[标题]</h4><p>[描述]</p></article>
      </div>
    </div>
  </div>
</section>
```

动效：`sub-stack` — 主标题先入，3 卡阶梯式从右滑入，每卡 140ms。

---

### S06 · KPI Tower · 柱状 KPI

4 项数据用视觉高度表达层级差异。必须有真实数值。

```html
<section class="slide" data-layout="S06" data-animate="tower-grow">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">06 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">KPI TOWER</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="kpi-tower-row">
        <div class="tower-col"><i data-lucide="layers"></i><span class="num-mega">90K</span><span class="lbl">[标签]</span><div class="bar-tower" style="--h:36vh"></div></div>
        <div class="tower-col"><i data-lucide="layers"></i><span class="num-mega">64K</span><span class="lbl">[标签]</span><div class="bar-tower" style="--h:28vh"></div></div>
        <div class="tower-col"><i data-lucide="layers"></i><span class="num-mega">48K</span><span class="lbl">[标签]</span><div class="bar-tower" style="--h:20vh"></div></div>
        <div class="tower-col"><i data-lucide="layers"></i><span class="num-mega">12K</span><span class="lbl">[标签]</span><div class="bar-tower" style="--h:12vh"></div></div>
      </div>
    </div>
  </div>
</section>
```

动效：`tower-grow` — 标签先入，数字 scale 弹入，tower scaleY 从 0 拉起。

---

### S07 · H-Bar Chart · 横向条形图

5-10 项排名比较。必须有真实百分比/评分/数值。严禁用于无量化概念列举。

```html
<section class="slide" data-layout="S07" data-animate="hbar-grow">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">07 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">BENCHMARK</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="h-bar-chart">
        <div class="bar-row"><span class="bar-lbl">[标签]</span><span class="bar-fill" style="--w:84%"></span><span class="bar-num">84</span></div>
        <!-- N more -->
      </div>
    </div>
  </div>
</section>
```

动效：`hbar-grow` — 大标题先入，width 0→target + 末端数字 count-up。

---

### S08 · Duo Compare · 双轨对照

Before/After、A vs B。必须正好 2 项。地点/路线场景可用 S08 + Swiss Map Component 替换右侧插槽。

```html
<section class="slide" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">08 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">BEFORE / AFTER</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="duo-compare">
        <div class="duo-half"><span class="t-cat">Before</span><h2>[旧标题]</h2><p class="body">[描述]</p></div>
        <span class="vrule"></span>
        <div class="duo-half"><span class="t-cat">After</span><h2>[新标题]</h2><p class="body">[描述]</p></div>
      </div>
    </div>
  </div>
</section>
```

动效：`duo-mirror` — 中线 vrule scaleY 0→1，左右镜像入场。

---

### S09 · Closing Manifesto · 收束宣言

整套 deck 收尾。固定结构：左 IKB+ASCII 宣言 + 右 paper 三条 takeaway。

```html
<section class="slide split" data-layout="S09" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <canvas class="ascii-bg" aria-hidden="true"></canvas>
        <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
          <div class="l">NN / NN</div><div class="r">CLOSING</div>
        </div>
        <div data-anim="manifesto" style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78)">MANIFESTO</div>
          <h2 style="font-family:var(--sans);font-size:min(8vw,14vh);line-height:.94;letter-spacing:-.025em;font-weight:200;color:#fff">[宣言标题]</h2>
          <div style="font-family:var(--sans);font-size:max(13px,1vw);line-height:1.6;color:rgba(255,255,255,.82);font-weight:300">[注脚]</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">[作者]</div>
          <div class="t-meta" style="color:rgba(255,255,255,.62)">YY.MM.DD</div>
        </div>
      </div>
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min"><div class="l">TAKEAWAYS</div><div class="r">03 RULES</div></div>
        <div data-anim="rules"><!-- 3 条 takeaway --></div>
        <div class="t-meta" style="color:var(--text-helper);text-align:right">→ 完 · END</div>
      </div>
    </div>
  </div>
</section>
```

动效：`split-statement` — 左标题字符序列升起，右三条尾随。

---

### S10 · Dot Matrix Statement · 点阵宣言

第二张陈述页/视觉透气页。中段 7vw 巨字 + 右上点阵 + 左下圆环装饰。

```html
<section class="slide" data-layout="S10" data-animate="matrix-statement">
  <div class="canvas-card">
    <span class="ring-mat" style="left:5vw;bottom:5vh;width:18vw;height:18vw"></span>
    <h1 class="h-statement">[第一行]<br>[第二行]<br>[第三行]</h1>
    <span class="dot-mat" style="right:0;top:0;width:36vw;height:36vw"></span>
  </div>
</section>
```

动效：`matrix-statement` — 文字逐行入，点阵 mask-position 从左推到右。

---

### S11 · Horizontal Timeline · 横向时间线

4-7 步线性流程。每步只有一个名称，不展开数据。

```html
<section class="slide" data-layout="S11" data-animate="timeline-walk">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">11 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">PROCESS · STEP BY STEP</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="timeline-h">
        <span class="tl-h-axis"></span>
        <div class="tl-h-node"><span class="num">01</span><span class="dot"></span><span class="lbl">[步骤名]</span></div>
        <!-- 4-6 more -->
      </div>
    </div>
  </div>
</section>
```

动效：`timeline-walk` — 节点左→右依次点亮，每节点 220ms。

---

### S12 · Manifesto + Ink Banner · 宣言通栏

阶段性结论/章节封底。上半大字宣言+说明，下半 ink 通栏反白短句。

```html
<section class="slide" data-layout="S12" data-animate="manifesto">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">12 / NN</div></header>
    <div style="flex:1;padding:0;display:flex;flex-direction:column;justify-content:space-between">
      <div class="manifesto-top">
        <div><span class="t-cat">MANIFESTO</span>
          <h2 style="font-family:var(--sans);font-weight:200;font-size:min(6.4vw,11.2vh);line-height:.96">[宣言标题]</h2>
        </div>
        <p class="body" style="max-width:36ch">[说明段落]</p>
      </div>
      <div class="ink-banner-full">
        <p style="font-family:var(--sans);font-weight:200;font-size:min(4vw,7vh);color:#fff">[反白短句]</p>
        <div><!-- lucide 图标矩阵 --></div>
      </div>
    </div>
  </div>
</section>
```

动效：`manifesto` — 大字三段错峰升起，底 ink 条 scaleX 0→1 铺开。

---

### S13 · Three Forces Cards · 三力卡片

3 个对等概念深化。左 ink hero 块 + 右三张水平卡。01/02/03 为编号锚点。

```html
<section class="slide" data-layout="S13" data-animate="three-forces">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">13 / NN</div></header>
    <div style="flex:1;padding:0" class="three-forces">
      <div class="hero-ink-col"><span class="t-cat">THREE FORCES</span><h2>[大标题]</h2><span class="dot-mat"></span></div>
      <div style="display:flex;flex-direction:column;gap:2vh">
        <article class="card-fill force-card"><span class="force-num">01</span><h4>[标题]</h4><p>[描述]</p></article>
        <article class="card-fill force-card"><span class="force-num">02</span><h4>[标题]</h4><p>[描述]</p></article>
        <article class="card-fill force-card"><span class="force-num">03</span><h4>[标题]</h4><p>[描述]</p></article>
      </div>
    </div>
  </div>
</section>
```

动效：`three-forces` — 左 hero 横移入，右 3 卡阶梯式滑入。

---

### S14 · Loop Diagram · 闭环流程

3-5 步循环流程。左侧步骤列表 + 右 SVG 同心圆环。线性流程禁用。

```html
<section class="slide" data-layout="S14" data-animate="loop-form">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">14 / NN</div></header>
    <div style="flex:1;padding:0" class="loop-diagram">
      <div class="loop-steps"><!-- 4 个步骤编号+标题 --></div>
      <div class="loop-svg"><svg viewBox="0 0 300 300"><!-- 几何圆环 SVG --></svg></div>
    </div>
  </div>
</section>
```

动效：`loop-form` — 左侧步骤纵向序列，SVG 圆环 stroke-dashoffset 描线，节点点亮。

---

### S15 · Image Matrix + Hero Stat · 矩阵大字

8-12 项同类型小项 + 底部汇总数据。每项只承载短标题，底部巨数为汇总值。

```html
<section class="slide" data-layout="S15" data-animate="matrix-fill">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">15 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">MATRIX</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="matrix-fill">
        <div class="card-fill matrix-cell"><h4>[短标题]</h4></div>
        <!-- 7-11 more -->
      </div>
      <div class="hero-stat-bottom">
        <span class="num-mega">128</span><span class="lbl">[汇总标签]</span>
      </div>
    </div>
  </div>
</section>
```

动效：`matrix-fill` — 12 格随机棋盘渐显，底部巨数 count-up。

---

### S16 · Multi-card Brief · 微卡小报

6 项轻量短讯/tip 集合。每卡：左上主文 + 右下小字。只允许一张 accent 蓝突出。

```html
<section class="slide" data-layout="S16" data-animate="field-notes">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">16 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">FIELD NOTES</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(6.4vw,11.2vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="brief-grid">
        <div class="card-fill brief-card"><span class="brief-main">[主文]</span><span class="brief-foot">[小字]</span></div>
        <!-- 5 more, 其中一张用 .card-accent -->
      </div>
    </div>
  </div>
</section>
```

动效：`field-notes` — 6 卡 Z 形点亮，90ms 错开。

---

### S17 · System Diagram · 同心圆系统图

严格三层嵌套关系。左半标题+说明，右半 SVG 三层同心圆。

```html
<section class="slide" data-layout="S17" data-animate="system-diagram">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">17 / NN</div></header>
    <div style="flex:1;padding:0" class="system-diagram">
      <div><!-- 左半：标题 + 三段说明 --></div>
      <div class="sys-svg"><svg viewBox="0 0 400 400"><!-- 三层同心圆 + 外引线 --></svg></div>
    </div>
  </div>
</section>
```

动效：`system-diagram` — 同心圆从外向内 scale 入，标签序列出现。

---

### S18 · Why Now · 三列递进

三论点+各自支撑数据。每论点=t-cat+标题+段落+底部巨数。最后一列 IKB 蓝强调。

```html
<section class="slide" data-layout="S18" data-animate="why-now">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">18 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">WHY NOW</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="why-now-grid">
        <div class="why-col"><span class="t-cat">[标签]</span><h3>[标题]</h3><p>[描述]</p><span class="why-num-bottom">85%</span></div>
        <div class="why-col"><span class="t-cat">[标签]</span><h3>[标题]</h3><p>[描述]</p><span class="why-num-bottom">3.2×</span></div>
        <div class="why-col"><span class="t-cat">[标签]</span><h3>[标题]</h3><p>[描述]</p><span class="why-num-bottom" style="color:var(--accent)">2026</span></div>
      </div>
    </div>
  </div>
</section>
```

动效：`why-now` — 三列垂直递进，底部巨数 count-up。

---

### S19 · Four Cards · 四列均分卡

4 项等权特性/模块。每项=t-meta 编号+大字标题+一段描述。纯定性。

```html
<section class="slide" data-layout="S19" data-animate="four-cards">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">19 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">FOUR PILLARS</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="four-cards">
        <div class="fc-col"><span class="t-meta">— 01 / SLASH</span><h3>[标题]</h3><p>[描述]</p></div>
        <div class="fc-col"><span class="t-meta">— 02 / SLASH</span><h3>[标题]</h3><p>[描述]</p></div>
        <div class="fc-col"><span class="t-meta">— 03 / SLASH</span><h3>[标题]</h3><p>[描述]</p></div>
        <div class="fc-col"><span class="t-meta">— 04 / SLASH</span><h3>[标题]</h3><p>[描述]</p></div>
      </div>
    </div>
  </div>
</section>
```

动效：`four-cards` — 顶部蓝线 width 0→100%，4 列从下向上推入，每列 110ms。

---

### S20 · Stacked KPI Ledger · 纵向账单

4-6 行核心数据账单。每行=数字+标签+图标。每行 hairline 分隔。

```html
<section class="slide" data-layout="S20" data-animate="stacked-ledger">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">20 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
        <div class="t-meta">LEDGER</div>
        <h2 style="font-family:var(--sans);font-weight:200;font-size:min(7vw,12vh);line-height:.96;letter-spacing:-.035em">[标题]</h2>
      </div>
      <div class="stacked-ledger">
        <div class="ledger-row"><span class="ledger-num">90K</span><span class="ledger-lbl">[标签]</span><i data-lucide="layers"></i></div>
        <!-- 3-5 more rows -->
      </div>
    </div>
  </div>
</section>
```

动效：`stacked-ledger` — 每行数字升起，标签左滑，图标 pop，180ms 错开。

---

### S21 · Tech Spec Sheet · 规格说明书

产品规格/benchmark。数据密度最高的版式。3 KPI + 9 竖线 + 底部巨数。

```html
<section class="slide" data-layout="S21" data-animate="tech-spec">
  <div class="canvas-card" class="tech-spec">
    <header class="chrome-min"><div class="l">[栏目]</div><div class="r">21 / NN</div></header>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
      <div class="spec-title-col"><h2>[大标题]</h2></div>
      <div class="spec-kpi-grid">
        <div><div class="spec-kpi-num">99.2%</div><div class="t-meta">[指标 1]</div></div>
        <div><div class="spec-kpi-num">127×</div><div class="t-meta">[指标 2]</div></div>
        <div><div class="spec-kpi-num">3.4h</div><div class="t-meta">[指标 3]</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:end">
        <div><span class="num-mega">100%</span><span class="lbl">Yearly goal</span></div>
        <div class="spec-bars"><!-- 9 根竖线 --></div>
      </div>
    </div>
  </div>
</section>
```

动效：`tech-spec` — hero 淡入，KPI 顶线画出，底巨数 pop，竖线从底部弹起。

---

### S22 · Image Hero · 图文封面

案例展示/产品发布。必须有真实图片+3 个核心数据。上半 60% 全幅图+左上白块标题，下半 40% 说明+三列 KPI。

```html
<section class="slide light" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
    <div data-anim="img" style="position:relative;flex:0 0 60%;overflow:hidden;background:var(--grey-1)">
      <img src="images/22-[描述].png" alt="[说明]" loading="eager"
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%">
      <div class="chrome-min" style="position:absolute;top:0;left:0;right:0;color:rgba(255,255,255,.9);padding:5.6vh 5vw 0">
        <div class="l">[栏目]</div><div class="r">22 / NN</div>
      </div>
      <div data-anim="title-block" style="position:absolute;left:5vw;top:11vh;background:var(--paper);padding:3.2vh 3.2vw;max-width:40vw">
        <div style="font-family:var(--sans);font-weight:200;font-size:min(5.2vw,9vh);line-height:1;letter-spacing:-.035em;color:var(--text-primary)">
          [标题]
        </div>
      </div>
    </div>
    <div data-anim="kpi" class="image-hero-body">
      <div style="max-width:48ch;font-family:var(--sans);font-size:max(15px,1.3vw);line-height:1.55;font-weight:300;color:var(--text-primary)">
        [说明：这张图为什么重要]
      </div>
      <div class="image-hero-stats" style="gap:4vw">
        <div><!-- KPI 1 --><div style="height:1px;background:var(--ink)"></div><div class="t-meta">[指标名]</div><div style="font-family:var(--sans);font-weight:200;font-size:min(4.6vw,7.6vh);line-height:.95">12×</div></div>
        <div><!-- KPI 2 --><div style="height:1px;background:var(--ink)"></div><div class="t-meta">[指标名]</div><div style="font-family:var(--sans);font-weight:200;font-size:min(4.6vw,7.6vh);line-height:.95">3.4h</div></div>
        <div><!-- KPI 3 --><div style="height:1px;background:var(--ink)"></div><div class="t-meta">[指标名]</div><div style="font-family:var(--sans);font-weight:200;font-size:min(4.6vw,7.6vh);line-height:.95;color:var(--accent)">100%</div></div>
      </div>
    </div>
  </div>
</section>
```

动效：`image-hero` — 图缓慢 zoom-out(scale 1.05→1)，白块 scaleX 0→1 推开，三 KPI 顶线画出。

---

## 版式选择决策表

| 内容意图 | 版式 |
|---|---|
| Deck 起手封面 | S01 Cover |
| 演化对比/时间轴(纵) | S02 Vertical Timeline |
| 一句口号/章节起 | S03 Statement / S10 Dot Matrix |
| 6 项概念定义 | S04 Six Cells |
| 三步流程(轻) | S05 Three Sub-cards |
| 4 项数据视觉化 | S06 KPI Tower |
| 5-10 项排名比较 | S07 H-Bar Chart |
| Before/After 对照 | S08 Duo Compare |
| Deck 收尾 | S09 Closing Manifesto |
| 多步流程(横, 4-7 步) | S11 Horizontal Timeline |
| 阶段性结论+ink 通栏 | S12 Manifesto + Banner |
| 3 个对等概念深化 | S13 Three Forces |
| 闭环流程 | S14 Loop Diagram |
| 8-12 项矩阵+总数据 | S15 Image Matrix |
| 6 项快讯小卡 | S16 Multi-card Brief |
| 层级架构/同心圆 | S17 System Diagram |
| 三论点+数据支撑 | S18 Why Now |
| 4 项等权特性 | S19 Four Cards |
| 4-6 行账单式 KPI | S20 Stacked Ledger |
| 产品规格/benchmark | S21 Tech Spec |
| 案例图+数据落地 | S22 Image Hero |
| 地点/路线/人物关系 | S08 + Swiss Map Component |

---

## 版式多样性规则

- 7-8 页 deck 至少使用 6 个不同 S 编号
- 不允许连续 3 页使用同一种主体结构
- 每页写代码前先列 `页码 → data-layout → 为什么选它 → 图片槽位`

## P0 检查项

1. 禁止 `border-radius` — 必须直角
2. 卡片填充类型互斥（不混用蓝底+描边）
3. 用 lucide 图标，不自己画 SVG 文字
4. 时间线 dot 用 axis 列固定 12px + 绝对定位
5. 大字号永远 `min(Xvw, Yvh)` 双约束
6. 每页一个语义化 recipe
7. 标题+卡片间距 ≥5vh，章节级 ≥9vh
8. 装饰用 8×8 直角方块，不用圆点

## 验证

```bash
node scripts/validate.mjs template-swiss
```


---

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


---

# Swiss Layout Lock

本文件是瑞士主题的硬约束。目的不是增加灵感，而是防止生成时"看起来像 Swiss，但已经脱离原始模板"。

## Golden Source

版式基准是 `templates/template-swiss/template.html`（由作者原始参考 PPT 派生；原始文件不随仓库分发，本文件登记的 S01-S22 即其版式快照）。

瑞士主题生成时，除用户明确要求实验版式外，只能从下面登记的 22 个版式中选择。新增首页/尾页可以使用 IKB ASCII 版本，但正文页必须来自这 22 个版式。

## 生成前硬规则

1. 每个正文页都必须先选一个登记版式，并在 `<section>` 上写 `data-layout="Sxx"`。
2. 不允许临时发明未出现在原始 22P 的正文结构。需要图片时，优先使用 `S22 Image Hero`；多图时使用 `S15/S16` 的原始网格骨架做图片格改造，不要发明新的证据墙。唯一登记的交互扩展是 `S08 + Swiss Map Component`，详见 `map-component.md`。
3. 顶部中文标题默认左对齐并贴近左上内容轴。除原始 `S03/S09/S10` 这种 statement/split 版式外，不要把大标题放到页面水平中心。
4. SVG 只能负责几何线条、圆、箭头、路径。不要在 SVG 里写可见文字；所有文字标签用 HTML 放在网格、卡片或 caption 里。
5. 图片槽位和图片生成比例必须绑定。先确定版式和槽位，再生成图片。

## 登记版式

| ID | 原始页 | 名称 | 必须保留的骨架 | 图片规则 |
|---|---:|---|---|---|
| S01 | 01 | Index Cover | 三行 `cover-row`，左大编号，右大标题 | 无 |
| S02 | 02 | Vertical Timeline + KPI | 顶部左对齐标题，中部 `.timeline-v`，底部 `.kpi-row-4` | 无 |
| S03 | 03 | Split Statement | `.slide.split` 双半屏，左巨字，右灰底解释 | 无 |
| S04 | 04 | Six Cells | 顶部左对齐标题，下方 `.sub-grid-3-2` 六卡 | 可把卡片内部换成小图标，不放大图 |
| S05 | 05 | Three Layers | 顶部左对齐标题，下方 `.stack-row` 三大块 | 无 |
| S06 | 06 | KPI Tower | 左标题+右说明，下方不等高 KPI 塔 | 无 |
| S07 | 07 | Horizontal Bar | 左对齐标题，横向条形图 | 无 |
| S08 | 08 | Duo Compare | `.duo-compare` 两列 + 中线 | 无；地点/路线内容可使用 `S08 + Swiss Map Component` 替换右侧插槽 |
| S09 | 09 | Dot Matrix Statement | 大号 statement + 点阵装饰 | 无 |
| S10 | 10 | Split Closing | `.slide.split` 左巨字右列表 | 无 |
| S11 | 11 | Horizontal Timeline | 原始 `grid-template-columns:auto 1fr` 头部 + `.timeline-h` | 无 |
| S12 | 12 | Manifesto + Ink Banner | 大字 statement + 底部通栏 ink 条 | 无 |
| S13 | 13 | Three Forces | 左 ink hero 块 + 右 3 张卡 | 无 |
| S14 | 14 | Loop Form | 左 4 步列表 + 右几何 loop | SVG 禁止文字，标签改 HTML |
| S15 | 15 | Matrix + Hero Stat | 顶部左对齐标题，中段 6×2 矩阵，底部巨数 | 多图可改造矩阵格，同组统一 `21:9` |
| S16 | 16 | Multi-card Brief | 顶部左对齐标题，下方 3×2 微卡 | 多图可改造卡片内容，同组统一 `21:9` |
| S17 | 17 | System Diagram | 顶部左小标题+右段落，中部几何系统图，底部三列解释 | SVG 禁止文字，标签改 HTML |
| S18 | 18 | Why Now | 三列递进 + 底部巨数 | 无 |
| S19 | 19 | Four Cards | 顶部蓝线 + 四列均分 | 无 |
| S20 | 20 | Stacked KPI Ledger | 纵向账单式巨数 | 无 |
| S21 | 21 | Tech Spec Sheet | 大标题 + 三 KPI + 右下竖线矩阵 | 无 |
| S22 | 22 | Image Hero | 顶部全宽图 + 左上白块标题 + 下方三列 KPI | 主图按 `21:9` 生成，关键主体放中央安全区 |

## 登记扩展组件

### S08 + Swiss Map Component

- 使用场景：地理、历史、城市路线、门店/校区/事件点位、人物住所关系。
- 版式身份：仍是 `data-layout="S08"`，不是新正文页。
- 页面结构：顶部左对齐标题 + 左侧关系/说明卡片 + 右侧 MapLibre 地图卡片。
- 标记结构：点 + 连线 + HTML 卡片；SVG 只画 fallback 关系线，不写文字。
- 交互控制：右上角必须有 `+` / `-` / `DRAG`；默认禁用滚轮缩放和拖动，避免触发 PPT 翻页。
- 详细代码和数据契约见 `map-component.md`。

## 图片槽位规则

### S22 · Hero Strip

- 生成比例：`21:9`
- 图片用途：实拍场景、产品场景、UI 情景图。
- 生成提示词必须包含：`21:9 ultra-wide strip`，`subject centered in the safe middle area`，`no title, no footer, no page chrome, no logo, no border`。
- HTML 容器必须使用原始 S22 的顶部全宽图骨架；不要改成普通居中大图。
- 照片用 `object-fit:cover; object-position:center 35%`。如果是人像/会议场景，不要用 `top center`。
- 信息图/UI 截图如果放 S22，必须重新生成接近 `21:9`，并用 `object-fit:contain` 或保证核心内容在中央 70% 安全区。

### S15/S16 · Multi Image Grid

- 生成比例：统一 `21:9` 或统一 `16:10`，不要混用。
- 同一组图片必须同高、同宽、同一容器背景。
- 图片格必须吸附原始卡片网格，不要让图片自己决定宽高。
- 如果图片是按槽位重新生成的 `s15-grid-21x9` / `s16-brief-21x9`，容器必须用 `.frame-img.r-21x9` 铺满槽位，不要再加 `.fit-contain`，也不要用固定 `height:18vh` 这类短槽把长图缩小。
- `.fit-contain` 只用于必须保留原始比例的用户截图或文字密集图片；一旦决定重生成图片，就应该按槽位比例重生成并铺满。
- 如果原始截图比例不可控，先按 `guides/image-conventions.md` 做程序化比例适配；只有长截图、极窄截图或信息需要重构时，才用 GPT-M 2.0 重生成"截图再设计"。

## 禁止清单

- 禁止 `text-align:center` 用在顶部中文大标题。
- 禁止将顶部标题写进右侧 7.8fr 栏，造成视觉居中。
- 禁止未登记正文页：例如临时 `Swiss Image Split`、`Evidence Grid`、三圆图自绘页。
- 禁止图片容器灰底包白底信息图。
- 禁止 SVG 中出现 `<text>` 作为可见标签。
- 禁止图片默认 `object-position:top center` 用于照片。
- 禁止给卡片加 `border-radius`。
- 禁止在 `.card-accent` 上又加描边（填充类型互斥）。
- 禁止自己画 SVG 图标（用 Lucide）。
- 禁止 9px 圆形装饰点（用 8×8 直角方块或 mono 文字）。


---

# Swiss Map Component

用于地理、历史、城市、人文路线、门店/校区/事件点位等内容。它不是新的 Swiss 正文版式，而是 **S08 Duo Compare 的右侧插槽扩展**：左侧仍是解释卡片，右侧替换为地图组件。

## 何时使用

- 文档里出现地点、街区、路线、人物住所、机构分布、城市漫游。
- 用户明确希望有地图、点位、关系线或地理组件。
- 内容需要解释"空间关系"，而不只是罗列人物或地点。

## 硬规则

- `<section>` 仍写 `data-layout="S08"`；不要新增 P23/P24 或自定义正文页。
- 页面结构必须是：顶部标题 + 左侧说明卡片 + 右侧地图卡片。
- 地图标记由 HTML 组件组成：点 `.pin-dot` + 连线 `.pin-line` + 卡片 `.pin-card`。
- SVG 只画 fallback 关系线，不要在 SVG 里写文字。
- MapLibre 地图默认关闭滚轮缩放和拖动，避免触发 PPT 翻页。
- 右上角必须有 `+` / `-` / `DRAG` 控制。用户点击 `DRAG` 后才允许拖动地图。
- 必须有静态 fallback：CDN 或地图瓦片失败时，仍能看到点位、关系线和卡片。

## 数据契约

写页面前先定义点位和关系。`x/y` 用于静态 fallback 百分比坐标，`coord` 用于 MapLibre 经纬度。

```js
const MAP_POINTS = [
  { id: 'gu', name: '顾维钧', meta: '外交', coord: [117.2048, 39.1060], x: 62, y: 68, accent: true },
  { id: 'cao', name: '曹锟', meta: '北洋', coord: [117.1988, 39.1080], x: 34, y: 48 },
  { id: 'sun', name: '孙殿英', meta: '军阀', coord: [117.2028, 39.1090], x: 52, y: 54 },
  { id: 'zhang', name: '张自忠', meta: '抗战', coord: [117.1966, 39.1120], x: 58, y: 28, accent: true },
  { id: 'jin', name: '金氏宅邸', meta: '交通站', coord: [117.2012, 39.1114], x: 66, y: 35, side: 'left' },
];

const MAP_RELATIONS = [
  ['gu', 'cao'],
  ['cao', 'sun'],
  ['zhang', 'jin'],
];
```

## 必要 CSS

放到生成页 `<head>` 的额外 `<style>` 中，不要改 `template.html` 的全局基座类。

```html
<link href="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.css" rel="stylesheet">
<script src="https://unpkg.com/maplibre-gl@5.14.0/dist/maplibre-gl.js"></script>
<style>
.history-map-grid{display:grid;grid-template-columns:4.2fr 7.8fr;gap:2vw;flex:1;min-height:0;margin-top:2vh;align-items:stretch}
.history-side{display:grid;grid-template-rows:1.08fr repeat(4,1fr);gap:1vh;min-height:0;height:100%}
.history-side-head{background:var(--accent);color:var(--accent-on);padding:2.2vh 1.4vw 1.8vh;border-radius:3px}
.history-side-head .big{font-family:var(--sans),var(--sans-zh);font-size:max(22px,2.2vw);font-weight:300;line-height:1.08;letter-spacing:-.02em}
.history-side-head .small{font-family:var(--sans),var(--sans-zh);font-size:max(11px,.82vw);font-weight:300;line-height:1.55;color:rgba(255,255,255,.82);margin-top:1.2vh}
.relation-card{background:var(--grey-1);padding:1.45vh 1.1vw;border-radius:3px;display:grid;grid-template-columns:auto 1fr;gap:.8vw;align-items:start;min-height:0}
.relation-card .nb{font-family:var(--mono);font-size:max(10px,.75vw);letter-spacing:.16em;color:var(--accent)}
.relation-card .ttl{font-family:var(--sans),var(--sans-zh);font-size:max(14px,1.05vw);font-weight:500;line-height:1.25}
.relation-card .desc{font-family:var(--sans),var(--sans-zh);font-size:max(11px,.78vw);line-height:1.5;color:var(--text-secondary);margin-top:.55vh}
.map-panel{position:relative;background:var(--grey-1);border-radius:3px;overflow:hidden;min-height:0;height:100%}
.map-panel .map-title{position:absolute;top:1.4vh;left:1.2vw;z-index:3;background:rgba(250,250,248,.92);padding:1.2vh 1vw;border-radius:3px;max-width:28vw}
.map-panel .map-title .k{font-family:var(--mono);font-size:max(10px,.72vw);letter-spacing:.18em;color:var(--text-helper)}
.map-panel .map-title .t{font-family:var(--sans),var(--sans-zh);font-size:max(18px,1.5vw);font-weight:400;letter-spacing:-.015em;margin-top:.4vh}
.map-controls{position:absolute;top:1.4vh;right:1.2vw;z-index:4;display:flex;gap:6px;background:rgba(250,250,248,.9);padding:6px;border-radius:3px}
.map-ctrl{min-width:32px;height:32px;border:1px solid var(--ink);background:transparent;color:var(--ink);font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;border-radius:0;cursor:pointer}
.map-ctrl.drag{min-width:58px}
.map-ctrl.active{background:var(--accent);border-color:var(--accent);color:var(--accent-on)}
.wudadao-map,.swiss-map{position:absolute;inset:0;background:#f4f4f0}
.wudadao-map.map-live .map-static,.swiss-map.map-live .map-static{display:none}
.map-static{position:absolute;inset:0;display:block;background:linear-gradient(18deg,transparent 0 44%,rgba(25,25,25,.11) 44% 44.2%,transparent 44.2%),linear-gradient(-8deg,transparent 0 54%,rgba(25,25,25,.09) 54% 54.16%,transparent 54.16%),linear-gradient(0deg,transparent 0 61%,rgba(25,25,25,.08) 61% 61.15%,transparent 61.15%),#f4f4f0}
.static-relations{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.static-relations line{stroke:var(--accent);stroke-width:.24;stroke-dasharray:1.4 1.2;opacity:.68}
.static-marker{position:absolute;transform:translate(-50%,-50%);width:0;height:0}
.static-marker .pin-dot,.person-marker .pin-dot{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:50%;background:var(--ink);border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.22)}
.static-marker.accent .pin-dot,.person-marker.accent .pin-dot{background:var(--accent)}
.static-marker .pin-line,.person-marker .pin-line{position:absolute;left:7px;top:0;width:24px;height:1px;background:var(--ink);opacity:.45}
.static-marker.accent .pin-line,.person-marker.accent .pin-line{background:var(--accent);opacity:.75}
.static-marker .pin-card,.person-marker .pin-card{position:absolute;left:31px;top:-18px;min-width:72px;background:rgba(250,250,248,.9);box-shadow:0 0 0 1px rgba(0,0,0,.06);border-radius:2px;padding:6px 7px;font-family:var(--sans),var(--sans-zh);white-space:nowrap}
.static-marker .pin-name,.person-marker .pin-name{font-size:12px;line-height:1.05;color:var(--ink)}
.static-marker .pin-meta,.person-marker .pin-meta{font-family:var(--mono);font-size:9px;line-height:1;letter-spacing:.12em;color:var(--text-helper);margin-top:4px;text-transform:uppercase}
.static-marker.accent .pin-name,.person-marker.accent .pin-name{color:var(--accent)}
.static-marker.left .pin-line,.person-marker.left .pin-line{left:auto;right:7px}
.static-marker.left .pin-card,.person-marker.left .pin-card{left:auto;right:31px}
.person-marker{position:relative;width:0;height:0;pointer-events:auto}
.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right{display:none!important}
</style>
```

## 页面骨架

```html
<section class="slide" data-layout="S08" data-animate="duo-mirror">
  <div class="canvas-card">
    <header class="chrome-min"><div class="l">06 / NN · MAP COMPONENT</div><div class="r">MAPLIBRE / STATIC FALLBACK</div></header>
    <h2 class="h-xl-zh">把人物住所放回街区里</h2>
    <div class="history-map-grid">
      <aside class="history-side">
        <div class="history-side-head">
          <div class="big">住所不是点位，<br/>而是关系入口。</div>
          <div class="small">这页用地图承载空间关系，用左侧卡片解释人物之间的牵连。</div>
        </div>
        <div class="relation-card"><div class="nb">01</div><div><div class="ttl">顾维钧 ↔ 曹锟</div><div class="desc">说明两者为什么有关系，至少写成完整一句。</div></div></div>
        <div class="relation-card"><div class="nb">02</div><div><div class="ttl">曹锟 ↔ 孙殿英</div><div class="desc">不要只写标签，写清历史关系或空间关系。</div></div></div>
        <div class="relation-card"><div class="nb">03</div><div><div class="ttl">张自忠 ↔ 金氏宅邸</div><div class="desc">每张卡控制在 2-3 行，形成信息密度。</div></div></div>
        <div class="relation-card"><div class="nb">04</div><div><div class="ttl">张自忠 ↔ 利德尔</div><div class="desc">可以用跨身份对照补充人文厚度。</div></div></div>
      </aside>
      <div class="map-panel">
        <div class="map-title"><div class="k">RELATION MAP</div><div class="t">地点 / 人物 / 事件</div></div>
        <div class="map-controls" aria-label="地图控制">
          <button class="map-ctrl" type="button" data-map-ctrl="zoom-in" aria-label="放大地图">+</button>
          <button class="map-ctrl" type="button" data-map-ctrl="zoom-out" aria-label="缩小地图">-</button>
          <button class="map-ctrl drag" type="button" data-map-ctrl="drag" aria-label="拖动地图" aria-pressed="false">DRAG</button>
        </div>
        <div id="swiss-map" class="swiss-map" data-points='[填入 JSON]' data-relations='[填入 JSON]'>
          <div class="map-static" aria-hidden="true">
            <svg class="static-relations" viewBox="0 0 100 100" preserveAspectRatio="none">[静态连线]</svg>
            [静态 marker 卡片]
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## 必要 JS

放到 `</body>` 前。生成多张地图页时，把 id 从 `swiss-map` 改成唯一 id，并让初始化函数接收 selector。

```html
<script>
(() => {
  function readJson(el, key, fallback){
    try { return JSON.parse(el.dataset[key] || ''); }
    catch { return fallback; }
  }
  function initSwissMap(){
    const el = document.getElementById('swiss-map');
    if(!el || el.dataset.ready) return;
    el.dataset.ready = '1';
    const points = readJson(el, 'points', []);
    const relations = readJson(el, 'relations', []);
    function coord(id){ return points.find(p => p.id === id).coord; }
    const panel = el.closest('.map-panel');
    panel?.addEventListener('wheel', (event) => event.stopPropagation(), {passive:true});
    ['pointerdown','pointermove','pointerup','click','dblclick','touchstart','touchmove'].forEach((type) => {
      panel?.addEventListener(type, (event) => event.stopPropagation(), {passive:true});
    });
    if(window.__lowPowerMode || !window.maplibregl){
      el.classList.add('fallback-only');
      return;
    }
    const center = points.length
      ? [points.reduce((sum, p) => sum + p.coord[0], 0) / points.length, points.reduce((sum, p) => sum + p.coord[1], 0) / points.length]
      : [0, 0];
    const map = new maplibregl.Map({
      container: el,
      style: {
        version:8,
        sources:{ osm:{ type:'raster', tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize:256, attribution:'© OpenStreetMap contributors' } },
        layers:[{ id:'osm', type:'raster', source:'osm', paint:{ 'raster-saturation':-0.88, 'raster-contrast':0.08, 'raster-opacity':0.46 } }]
      },
      center,
      zoom: Number(el.dataset.zoom || 15),
      interactive: true,
      attributionControl: false
    });
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.dragPan.disable();
    map.on('load', () => {
      el.classList.add('map-live');
      map.addSource('relations', {
        type:'geojson',
        data:{ type:'FeatureCollection', features:relations.map(([a,b]) => {
          const from = coord(a);
          const to = coord(b);
          return from && to ? { type:'Feature', geometry:{ type:'LineString', coordinates:[from, to] }, properties:{} } : null;
        }).filter(Boolean) }
      });
      map.addLayer({ id:'relations', type:'line', source:'relations', paint:{ 'line-color':'#1936b3', 'line-opacity':.62, 'line-width':2, 'line-dasharray':[2,2] } });
      for(const p of points){
        const marker = document.createElement('div');
        marker.className = 'person-marker' + (p.accent ? ' accent' : '') + (p.side === 'left' ? ' left' : '');
        marker.innerHTML = '<span class="pin-dot"></span><span class="pin-line"></span><span class="pin-card"><span class="pin-name">' + p.name + '</span><span class="pin-meta">' + p.meta + '</span></span>';
        marker.title = p.name;
        new maplibregl.Marker({ element: marker }).setLngLat(p.coord).addTo(map);
      }
      setTimeout(() => map.resize(), 300);
    });
    document.getElementById('deck')?.addEventListener('transitionend', () => map.resize());
    const zoomIn = panel?.querySelector('[data-map-ctrl="zoom-in"]');
    const zoomOut = panel?.querySelector('[data-map-ctrl="zoom-out"]');
    const drag = panel?.querySelector('[data-map-ctrl="drag"]');
    zoomIn?.addEventListener('click', (event) => { event.stopPropagation(); map.zoomIn(); });
    zoomOut?.addEventListener('click', (event) => { event.stopPropagation(); map.zoomOut(); });
    drag?.addEventListener('click', (event) => {
      event.stopPropagation();
      const active = drag.classList.toggle('active');
      drag.setAttribute('aria-pressed', active ? 'true' : 'false');
      drag.textContent = active ? 'DRAG ON' : 'DRAG';
      if(active) map.dragPan.enable(); else map.dragPan.disable();
    });
  }
  window.addEventListener('DOMContentLoaded', () => setTimeout(initSwissMap, 500));
})();
</script>
```

## 视觉检查

- 左侧卡片总高度要和右侧地图卡片对齐，不要上浮一半。
- 地图标题和控制按钮不能互相遮挡；点位卡片不能压到右上角控制区。
- marker 卡片至少显示地点名，`meta` 只作为短标签。
- 左侧关系卡不要惜字如金，每张卡应有完整一句解释。
- 若地图无法加载，静态 fallback 仍必须可读。

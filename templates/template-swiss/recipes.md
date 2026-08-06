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
node platform/validate.mjs template-swiss
```

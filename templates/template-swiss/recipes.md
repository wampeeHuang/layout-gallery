# Recipes · Swiss International Style

AI Agent 用此模板生成幻灯片的操作配方。

## 前置条件

- `tokens.json` 已编译到 `template.html` 的 `:root` 块
- 已选定主题（默认 IKB 克莱因蓝，可选黄/绿/橙）
- `runtime/deck-stage.js` 加载为 Web Component

## 生成流程

### Step 1: 拷贝骨架

从 `template.html` 复制 `<head>` 完整内容（含 `<style>` 块），只替换 `<title>` 文字。`<body>` 保留 `canvas.bg` + `<deck-stage>` 容器。

### Step 2: 选主题

从 `themes.json` 选一套预设，覆盖 3 个 accent 变量：

```css
--accent: #002FA7;        /* IKB 默认 */
--accent-rgb: 0,47,167;
--accent-on: #ffffff;
```

灰阶变量（`--paper` / `--ink` / `--grey-1/2/3`）不换——4 套统一。

### Step 3: 逐页生成 slide

在 `<deck-stage>` 内每页一个 `<section class="slide">`。按用途套类：

| 页类型 | 类组合 |
|--------|--------|
| 封面 | `.slide` + `.hero` + `.lead` |
| KPI 页 | `.slide.grey` + `.grid-4` + `.stat` + `.kpi-label` |
| 引用页 | `.slide.dark` + `.lead` |
| 强调页 | `.slide.accent` + `.hero` + `.accent-block` |
| 正文/表格 | `.slide` + `.data-table` 或 `.grid-*` |
| 结尾 CTA | `.slide.accent` + `.chrome-cta` |

### Step 4: 注入 Chrome

每页底部自动生成 chrome（页码 + CTA），由 `deck-stage.js` 渲染。`<title>` 和 chrome 文案用选定主题的语义关键词强化（如 IKB 配 "International / Helvetica"，柠檬黄配 "Active / Living"）。

## 设计约束（铁律）

1. **一份 deck 一套主题**——不中途换 accent
2. **灰阶不动**——`--paper` / `--grey-1/2/3` / `--ink` 跨主题统一
3. **浅色 accent 黑字**——柠檬黄、柠檬绿的 `--accent-on` 必须 `#0a0a0a`
4. **纯色无渐变**——瑞士风拒绝任何渐变，accent 块无阴影无圆角
5. **字体不混搭**——标题/正文统一 Inter 栈，数据/代码统一 JetBrains Mono 栈
6. **间距走 token**——用 `--sp-N` 不用裸 px
7. **颜色走 `var(--...)`**——不硬编码 hex/rgba。body CSS 里 `#ffffff` 换 `var(--color-on-primary)`

## 验证门禁

生成后跑：

```bash
node platform/validate.mjs template-swiss
node platform/compile.mjs template-swiss --check
```

## 常见错误

| 错误 | 症状 | 修复 |
|------|------|------|
| 黄/绿色块上白字 | 文字糊掉 | `--accent-on` 改 `#0a0a0a` |
| accent 色满屏 | 视觉疲劳 | IKB 只做大色块锚点，不泛滥到每行 |
| 渐变背景 | 破瑞士风 | 纯色 `background: var(--color-primary)` |
| 阴影/圆角 accent | 破瑞士风硬规则 | 去阴影去圆角 |

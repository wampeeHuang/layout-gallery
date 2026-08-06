# Recipes · Emerald Editorial

AI Agent 用此模板生成幻灯片的操作配方。

## 前置条件

- `tokens.json` 已编译到 `template.html` 的 `:root` 块
- `runtime/deck-stage.js` 加载为 Web Component

## 生成流程

### Step 1: 拷贝骨架

从 `template.html` 复制 `<head>` 完整内容，只替换 `<title>`。保留 `<style>` 和 `<canvas class="bg">` 容器。

### Step 2: 逐页生成 slide

在 `<deck-stage>` 内每页一个 `<section class="slide">`。参考 `template.html` 中已有的 slide 结构作为模板。

### Step 3: 注入 Chrome

底部 chrome（页码 + CTA）由 `deck-stage.js` 自动渲染。

## 设计约束

1. 颜色走 `var(--...)` — 不硬编码 hex/rgba
2. 间距走 token — 用 `--sp-N` 不用裸 px
3. 字体走 `--font-display` / `--font-body` / `--font-mono`
4. 一份 deck 一套主题

## 验证

```bash
node platform/validate.mjs emerald-editorial
```

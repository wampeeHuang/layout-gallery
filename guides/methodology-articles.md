# 方法论文章体系（/learn）

设计方法论 4 篇全文页的机制细节。**铁律在 `AGENTS.md` §方法论文章体系**（页面层是呈现端，永远由生成器复现），本文件只讲怎么工作。命令真相源见 `AGENTS.md` 门禁段，不复制命令表。

## 真相流

```
wiki 源   D:\Obsidian\wiki\概念\UI和UX设计\设计方法论\   唯一真相：4 篇 md + 配图
生成器   scripts/generate-articles.mjs                   markdown-it 渲染 + 双嵌入→对照图 + 卡片生成
页面层   public/learn.html(方法论卡片 METHODOLOGY_CARDS 双标记) + public/learn/articles/*.html
```

改 wiki → `npm run generate:articles` → 复现文章 + 方法论卡片。**无自动 watch**，改 wiki 必须手动跑生成。

## 卡片数据源

learn.html 方法论 4 卡 = `<!-- METHODOLOGY_CARDS:start -->:end -->` 双标记区块，生成器每次全量重写（幂等，可重复跑）。数据源：
- 标题 = wiki frontmatter `title`
- 描述 = wiki frontmatter `desc`（新增字段，4 篇已加）
- 封面 = 文章内**首个嵌入图**自动检测：
  - `![[demo-ai-slop.png]] ![[demo-designed.png]]` 相邻双嵌入 → duo 双图卡（card-preview--duo，alt 按 slug 分 VISUAL/ANTISLOP）
  - 单 `![[xxx.svg]]` → 单图卡（card-preview--fig，alt 走 `SVG_ALTS`）

## demo 双图

demo-ai-slop.png + demo-designed.png 同对图共享两篇（视觉品质/去AI味），按 slug 套不同 caption（AI 默认产物/按 10 条约束重做 vs AI 味版/去味版）。wiki 源存真嵌入，Obsidian 可见。

## 问句标题问号门禁

生成器 `lintQuestionHeadings()`：问句标题（开头问词 怎么/为什么/如何… 或结尾问词 吗/呢/吧/什么…）必须带 ？否则 exit 1。误报排除：`是(什么|谁|…)` 需整段判断——「不是什么东西都一样大」是陈述句不算。wiki 4 篇已补齐 7 处。

## 排版契约

标题黑体 `var(--font-body)`，正文宋体 `var(--font-display)`。字号阶梯 h1 64 / h2 32 / h3 20 / 正文 17px。踩坑备忘：h2 用 `margin:var(--space-48,48px) 0 var(--space-16,16px)`——`--space-40` 未在 :root 定义，用了整条 margin 塌成 0。

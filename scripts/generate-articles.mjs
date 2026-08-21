// 生成「设计方法论」4 篇文章的静态 HTML 页。
// 源 = 本地 Obsidian（唯一真相源）：D:\Obsidian\wiki\概念\UI和UX设计\设计方法论\
// 产物 = public/learn/articles/*.html（派生缓存，commit 后 Vercel 静态发）。
// Obsidian 改文章后重跑：npm run generate:articles
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');

const SOURCE_DIR = 'D:\\Obsidian\\wiki\\概念\\UI和UX设计\\设计方法论';
const OUT_DIR = path.join(PROJECT_DIR, 'public', 'learn', 'articles');

const ARTICLES = [
  { file: '网页交付标准指南.md', slug: 'delivery-standard' },
  { file: '网页视觉品质原则.md', slug: 'visual-quality' },
  { file: 'Design Token 的通用语言.md', slug: 'design-token' },
  { file: '去AI味网页设计指南.md', slug: 'anti-ai-slop' },
];

// Obsidian 笔记名 → 站内 slug（wikilink 转站内链接用）
const NOTE_SLUGS = {
  '网页交付标准指南': 'delivery-standard',
  '网页视觉品质原则': 'visual-quality',
  'Design Token 的通用语言': 'design-token',
  '去AI味网页设计指南': 'anti-ai-slop',
  '去AI味网页设计': 'anti-ai-slop',
};

const md = new MarkdownIt({ html: true, linkify: true });

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return { meta: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: text };
  const fm = text.slice(3, end);
  const body = text.slice(end + 4).trim();
  const meta = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body };
}

// 中文文件名在静态服务/URL 编码下不可靠 → 落盘统一转 ASCII
const SVG_RENAMES = { '知识_DTCG运行机制.svg': 'dtcg-runtime.svg' };
// 嵌入图的描述性 alt（默认用去后缀 ASCII 文件名，描述性更强时在此覆盖）
const SVG_ALTS = {
  'delivery-gates.svg': '四门串行判定流程图',
  'dtcg-runtime.svg': 'DTCG 运行机制架构图',
};

// 对照 demo 双图（AI 味 vs 去味）。wiki 里用 <!-- DEMO_DUO_VISUAL / DEMO_DUO_ANTISLOP --> 占位，生成时注入。
const DEMO_DUO = {
  VISUAL:
    '<figure style="display:flex;gap:16px;flex-wrap:wrap;margin:var(--space-16) 0 var(--space-24)">\n' +
    '  <div style="flex:1 1 45%;min-width:280px">\n' +
    '    <img src="/public/learn/articles/demo-ai-slop.png" alt="AI 默认产物" style="width:100%;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.14)">\n' +
    '    <div style="font-size:12px;color:var(--color-on-surface-variant);margin-top:8px">AI 默认产物</div>\n' +
    '  </div>\n' +
    '  <div style="flex:1 1 45%;min-width:280px">\n' +
    '    <img src="/public/learn/articles/demo-designed.png" alt="按 10 条约束重做" style="width:100%;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.14)">\n' +
    '    <div style="font-size:12px;color:var(--color-on-surface-variant);margin-top:8px">按 10 条约束重做</div>\n' +
    '  </div>\n' +
    '</figure>',
  ANTISLOP:
    '<figure style="display:flex;gap:16px;flex-wrap:wrap;margin:var(--space-16) 0 var(--space-24)">\n' +
    '  <div style="flex:1 1 45%;min-width:280px">\n' +
    '    <img src="/public/learn/articles/demo-ai-slop.png" alt="AI 味版" style="width:100%;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.14)">\n' +
    '    <div style="font-size:12px;color:var(--color-on-surface-variant);margin-top:8px">AI 味版：渐变大字、靛蓝按钮、光球、三列卡片、emoji 图标、编造数据</div>\n' +
    '  </div>\n' +
    '  <div style="flex:1 1 45%;min-width:280px">\n' +
    '    <img src="/public/learn/articles/demo-designed.png" alt="去味版" style="width:100%;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.14)">\n' +
    '    <div style="font-size:12px;color:var(--color-on-surface-variant);margin-top:8px">去味版：品牌绿、左对齐、字重拉开、真实截图占位、具体数据</div>\n' +
    '  </div>\n' +
    '</figure>',
};

// slug → duo 对照图的 caption 版本（图同对，文案因文章视角不同）
const DUO_SLUG_KEYS = { 'visual-quality': 'VISUAL', 'anti-ai-slop': 'ANTISLOP' };

// demo 双图现在以真嵌入形式存在于 wiki（Obsidian 可见），生成时识别相邻双嵌入 → duo figure。
// 兼容旧 `<!-- DEMO_DUO_* -->` 占位（防残留）。
function injectFigures(body, slug) {
  const duoKey = DUO_SLUG_KEYS[slug] || 'VISUAL';
  let b = body.replace(
    /!\[\[demo-ai-slop\.png\]\]\s*!\[\[demo-designed\.png\]\]/g,
    () => DEMO_DUO[duoKey]
  );
  b = b.replace(/<!--\s*DEMO_DUO_(\w+)\s*-->/g, (_m, key) => DEMO_DUO[key] || '');
  return b;
}

function preprocess(body) {
  // 1. 图片嵌入 ![[xxx.svg]] → 复制 svg 到产物目录（ASCII 名）并转 <img>
  body = body.replace(/!\[\[([^\]]+)\]\]/g, (_m, target) => {
    const src = path.join(SOURCE_DIR, target);
    const ascii = SVG_RENAMES[target] || target.replace(/[^\x20-\x7E]/g, '');
    const dst = path.join(OUT_DIR, ascii);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      const alt = SVG_ALTS[ascii] || ascii.replace(/\.svg$/i, '');
      return `![${alt}](/public/learn/articles/${ascii})`;
    }
    return '';
  });

  // 2. mermaid 代码块 → 丢弃（「四个门」信息已由上方表格承载，首版不渲染流程图）
  body = body.replace(/```mermaid[\s\S]*?```/g, '');

  // 3. wikilink [[...]] → 站内链接或纯文字
  body = body.replace(/\[\[([^\]]+)\]\]/g, (_m, target) => {
    if (NOTE_SLUGS[target]) {
      return `<a href="/learn/articles/${NOTE_SLUGS[target]}">${target}</a>`;
    }
    return target.split('/').pop();
  });

  return body;
}

function postprocess(html) {
  html = html.replace(/<li>\[ \]\s*/g, '<li class="check">');
  html = html.replace(/<li>\[x\]\s*/g, '<li class="check done">');
  return html;
}

// 门禁：问句标题必须打问号（"这是什么" → "这是什么？"）。防 wiki 新问句标题漏 ？ 复发。
// 判定收紧：问句 = 开头问词（怎么/为什么/如何…）或结尾问词（吗/呢/吧/什么/谁…）。
// 排除误报："不是什么东西都一样大" 含"是什么"子串但是陈述句；"怎么让 AI 做：" 是命令句（以 ： 结尾）。
function lintQuestionHeadings(body, slug) {
  const issues = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^#{1,4}\s+(.+?)\s*$/);
    if (!m) continue;
    const t = m[1].trim();
    const isQuestion =
      /^(怎么|为什么|如何|为何|哪些|多少|是不是|能不能|有没有)/.test(t) ||
      /(吗|呢|吧|什么|哪里|谁|怎么|为什么)$/.test(t) ||
      /^(这|它|那|哪个|那样)?是(什么|谁|哪里|怎样|怎么回事)/.test(t);
    if (isQuestion && !/[？：]$/.test(t)) issues.push(t);
  }
  if (issues.length) {
    console.error(`[question-mark] ${slug}: 问句标题缺问号`);
    for (const i of issues) console.error(`  - ${i}`);
    process.exitCode = 1;
  }
}

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233D6B4A'/%3E%3Crect x='10' y='15' width='12' height='34' rx='3' fill='%23fff'/%3E%3Crect x='26' y='19' width='12' height='26' rx='3' fill='%23fff' opacity='.7'/%3E%3Crect x='42' y='24' width='12' height='16' rx='3' fill='%23fff' opacity='.4'/%3E%3C/svg%3E";

function page(title, metaHtml, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="${FAVICON}">
<title>${title} · 设计方法论 · 版式画廊</title>
<style>
<!-- ROOT_INJECT -->
/* 方法论文章版式：黑体标题 + 宋体正文。全局 token 语义 display=标题/body=正文，统一后值 = display 黑体、body 宋体，此处用文章专属变量显式表达，语义随 token 走。 */
:root{--article-heading:var(--font-display);--article-body:var(--font-body)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:clip;background:var(--color-surface);color:var(--color-on-surface);font-family:var(--font-body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}
.article{width:100%;max-width:var(--space-page-wmax);margin:0 auto;padding:var(--space-48) clamp(20px,4vw,48px) var(--space-64)}
.article-body{max-width:720px;margin:0 auto;font-family:var(--article-body);font-weight:400}
.article-back{display:block;max-width:720px;margin:0 auto var(--space-24);font-size:var(--typescale-label-large);color:var(--color-primary);font-weight:600}
.article-back:hover{text-decoration:underline}
.article h1{font-family:var(--article-heading);font-size:clamp(36px,6vw,64px);font-weight:500;letter-spacing:-0.02em;line-height:1.15;color:#000;margin-bottom:var(--space-16)}
.article-meta{font-size:var(--typescale-label-medium);color:var(--color-on-surface-variant);margin-bottom:var(--space-32)}
.article h2{font-family:var(--article-heading);font-size:clamp(24px,3vw,32px);font-weight:500;letter-spacing:-0.01em;color:#000;margin:var(--space-48,48px) 0 var(--space-16,16px)}
.article h3{font-family:var(--article-heading);font-size:20px;font-weight:500;color:#000;margin:var(--space-32,32px) 0 var(--space-8,8px)}
.article p{font-size:17px;line-height:1.9;color:#000;margin-bottom:var(--space-24)}
.article ul,.article ol{margin:0 0 var(--space-16) var(--space-24);line-height:1.8}
.article li{margin-bottom:var(--space-8)}
.article strong{font-weight:600}
.article blockquote{border-left:3px solid var(--color-primary);padding:var(--space-8) var(--space-16);margin:var(--space-16) 0;background:var(--color-surface-container-low);color:var(--color-on-surface-variant)}
.article blockquote p{margin:0}
.article table{border-collapse:collapse;width:100%;margin:var(--space-16) 0 var(--space-24);font-size:var(--typescale-label-large,15px)}
.article table th,.article table td{border:var(--hairline) solid var(--color-outline);padding:var(--space-8) var(--space-12);text-align:left;vertical-align:top}
.article table th{background:var(--color-surface-container-low);font-weight:600}
.article code{font-family:var(--font-mono,monospace);background:var(--color-surface-container-low);padding:2px 6px;border-radius:4px;font-size:0.9em}
.article pre{background:#1a1a1a;color:#e8e8e8;padding:var(--space-16);border-radius:var(--radius-xs);overflow-x:auto;margin:var(--space-16) 0;font-size:14px;line-height:1.5}
.article pre code{background:none;padding:0;color:inherit}
.article .check{list-style:none;margin-left:0;position:relative;padding-left:var(--space-24)}
.article .check::before{content:'';position:absolute;left:0;top:0.35em;width:14px;height:14px;border:1.5px solid var(--color-outline);border-radius:3px}
.article .check.done::before{background:var(--color-primary);border-color:var(--color-primary)}
.article hr{border:none;border-top:var(--hairline) solid var(--color-outline);margin:var(--space-32) 0}
.article img{max-width:100%;height:auto;margin:var(--space-16) 0}
</style>
</head>
<body class="learn">
<!-- NAV_INJECT -->
<article class="article">
  <a class="article-back" href="/learn#methodology">← 回到设计方法论</a>
  <div class="article-body">
${bodyHtml}${metaHtml}
  </div>
</article>
<!-- FOOTER_INJECT -->
</body>
</html>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const cardData = [];

// 方法论卡片封面 = 文章内第一个嵌入图；demo 双嵌入 → 对照双图（duo）
function detectCover(body) {
  if (/!\[\[demo-ai-slop\.png\]\]\s*!\[\[demo-designed\.png\]\]/.test(body)) return 'duo';
  const m = body.match(/!\[\[([^\]]+)\]\]/);
  return m ? { file: m[1] } : null;
}

// duo 双图 alt（图同对，alt 随文章视角）
const DUO_ALT = {
  'visual-quality': ['AI 默认产物', '按 10 条约束重做'],
  'anti-ai-slop': ['AI 味版', '去味版'],
};

function duoPreview(slug) {
  const [a1, a2] = DUO_ALT[slug] || DUO_ALT['visual-quality'];
  return `<div class="card-preview card-preview--duo"><div class="card-preview-body">
          <img class="fig-shot" src="/public/learn/articles/demo-ai-slop.png" alt="${a1}" loading="lazy">
          <img class="fig-shot" src="/public/learn/articles/demo-designed.png" alt="${a2}" loading="lazy">
        </div></div>`;
}

function figPreview(cover) {
  const ascii = SVG_RENAMES[cover.file] || cover.file.replace(/[^\x20-\x7E]/g, '');
  const alt = SVG_ALTS[ascii] || ascii.replace(/\.svg$/i, '');
  return `<div class="card-preview card-preview--fig"><div class="card-preview-body"><img class="fig-shot" src="/public/learn/articles/${ascii}" alt="${alt}" loading="lazy"></div></div>`;
}

function methodologyCard({ a, meta, cover }) {
  const title = meta.title || a.file.replace(/\.md$/, '');
  const preview = cover === 'duo' ? duoPreview(a.slug) : cover ? figPreview(cover) : '';
  return `      <a class="card" href="/learn/articles/${a.slug}">
        ${preview}
        <div class="card-body">
          <h3>${title}</h3>
          <p>${meta.desc || ''}</p>
          <span class="card-link">阅读全文 →</span>
        </div>
      </a>`;
}

// learn.html 是呈现端，方法论卡片一律由此函数复现，不手工改。
// 区块用 `<!-- METHODOLOGY_CARDS:start --> ... :end -->` 双标记包裹，每次全量重写标记间内容（幂等）。
function writeMethodologyCards(entries) {
  const learnPath = path.join(PROJECT_DIR, 'public', 'learn.html');
  const html = fs.readFileSync(learnPath, 'utf-8');
  const marker = /<!--\s*METHODOLOGY_CARDS:start\s*-->[\s\S]*?<!--\s*METHODOLOGY_CARDS:end\s*-->/;
  if (!marker.test(html)) {
    console.error('[warn] learn.html 找不到 METHODOLOGY_CARDS:start/:end 标记，跳过卡片写入');
    return;
  }
  const cards = entries.map(methodologyCard).join('\n');
  const block = `<!-- METHODOLOGY_CARDS:start -->\n${cards}\n      <!-- METHODOLOGY_CARDS:end -->`;
  fs.writeFileSync(learnPath, html.replace(marker, block), 'utf-8');
  console.log(`[ok] learn.html 方法论卡片已复现 ×${entries.length}`);
}

for (const a of ARTICLES) {
  const srcPath = path.join(SOURCE_DIR, a.file);
  if (!fs.existsSync(srcPath)) {
    console.error(`[skip] 源文件不存在: ${srcPath}`);
    continue;
  }
  const raw = fs.readFileSync(srcPath, 'utf-8');
  const { meta, body } = stripFrontmatter(raw);
  lintQuestionHeadings(body, a.slug);
  const html = postprocess(md.render(preprocess(injectFigures(body, a.slug))));
  const metaHtml = meta.updated
    ? `<div class="article-meta">更新于 ${meta.updated} · ${meta.status || ''}</div>`
    : '';
  const title = meta.title || a.file.replace(/\.md$/, '');
  const outPath = path.join(OUT_DIR, a.slug + '.html');
  fs.writeFileSync(outPath, page(title, metaHtml, html), 'utf-8');
  console.log(`[ok] ${a.slug}.html  (${title})`);
  cardData.push({ a, meta, cover: detectCover(body) });
}

writeMethodologyCards(cardData);

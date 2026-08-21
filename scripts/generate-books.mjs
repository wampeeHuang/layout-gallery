// 生成「书籍推荐」卡片（learn.html 04 书籍推荐区）。
// 源 = Obsidian（唯一真相源）：
//   - wiki\概念\UI和UX设计\书籍推荐.md  → 分组 + 书单顺序（wikilink → 书页）
//   - raw\书籍\{书页}.md               → 英文名（基本信息·书名）+ 完整简介（内容简介）+ 封面资产
// 产物 = public/learn.html BOOK_CARDS marker 块（派生缓存，commit 后 Vercel 静态发）。
// 改 wiki/Raw 后重跑：npm run generate:books。本脚本即门禁——任意必填字段缺失 exit 非 0。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');

const WIKI_INDEX = 'D:\\Obsidian\\wiki\\概念\\UI和UX设计\\书籍推荐.md';
const BOOKS_DIR = 'D:\\Obsidian\\Raw\\书籍';
const COVERS_DIR = path.join(PROJECT_DIR, 'public', 'img', 'covers');
const LEARN_PATH = path.join(PROJECT_DIR, 'public', 'learn.html');

// wiki 分组（## 标题）→ learn.html section id（映射保留页面现有 2 组结构）
const GROUP_SECTIONS = {
  排版: 'sec-typography',
  界面与布局: 'sec-layout',
};
// wiki 分组但非书籍书单区（导航/索引，跳过不报错）
const SKIP_GROUPS = ['相关'];

// 中文书名 → 画廊封面 slug（英文 slug 利于 URL；gallery 缺则从 Raw assets 复制）
const BOOK_COVERS = {
  字体的技艺: 'elements-typographic-style',
  实用字体排印: 'practical-typography',
  用字设计: 'designing-with-type',
  图解字型思考: 'thinking-with-type',
  重构界面: 'refactoring-ui',
  平面设计中的网格系统: 'grid-systems',
};

function parseIndex() {
  const text = fs.readFileSync(WIKI_INDEX, 'utf-8');
  const groups = [];
  let current = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      current = h[1].trim();
      groups.push({ name: current, books: [] });
      continue;
    }
    if (!current) continue;
    // 表行：| [[链接\|别名]] | 作者 | 解决什么 |（wikilink 内 \| 是转义管道）
    const row = line.match(/^\|\s*\[\[([^\]]+)\]\]\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/);
    if (!row) continue;
    const [link, ...aliasParts] = row[1].split('\\|');
    groups[groups.length - 1].books.push({
      link: link.trim(),
      alias: aliasParts.join('\\|').trim(),
      author: row[2].trim(),
      desc: row[3].trim(),
    });
  }
  return groups;
}

function extractBookPage(link) {
  const p = path.join(BOOKS_DIR, link + '.md');
  if (!fs.existsSync(p)) return { missing: true };
  const text = fs.readFileSync(p, 'utf-8');
  const enMatch = text.match(/^\|\s*书名\s*\|\s*([^|]+?)\s*\|/m);
  const introMatch = text.match(/^##\s*内容简介\s*\n+([\s\S]*?)(?=\n##\s|\n---|$)/m);
  return { en: (enMatch?.[1] || '').trim(), intro: (introMatch?.[1] || '').trim() };
}

function resolveCover(bookTitle) {
  const slug = BOOK_COVERS[bookTitle];
  if (!slug) return { error: `《${bookTitle}》无封面 slug 映射——BOOK_COVERS 补登记` };
  const gallery = path.join(COVERS_DIR, slug + '.jpg');
  if (fs.existsSync(gallery)) return { slug };
  const src = path.join(BOOKS_DIR, 'assets', bookTitle + '.jpg');
  if (!fs.existsSync(src)) return { error: `《${bookTitle}》封面缺失：gallery 无 ${slug}.jpg 且 raw\\书籍\\assets\\${bookTitle}.jpg 不存在` };
  fs.copyFileSync(src, gallery);
  return { slug, copied: true };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 呈现层规范化：中文正文用弯引号（源用直引号，页面其余处均用“ ”）
function cnQuotes(s) {
  return String(s).replace(/"([^"\n]*)"/g, '“$1”');
}

function bookCard(book) {
  const cover = book.cover.slug
    ? `<div class="book-cover"><img src="/public/img/covers/${book.cover.slug}.jpg" alt="${esc(book.bookTitle)}封面" loading="lazy"></div>`
    : `<div class="book-cover book-cover--placeholder">暂无封面</div>`;
  return `      <div class="card">
        ${cover}
        <div class="card-body">
          <div class="book-title-zh">《${esc(book.bookTitle)}》</div>
          <div class="book-title-en">${esc(book.en)}</div>
          <div class="author">${esc(book.author)}</div>
          <p>${esc(cnQuotes(book.intro))}</p>
        </div>
      </div>`;
}

const groups = parseIndex();
const sections = { 'sec-typography': [], 'sec-layout': [] };
const errors = [];

for (const g of groups) {
  if (SKIP_GROUPS.includes(g.name)) continue;
  const section = GROUP_SECTIONS[g.name];
  if (!section) {
    errors.push(`书籍推荐.md 未知分组「${g.name}」——需在生成器 GROUP_SECTIONS 登记`);
    continue;
  }
  for (const b of g.books) {
    const page = extractBookPage(b.link);
    if (page.missing) {
      errors.push(`书籍 wikilink 解析失败：raw\\书籍\\${b.link}.md 不存在`);
      continue;
    }
    const bookTitle = b.alias || (b.link.match(/《([^》]+)》/)?.[1] ?? b.link);
    const cover = resolveCover(bookTitle);
    if (cover.error) errors.push(cover.error);
    if (!page.en) errors.push(`《${bookTitle}》书页缺「书名」英文名（基本信息表）`);
    if (!page.intro) errors.push(`《${bookTitle}》书页缺「内容简介」段`);
    sections[section].push({ ...b, bookTitle, en: page.en, intro: page.intro, cover });
  }
}

if (errors.length) {
  console.error(`[fail] 书籍生成器 ${errors.length} 项违规：`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// 全量重写 marker 间内容（幂等）
let html = fs.readFileSync(LEARN_PATH, 'utf-8');
for (const [sectionId, cards] of Object.entries(sections)) {
  const marker = new RegExp(`<!--\\s*BOOK_CARDS:${sectionId}:start\\s*-->[\\s\\S]*?<!--\\s*BOOK_CARDS:${sectionId}:end\\s*-->`);
  if (!marker.test(html)) {
    console.error(`[fail] learn.html 找不到 BOOK_CARDS:${sectionId}:start/:end 标记——先手动加双标记`);
    process.exit(1);
  }
  const block = `<!-- BOOK_CARDS:${sectionId}:start -->\n${cards.map(bookCard).join('\n')}\n      <!-- BOOK_CARDS:${sectionId}:end -->`;
  html = html.replace(marker, block);
}
fs.writeFileSync(LEARN_PATH, html, 'utf-8');

const copied = Object.values(sections).flat().filter(b => b.cover.copied);
if (copied.length) for (const b of copied) console.log(`[ok] 封面已复制 ${b.bookTitle}.jpg → covers/${b.cover.slug}.jpg`);
console.log(`[ok] learn.html 书籍卡片已复现 ×${Object.values(sections).reduce((n, s) => n + s.length, 0)}（字体排印 ${sections['sec-typography'].length} + 界面与布局 ${sections['sec-layout'].length}）`);

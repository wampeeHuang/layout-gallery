// 一次性拉取 learn 页静态资源：书籍封面(Open Library) + 站点图标(DuckDuckGo icons)。
// 本地落盘，避免运行时依赖被墙的第三方图标服务。
// 用法：node scripts/fetch-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const LEARN = path.join(PROJECT, 'public', 'learn.html');
const COVERS_DIR = path.join(PROJECT, 'public', 'img', 'covers');
const FAVICONS_DIR = path.join(PROJECT, 'public', 'img', 'favicons');

fs.mkdirSync(COVERS_DIR, { recursive: true });
fs.mkdirSync(FAVICONS_DIR, { recursive: true });

// 书籍封面：Open Library cover_i → 文件名
const BOOKS = [
  { id: 812786, file: 'thinking-with-type.jpg' },
  { id: 1023660, file: 'grid-systems.jpg' },
  { id: 678861, file: 'elements-typographic-style.jpg' },
  { id: 624095, file: 'designing-with-type.jpg' },
  { id: 10527062, file: 'refactoring-ui.jpg' },
];

// Node 全局 fetch(undici) 不认 HTTPS_PROXY 环境变量，走 curl（curl 自动读代理）
function dl(url, dest) {
  execSync(`curl -sL --fail -o "${dest}" "${url}"`);
  return fs.statSync(dest).size;
}

// ── 1. 书籍封面 ──
for (const b of BOOKS) {
  const dest = path.join(COVERS_DIR, b.file);
  try {
    const n = await dl(`https://covers.openlibrary.org/b/id/${b.id}-L.jpg`, dest);
    console.log(`[cover] ${b.file}  ${n} bytes`);
  } catch (e) {
    console.error(`[cover FAIL] ${b.file}  ${e.message}`);
  }
}

// ── 2. 站点图标 ──
const html = fs.readFileSync(LEARN, 'utf-8');
const domains = [...new Set([...html.matchAll(/href="https:\/\/([^\/"]+)/g)].map(m => m[1]))];
console.log(`\n[favicon] 发现 ${domains.length} 个域名`);

for (const d of domains) {
  const dest = path.join(FAVICONS_DIR, d + '.ico');
  try {
    const n = await dl(`https://icons.duckduckgo.com/ip3/${d}.ico`, dest);
    console.log(`[icon] ${d}  ${n} bytes`);
  } catch (e) {
    console.error(`[icon FAIL] ${d}  ${e.message}`);
  }
}

console.log('\ndone');

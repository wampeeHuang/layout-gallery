// 一次性抓取 learn 页站点/灵感卡片预览截图（16:9）。
// 用系统 Chrome + Vortex 代理，逐站截首屏落盘 public/img/screenshots/{domain}.jpg。
// 用法：node scripts/capture-screenshots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const LEARN = path.join(PROJECT, 'public', 'learn.html');
const OUT = path.join(PROJECT, 'public', 'img', 'screenshots');

fs.mkdirSync(OUT, { recursive: true });

// 从 learn.html 提取站点卡片 URL（整卡外链 a.card[target="_blank"]）
const html = fs.readFileSync(LEARN, 'utf-8');
const domains = [...html.matchAll(/<a class="card" href="https:\/\/([^\/"]+)/g)].map(m => m[1]);
console.log(`发现 ${domains.length} 个站点`);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  proxy: { server: 'http://127.0.0.1:7897' },
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  locale: 'zh-CN',
  ignoreHTTPSErrors: true,
});

let ok = 0, fail = 0;
for (const d of domains) {
  const dest = path.join(OUT, d + '.jpg');
  if (fs.existsSync(dest)) { console.log(`[skip] ${d} 已有`); continue; }
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  try {
    await page.goto('https://' + d, { waitUntil: 'commit', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: dest, type: 'jpeg', quality: 80 });
    const n = fs.statSync(dest).size;
    console.log(`[ok] ${d}  ${n} bytes`);
    ok++;
  } catch (e) {
    console.error(`[fail] ${d}  ${e.message.split('\n')[0]}`);
    fail++;
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\ndone  ok=${ok} fail=${fail}`);

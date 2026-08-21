#!/usr/bin/env node
// 批量抓取模板首屏缩略图（16:9 视口 1280×900）落盘 public/thumbs/{slug}.png。
// layout-gallery 自身卡片引用了 /thumbs/*.png，先播种占位图避免首抓破图，末尾复抓 layout-gallery 让其缩略图呈现真实图。
// 用法：node scripts/capture-thumbs.mjs [slug...]   （默认 layout-gallery, template-swiss, neo-grid-bold）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const OUT = path.join(PROJECT, 'public', 'thumbs');
const BASE = 'http://localhost:3080';

const DEFAULT_SLUGS = ['layout-gallery', 'template-swiss', 'neo-grid-bold'];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SLUGS;

fs.mkdirSync(OUT, { recursive: true });

// 1×1 暖纸色占位图（base64 PNG）
const PLACEHOLDER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
for (const slug of slugs) {
  const dest = path.join(OUT, slug + '.png');
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, PLACEHOLDER);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  locale: 'zh-CN',
});

async function capture(slug) {
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);
  try {
    await page.goto(`${BASE}/templates/${slug}/template.html`, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(400);
    const dest = path.join(OUT, slug + '.png');
    await page.screenshot({ path: dest, type: 'png' });
    const bytes = fs.statSync(dest).size;
    console.log(`[ok] ${slug}  ${bytes} bytes  → ${dest}`);
    return true;
  } catch (e) {
    console.error(`[fail] ${slug}  ${e.message.split('\n')[0]}`);
    return false;
  } finally {
    await page.close();
  }
}

let ok = 0, fail = 0;
for (const slug of slugs) (await capture(slug)) ? ok++ : fail++;

// layout-gallery 自身卡片嵌 /thumbs/*.png，首抓时仍是占位图 → 全部就位后复抓
if (slugs.includes('layout-gallery')) {
  console.log('re-capturing layout-gallery with real thumbs in place…');
  (await capture('layout-gallery')) ? ok++ : fail++;
}

await browser.close();
console.log(`\ndone  ok=${ok} fail=${fail}`);

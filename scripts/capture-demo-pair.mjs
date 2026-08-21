// 抓取 _runtime/demo-pair/ 下 AI 味 vs 去味对照 demo 首屏截图。
// 本地 file:// 直读，不走代理。落盘 public/learn/articles/{demo-ai-slop,demo-designed}.png
// 用法：node scripts/capture-demo-pair.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const DEMO = path.join(__dirname, 'demo-pair');
const OUT = path.join(PROJECT, 'public', 'learn', 'articles');

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  locale: 'zh-CN',
});

const jobs = [
  { file: 'slop.html', dest: 'demo-ai-slop.png' },
  { file: 'designed.html', dest: 'demo-designed.png' },
];

for (const j of jobs) {
  const page = await ctx.newPage();
  try {
    await page.goto('file://' + path.join(DEMO, j.file), { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, j.dest), type: 'png' });
    console.log(`[ok] ${j.dest}  ${fs.statSync(path.join(OUT, j.dest)).size} bytes`);
  } catch (e) {
    console.error(`[fail] ${j.dest}  ${e.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

// 把 learn 页站点卡片的骨架占位替换为本地截图（存在才替换，缺失保留骨架）。
// 用法：node scripts/inject-screenshots.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');
const LEARN = path.join(PROJECT, 'public', 'learn.html');
const SHOT_DIR = path.join(PROJECT, 'public', 'img', 'screenshots');

let html = fs.readFileSync(LEARN, 'utf-8');
const SKEL = '<div class="card-preview-body"><span class="skel w80"></span><span class="skel w60"></span><span class="skel w40"></span></div>';

let injected = 0, kept = 0;
html = html.replace(/<a class="card" href="https:\/\/([^\/"]+)" target="_blank" rel="noopener">[\s\S]*?<\/a>/g, (match, domain) => {
  const shot = path.join(SHOT_DIR, domain + '.jpg');
  if (fs.existsSync(shot)) {
    const img = `<div class="card-preview-body"><img class="card-shot" src="/public/img/screenshots/${domain}.jpg" alt="${domain} 截图" loading="lazy"></div>`;
    injected++;
    return match.replace(SKEL, img);
  }
  kept++;
  return match;
});

fs.writeFileSync(LEARN, html);
console.log(`done  injected=${injected} kept=${kept}`);

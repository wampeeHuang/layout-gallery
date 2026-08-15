#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const { renderBrandKit } = require('../server/brand-renderer');
const { readManifest } = require('./template-package.cjs');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1')), '..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'registry.json'), 'utf8'));

function hashFiles(files) {
  const hash = crypto.createHash('sha256');
  for (const file of files) hash.update(file).update('\0').update(fs.readFileSync(file));
  return hash.digest('hex');
}

function flatten(tokens) {
  return Object.values(tokens.tokens || {}).flat().map(token => `${token.name}:${Array.isArray(token.value) ? `cubic-bezier(${token.value.join(',')})` : token.value};`);
}

async function generate(entry, browser) {
  const dir = path.join(ROOT, path.dirname(entry.template_path));
  const files = ['design.md', 'tokens.json', 'template.html'].map(name => path.join(dir, name));
  if (!files.every(fs.existsSync)) throw new Error(`${entry.slug}: three-file package incomplete`);
  const { manifest } = readManifest(ROOT, entry.template_path, entry);
  const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
  const sourceHash = hashFiles(files);
  const output = path.join(ROOT, 'generated', entry.slug);
  fs.mkdirSync(output, { recursive: true });

  const projection = {
    schemaVersion: 1,
    sourceHash,
    slug: manifest.slug,
    name: manifest.name,
    lifecycle: manifest.lifecycle,
    taxonomy: manifest.taxonomy,
    capabilities: manifest.capabilities,
    quality: manifest.quality,
    templateUrl: `/${entry.template_path.replaceAll('\\', '/')}`,
    detailUrl: `/templates/${manifest.slug}/`,
    brandUrl: `/brand/${manifest.slug}/`,
    assets: {
      cover: `/generated/${manifest.slug}/cover.webp`,
      mobileProof: `/generated/${manifest.slug}/mobile.webp`,
    },
  };
  fs.writeFileSync(path.join(output, 'brand.html'), renderBrandKit(entry, ROOT), 'utf8');
  fs.writeFileSync(path.join(output, 'brand.json'), JSON.stringify(projection, null, 2), 'utf8');
  fs.writeFileSync(path.join(output, 'root.css'), `/* source-hash:${sourceHash} */\n:root{\n  ${flatten(tokens).join('\n  ')}\n}\n`, 'utf8');
  fs.writeFileSync(path.join(output, 'agent-brief.md'), `# ${manifest.name}\n\nSource hash: \`${sourceHash}\`\n\nRead in order: \`template.json\` → \`design.md\` → \`tokens.json\` → \`template.html\`. Reproduce structure and token relationships; do not invent catalog data or quality claims.\n`, 'utf8');

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(new URL(`file:///${path.join(dir, 'template.html').replaceAll('\\', '/')}`).href, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(output, 'cover.webp'), type: 'webp', quality: 82 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(output, 'mobile.webp'), type: 'webp', quality: 82, fullPage: true });
  await page.close();
  console.log(`generated ${entry.slug} ${sourceHash.slice(0, 12)}`);
}

const args = process.argv.slice(2);
const slugAt = args.indexOf('--slug');
const entries = slugAt >= 0 ? registry.filter(entry => entry.slug === args[slugAt + 1]) : args.includes('--all') ? registry : [];
if (!entries.length) {
  console.error('Usage: node scripts/generate.mjs --slug <slug> | --all');
  process.exit(1);
}
const browser = await chromium.launch({ headless: true });
try {
  for (const entry of entries) await generate(entry, browser);
} finally {
  await browser.close();
}

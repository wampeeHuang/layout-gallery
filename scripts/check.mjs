#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VERSION = '1.0.0';
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
];

function commandGate(id, args) {
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' });
  const text = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  return { id, ok: result.status === 0, issues: result.status === 0 ? [] : [text], evidence: { command: `node ${args.join(' ')}`, exitCode: result.status } };
}

// registry.json 视觉值残留检测：色值只准住在 tokens.json，registry 只留目录契约。
const REGISTRY_VISUAL_FIELDS = ['palette', 'css_variables', 'displayFont', 'bodyFont', 'typography_style', 'color_system', 'typography_scale'];
const registryDrift = (() => {
  const registryPath = path.join(ROOT, 'data', 'registry.json');
  if (!fs.existsSync(registryPath)) return { id: 'registry-drift', ok: false, issues: ['data/registry.json missing'] };
  const text = fs.readFileSync(registryPath, 'utf8');
  const issues = [];
  for (const field of REGISTRY_VISUAL_FIELDS) {
    if (new RegExp(`"${field}"\\s*:`).test(text)) issues.push(`registry.json contains visual field "${field}" — remove it; visual values live only in tokens.json`);
  }
  return { id: 'registry-drift', ok: issues.length === 0, issues, evidence: { checkedFields: REGISTRY_VISUAL_FIELDS } };
})();

function lineOf(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

function staticGates(slug) {
  const dir = path.join(ROOT, 'templates', slug);
  const htmlPath = path.join(dir, 'template.html');
  if (!fs.existsSync(htmlPath)) return [{ id: 'files', ok: false, issues: ['template.html missing'] }];
  const html = fs.readFileSync(htmlPath, 'utf8');
  const gates = [];

  const inline = [...html.matchAll(/\sstyle\s*=\s*["']/gi)].map(m => ({ line: lineOf(html, m.index), message: 'inline style attribute' }));
  gates.push({ id: 'inline-style', ok: inline.length === 0, issues: inline, evidence: { count: inline.length } });

  const resources = [];
  for (const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const value = match[1];
    if (!value || value.startsWith('#') || /^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(value)) continue;
    const clean = value.split(/[?#]/)[0];
    const resolved = clean.startsWith('/') ? path.join(ROOT, clean.slice(1)) : path.resolve(dir, clean);
    if (!fs.existsSync(resolved)) resources.push({ line: lineOf(html, match.index), resource: value });
  }
  gates.push({ id: 'resources', ok: resources.length === 0, issues: resources, evidence: { checkedLocalReferences: true } });

  const ids = [...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const structureIssues = [];
  if (!/^<!doctype html>/i.test(html.trimStart())) structureIssues.push('doctype must be first');
  if (!/<html\b[^>]*lang=/i.test(html)) structureIssues.push('html lang missing');
  for (const tag of ['html', 'head', 'body']) if (!new RegExp(`<${tag}\\b`, 'i').test(html) || !new RegExp(`</${tag}>`, 'i').test(html)) structureIssues.push(`${tag} is not closed`);
  if (duplicateIds.length) structureIssues.push({ duplicateIds });
  gates.push({ id: 'markup', ok: structureIssues.length === 0, issues: structureIssues, evidence: { ids: ids.length } });

  const hasReducedMotion = /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/i.test(html);
  gates.push({ id: 'reduced-motion', ok: hasReducedMotion, issues: hasReducedMotion ? [] : ['missing prefers-reduced-motion: reduce rule'] });

  const focusableCount = (html.match(/<(?:a\b[^>]*href=|button\b|input\b|select\b|textarea\b)/gi) || []).length;
  gates.push({ id: 'keyboard-static', ok: focusableCount > 0, issues: focusableCount > 0 ? [] : ['no native focusable control'], evidence: { focusableCount } });
  return gates;
}

async function browserGate(slug, browser) {
  if (!browser) return { id: 'browser', ok: false, issues: ['playwright unavailable'] };
  const htmlPath = path.join(ROOT, 'templates', slug, 'template.html');
  const issues = [];
  const evidence = { viewports: [], consoleErrors: [], requestFailures: [] };
  for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('console', message => { if (message.type() === 'error') evidence.consoleErrors.push(message.text()); });
      page.on('requestfailed', request => evidence.requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'failed' }));
      page.on('response', response => { if (response.status() >= 400) evidence.requestFailures.push({ url: response.url(), status: response.status() }); });
      try {
        await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'domcontentloaded', timeout: 5000 });
        await page.waitForTimeout(120);
        const result = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          duplicateIds: (() => { const ids = [...document.querySelectorAll('[id]')].map(el => el.id); return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]; })(),
          focusables: document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        }));
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement && document.activeElement !== document.body);
        evidence.viewports.push({ ...viewport, ...result, tabFocused: focused });
        if (result.scrollWidth !== result.clientWidth) issues.push(`${viewport.width}px horizontal overflow: ${result.scrollWidth} > ${result.clientWidth}`);
        if (result.duplicateIds.length) issues.push(`${viewport.width}px duplicate ids: ${result.duplicateIds.join(', ')}`);
        if (!result.reducedMotion) issues.push(`${viewport.width}px reduced-motion emulation not active`);
        if (result.focusables > 0 && !focused) issues.push(`${viewport.width}px Tab did not focus a control`);
      } catch (error) {
        issues.push(`${viewport.width}px browser load failed: ${error.message}`);
      }
    await context.close();
  }
  for (const message of evidence.consoleErrors) issues.push(`console: ${message}`);
  for (const failure of evidence.requestFailures) issues.push(`resource: ${failure.status || failure.error} ${failure.url}`);
  return { id: 'browser', ok: issues.length === 0, issues, evidence };
}

function commitHash() {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

async function checkOne(slug, browser) {
  const gates = [
    commandGate('tokens', ['scripts/validate.mjs', slug]),
    commandGate('compile-static', ['scripts/compile.mjs', slug, '--check']),
    registryDrift,
    ...staticGates(slug),
    await browserGate(slug, browser),
  ];
  const failed = gates.filter(gate => !gate.ok);
  const report = {
    schemaVersion: 1,
    slug,
    generatedAt: new Date().toISOString(),
    commit: commitHash(),
    tool: { name: 'layout-gallery-check', version: VERSION, node: process.version },
    ok: failed.length === 0,
    gates,
    summary: { passed: gates.length - failed.length, failed: failed.length, issues: gates.reduce((sum, gate) => sum + gate.issues.length, 0) },
  };
  const outputDir = path.join(ROOT, 'generated', slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'quality-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(`${report.ok ? 'PASS' : 'FAIL'} ${slug}: ${report.summary.passed}/${gates.length} gates, ${report.summary.issues} issue(s)`);
  return report;
}

const args = process.argv.slice(2);
const slugIndex = args.indexOf('--slug');
let slugs = [];
if (slugIndex >= 0 && args[slugIndex + 1]) slugs = [args[slugIndex + 1]];
else if (args.includes('--all')) slugs = fs.readdirSync(path.join(ROOT, 'templates'), { withFileTypes: true }).filter(entry => entry.isDirectory() && fs.existsSync(path.join(ROOT, 'templates', entry.name, 'template.html'))).map(entry => entry.name).sort();
else {
  console.error('Usage: node scripts/check.mjs --slug <slug> | --all');
  process.exit(1);
}

let browser = null;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: true });
} catch (error) {
  console.error(`Browser gate unavailable: ${error.message}`);
}

const reports = [];
try {
  const concurrency = args.includes('--all') ? 4 : 1;
  for (let index = 0; index < slugs.length; index += concurrency) {
    const batch = slugs.slice(index, index + concurrency);
    reports.push(...await Promise.all(batch.map(slug => checkOne(slug, browser))));
  }
} finally {
  if (browser) await browser.close();
}
const failed = reports.filter(report => !report.ok);
console.log(`Checked ${reports.length}; passed ${reports.length - failed.length}; failed ${failed.length}`);
process.exit(failed.length ? 1 : 0);

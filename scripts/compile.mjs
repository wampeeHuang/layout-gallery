#!/usr/bin/env node

/**
 * compile.mjs — tokens.json → :root CSS 编译器
 *
 * 职责:
 *   1. 读取 templates/{slug}/tokens.json
 *   2. 生成 :root CSS 块
 *   3. 扫描 template.html body CSS, 硬编码值阻断
 *   4. 写入 template.html (替换 :root 标记区)
 *
 * 用法:
 *   node scripts/compile.mjs <slug>            # 编译并写入（含 body CSS 硬编码门禁）
 *   node scripts/compile.mjs <slug> --dry-run  # 只输出 :root, 不写入
 *   node scripts/compile.mjs <slug> --check    # 只扫描 body CSS, 不编译
 *   node scripts/compile.mjs <slug> --root-only # 只重生成 :root，跳过 body 门禁（分阶段迁移用）
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateRoot } from './tokens-to-css.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Body CSS 硬编码扫描 ────────────────────────────────────────

const HARDCODED_COLOR_RE = /(?:#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
const HARDCODED_PX_RE = /(?<![-\w])(?:0|[1-9]\d*)(?:\.\d+)?px\b/g;
const VAR_RE = /var\(\s*(--[\w-]+)(\s*,\s*[^)]+)?\)/g;

function scanBodyCSS(html, knownTokens) {
  const tokenNames = new Set(knownTokens);
  const issues = [];

  // Only inspect CSS inside <style>. HTML content, scripts and the tokenized
  // :root source are not body CSS and must not create false positives.
  const styleRe = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRe.exec(html)) !== null) {
    const cssStart = styleMatch.index + styleMatch[0].indexOf(styleMatch[1]);
    let css = styleMatch[1];

    // Mask :root while preserving newlines, so reported source lines stay exact.
    const rootStart = css.indexOf(':root');
    if (rootStart >= 0) {
      let depth = 0;
      let rootEnd = -1;
      for (let i = css.indexOf('{', rootStart); i < css.length; i++) {
        if (css[i] === '{') depth++;
        if (css[i] === '}' && --depth === 0) { rootEnd = i + 1; break; }
      }
      if (rootEnd > rootStart) css = css.slice(0, rootStart) + css.slice(rootStart, rootEnd).replace(/[^\n]/g, ' ') + css.slice(rootEnd);
    }

    // Component-private variables are valid if they are declared in body CSS.
    for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) tokenNames.add(match[1]);

    const lines = css.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/\/\*.*?\*\//g, '');
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;
      const lineno = html.slice(0, cssStart).split('\n').length + i;

      let m;
      VAR_RE.lastIndex = 0;
      while ((m = VAR_RE.exec(line)) !== null) {
        if (!tokenNames.has(m[1])) {
          issues.push({ line: lineno, type: 'undefined-var', token: m[1], fix: `Define ${m[1]} in tokens.json/body CSS or fix the reference.` });
        }
        if (m[2]) {
          issues.push({ line: lineno, type: 'var-with-fallback', token: m[1], fallback: m[0], fix: `Remove the fallback from ${m[0]}; contract values must be explicit.` });
        }
      }

      if (/^\s*--[\w-]+\s*:/.test(line) || /:\s*/.test(line)) {
        HARDCODED_COLOR_RE.lastIndex = 0;
        while ((m = HARDCODED_COLOR_RE.exec(line)) !== null) issues.push({ line: lineno, type: 'hardcoded-color', value: m[0], fix: 'Move this visual color to tokens.json and reference it with var().' });
        HARDCODED_PX_RE.lastIndex = 0;
        while ((m = HARDCODED_PX_RE.exec(line)) !== null) issues.push({ line: lineno, type: 'hardcoded-px', value: m[0], fix: 'Use a spacing/type token or a relative unit.' });
        const fontMatch = line.match(/font-family\s*:\s*([^;]+)/i);
        if (fontMatch && !fontMatch[1].trim().startsWith('var(')) {
          issues.push({ line: lineno, type: 'hardcoded-font', value: fontMatch[1].trim(), fix: 'Use a font token from tokens.json.' });
        }
      }
    }
  }

  return issues;
}

// ── 模板 :root 替换 ─────────────────────────────────────────────

function replaceRoot(html, newRoot) {
  const start = html.indexOf(':root');
  if (start === -1) {
    throw new Error('No :root block found in template.html');
  }

  // Find opening brace (allow any whitespace between :root and {)
  const braceStart = html.indexOf('{', start);
  if (braceStart === -1) {
    throw new Error('No :root block found in template.html');
  }

  // Find matching closing brace
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error('Unclosed :root block in template.html');
  }

  return html.slice(0, start) + newRoot + html.slice(end);
}

// ── 主入口 ─────────────────────────────────────────────────────

function loadTokens(slug) {
  const tokensPath = resolve(ROOT, 'templates', slug, 'tokens.json');
  if (!existsSync(tokensPath)) {
    console.error(`ERROR: tokens.json not found: ${tokensPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(tokensPath, 'utf-8'));
  if (!raw.tokens || typeof raw.tokens !== 'object') {
    console.error('ERROR: tokens.json must have a "tokens" object');
    process.exit(1);
  }

  return raw;
}

function main() {
  const args = process.argv.slice(2);
  const slug = args[0];
  const mode = args[1] || '';

  if (!slug) {
    console.error('Usage: node scripts/compile.mjs <slug> [--dry-run|--check]');
    process.exit(1);
  }

  const data = loadTokens(slug);
  const tokens = data.tokens;

  // Flatten all token names for scanning
  const allTokenNames = new Set();
  for (const group of Object.values(tokens)) {
    if (Array.isArray(group)) {
      for (const t of group) {
        allTokenNames.add(t.name);
      }
    }
  }

  if (mode === '--check') {
    const htmlPath = resolve(ROOT, 'templates', slug, 'template.html');
    if (!existsSync(htmlPath)) {
      console.error(`ERROR: template.html not found: ${htmlPath}`);
      process.exit(1);
    }
    const html = readFileSync(htmlPath, 'utf-8');
    const issues = scanBodyCSS(html, allTokenNames);

    if (issues.length > 0) {
      console.error(`\n${issues.length} body CSS issue(s) found:\n`);
      for (const issue of issues) {
        console.error(`  Line ${issue.line}: [${issue.type}] ${issue.token || issue.value || issue.fallback}`);
        console.error(`    Fix: ${issue.fix}\n`);
      }
      process.exit(1);
    }

    console.log('OK: No body CSS issues found.');
    process.exit(0);
  }

  // Generate :root
  const rootCSS = generateRoot(tokens);

  if (mode === '--dry-run') {
    console.log(rootCSS);
    return;
  }

  // Compile: replace :root in template.html
  const htmlPath = resolve(ROOT, 'templates', slug, 'template.html');
  if (!existsSync(htmlPath)) {
    console.error(`ERROR: template.html not found: ${htmlPath}`);
    process.exit(1);
  }

  const html = readFileSync(htmlPath, 'utf-8');

  // Scan body CSS before writing (skipped in --root-only staged-migration mode)
  if (mode !== '--root-only') {
    const issues = scanBodyCSS(html, allTokenNames);
    if (issues.length > 0) {
      console.error(`\nBLOCKED: ${issues.length} body CSS issue(s). Fix before compiling.\n`);
      for (const issue of issues) {
        console.error(`  Line ${issue.line}: [${issue.type}] ${issue.token || issue.value || issue.fallback}`);
        console.error(`    Fix: ${issue.fix}\n`);
      }
      process.exit(1);
    }
  }

  // Replace and write
  const updated = replaceRoot(html, rootCSS);
  writeFileSync(htmlPath, updated, 'utf-8');
  console.log(`Compiled: ${slug} — ${allTokenNames.size} tokens → :root CSS`);
  console.log(`Written:  ${htmlPath}`);
}

main();

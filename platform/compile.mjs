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
 *   node platform/compile.mjs <slug>            # 编译并写入
 *   node platform/compile.mjs <slug> --dry-run  # 只输出 :root, 不写入
 *   node platform/compile.mjs <slug> --check    # 只扫描 body CSS, 不编译
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── DTCG $type → CSS 生成器 ────────────────────────────────────

function formatCubicBezier(arr) {
  return `cubic-bezier(${arr.join(',')})`;
}

function tokenToCSS(token) {
  const { name, $type, value } = token;
  let cssValue;

  switch ($type) {
    case 'color':
    case 'fontFamily':
    case 'dimension':
    case 'duration':
    case 'shadow':
    case 'raw':
      cssValue = value;
      break;
    case 'cubicBezier':
      cssValue = Array.isArray(value) ? formatCubicBezier(value) : value;
      break;
    default:
      throw new Error(`Unknown $type "${$type}" for token "${name}"`);
  }

  return `  ${name}: ${cssValue};`;
}

// ── :root 生成 ──────────────────────────────────────────────────

const SECTION_ORDER = [
  { key: 'color',      label: 'Color Roles' },
  { key: 'typography', label: 'Typography' },
  { key: 'dimension',  label: 'Dimensions — Radius, Spacing & Page Layout' },
  { key: 'shadow',     label: 'Shadow' },
  { key: 'easing',     label: 'Motion — Easing' },
  { key: 'duration',   label: 'Motion — Duration' },
];

function generateRoot(tokens) {
  const lines = [':root {'];

  for (const { key, label } of SECTION_ORDER) {
    const group = tokens[key];
    if (!group || group.length === 0) continue;

    lines.push('');
    lines.push(`  /* ── ${label} ── */`);

    for (const token of group) {
      lines.push(tokenToCSS(token));
    }
  }

  // Handle any extra token categories not in standard order
  for (const [key, group] of Object.entries(tokens)) {
    if (SECTION_ORDER.some(s => s.key === key)) continue;
    if (!Array.isArray(group) || group.length === 0) continue;

    lines.push('');
    lines.push(`  /* ── ${key} ── */`);

    for (const token of group) {
      lines.push(tokenToCSS(token));
    }
  }

  lines.push('}');
  return lines.join('\n');
}

// ── Body CSS 硬编码扫描 ────────────────────────────────────────

const HARDCODED_COLOR_RE = /(?<!var\(--[\w-]+\s*\)\s*)(?<![:;]\s*)(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
const HARDCODED_PX_RE = /\b\d+px\b/g;
const HARDCODED_FONT_RE = /font-family\s*:\s*(?!var\(--[^)]+\))(["'][^"']+["']|[^;]+)/gi;
const VAR_UNDEFINED_RE = /var\((--[\w-]+)\)/g;
const VAR_FALLBACK_RE = /var\((--[\w-]+)\s*,\s*[^)]+\)/g;

function scanBodyCSS(html, knownTokens) {
  const tokenNames = new Set(knownTokens);

  // Extract everything AFTER :root block (body CSS)
  const rootEnd = html.indexOf('}\n', html.indexOf(':root'));
  if (rootEnd === -1) return [];

  const bodyCSS = html.slice(rootEnd);
  const issues = [];

  // Scan line by line to report line numbers
  const lines = bodyCSS.split('\n');
  const rootLineCount = html.slice(0, rootEnd).split('\n').length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineno = rootLineCount + i + 1;

    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*')) continue;

    // Check var() references to unknown tokens
    let m;
    VAR_UNDEFINED_RE.lastIndex = 0;
    while ((m = VAR_UNDEFINED_RE.exec(line)) !== null) {
      if (!tokenNames.has(m[1])) {
        issues.push({
          line: lineno,
          type: 'undefined-var',
          token: m[1],
          fix: `Define --${m[1]} in tokens.json or fix typo in var() reference`,
        });
      }
    }

    // Check var() with fallback (shouldn't exist in generation architecture)
    VAR_FALLBACK_RE.lastIndex = 0;
    while ((m = VAR_FALLBACK_RE.exec(line)) !== null) {
      issues.push({
        line: lineno,
        type: 'var-with-fallback',
        token: m[1],
        fallback: m[0],
        fix: `Remove fallback value from var(${m[0]}). All values should come from tokens.json.`,
      });
    }
  }

  return issues;
}

// ── 模板 :root 替换 ─────────────────────────────────────────────

const ROOT_MARKER_START = ':root {';
const ROOT_MARKER_END = '\n}';

function replaceRoot(html, newRoot) {
  const start = html.indexOf(ROOT_MARKER_START);
  if (start === -1) {
    throw new Error('No :root block found in template.html');
  }

  // Find matching closing brace
  let depth = 0;
  let end = -1;
  for (let i = start; i < html.length; i++) {
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
    console.error('Usage: node platform/compile.mjs <slug> [--dry-run|--check]');
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
        console.error(`  Line ${issue.line}: [${issue.type}] ${issue.token || issue.fallback}`);
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

  // Scan body CSS before writing
  const issues = scanBodyCSS(html, allTokenNames);
  if (issues.length > 0) {
    console.error(`\nBLOCKED: ${issues.length} body CSS issue(s). Fix before compiling.\n`);
    for (const issue of issues) {
      console.error(`  Line ${issue.line}: [${issue.type}] ${issue.token || issue.fallback}`);
      console.error(`    Fix: ${issue.fix}\n`);
    }
    process.exit(1);
  }

  // Replace and write
  const updated = replaceRoot(html, rootCSS);
  writeFileSync(htmlPath, updated, 'utf-8');
  console.log(`Compiled: ${slug} — ${allTokenNames.size} tokens → :root CSS`);
  console.log(`Written:  ${htmlPath}`);
}

main();

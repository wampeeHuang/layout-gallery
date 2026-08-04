// sync-roots.js — tokens.json → :root 自动生成并同步到 template.html
// 一源双端：tokens.json 是唯一数据源，:root 从此派生，禁止手写
//
// Usage: node scripts/sync-roots.js [--check] [--preserve] [--dir templates/frontend-design/layout-gallery]
//   --check    只检查不写入
//   --preserve 检查旧 :root 中是否有新 :root 未覆盖的变量，有则 fail（防止模板特有变量丢失）

const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const templatesDir = path.join(projectDir, 'templates');

module.exports = { generateRoot };

// Known template-specific variable patterns — these may legitimately exist
// outside the standard contract and should not trigger --preserve failure.
const PRESERVE_PATTERNS = [
  /^--c-bg-dark/, /^--c-bg-dark-alt/, /^--c-bg-light/, /^--c-bg-light-alt/,
  /^--c-bg-orange/,
  /^--c-fg-3/, /^--c-fg-light/, /^--c-fg-light-2/, /^--c-fg-light-3/,
  /^--c-border-dark/, /^--c-border-light/,
  /^--c-accent-green/, /^--c-accent-amber/,
  /^--f-heading/, /^--f-body-serif/, /^--f-data/, /^--f-serif/, /^--f-annotation/,
  /^--sz-/, /^--pad-/, /^--gap-sm/, /^--gap-md/, /^--gap-lg/,
  /^--radius-/, /^--shadow-1/, /^--shadow-2/, /^--shadow-3/, /^--shadow-card/, /^--shadow-terminal/,
  /^--ease-slide/, /^--dur-slide/, /^--ease-enter/, /^--dur-enter/,
  /^--focus-ring/,
  /^--color-bg-warm/, /^--color-bg-code/, /^--color-text-muted/,
  /^--color-border-light/, /^--color-surface-warm/,
];

// ── :root generation ──────────────────────────────────────────

const CAT_LABELS = {
  color: 'Color', typography: 'Typography', spacing: 'Spacing',
  radius: 'Radius', shadow: 'Shadow', motion: 'Motion'
};

function generateRoot(tokensData) {
  const lines = [':root{'];
  for (const [cat, tokens] of Object.entries(tokensData.tokens)) {
    if (!tokens || tokens.length === 0) continue;
    const label = CAT_LABELS[cat] || cat;
    lines.push('  /* ' + label + ' */');

    // Group into compact lines: font stacks and single-token types on their own line,
    // others packed 2-4 per line
    if (cat === 'typography') {
      // Font stacks on their own line, size tokens packed
      const fonts = tokens.filter(t => t.name.includes('font'));
      const sizes = tokens.filter(t => !t.name.includes('font'));
      for (const t of fonts) {
        lines.push('  ' + t.name + ':' + t.value + ';');
      }
      if (sizes.length > 0) {
        lines.push('  ' + sizes.map(t => t.name + ':' + t.value).join('; ') + ';');
      }
    } else if (cat === 'motion') {
      // Each easing on its own line, durations packed
      const eases = tokens.filter(t => t.name.includes('ease'));
      const durations = tokens.filter(t => !t.name.includes('ease'));
      for (const t of eases) {
        lines.push('  ' + t.name + ':' + t.value + ';');
      }
      if (durations.length > 0) {
        lines.push('  ' + durations.map(t => t.name + ':' + t.value).join('; ') + ';');
      }
    } else {
      // Color / Spacing / Radius / Shadow: pack into chunks of 3-5
      const chunkSize = cat === 'color' ? 5 : cat === 'shadow' ? 2 : 4;
      for (let i = 0; i < tokens.length; i += chunkSize) {
        const chunk = tokens.slice(i, i + chunkSize);
        lines.push('  ' + chunk.map(t => t.name + ':' + t.value).join('; ') + ';');
      }
    }
    lines.push('');
  }
  // Global defaults (not tokenized, always appended)
  lines.push('  font-family:var(--font-body); color:var(--text); background:var(--bg);');
  lines.push('  font-size:var(--text-base); line-height:1.5;');
  lines.push('}');
  return lines.join('\n');
}

// ── extract CSS variable names from a :root string ──────────────

function extractVarNames(rootStr) {
  const names = new Set();
  const re = /(--[\w-]+)\s*:/g;
  let m;
  while ((m = re.exec(rootStr)) !== null) {
    names.add(m[1]);
  }
  return names;
}

function isKnownPreserve(name) {
  return PRESERVE_PATTERNS.some(p => p.test(name));
}

// ── sync logic ────────────────────────────────────────────────

function syncOne(dirPath, opts = {}) {
  const tokensPath = path.join(dirPath, 'tokens.json');
  const tmplPath = path.join(dirPath, 'template.html');

  if (!fs.existsSync(tokensPath)) return null;
  if (!fs.existsSync(tmplPath)) {
    return { dir: dirPath, error: 'template.html not found' };
  }

  const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const newRoot = generateRoot(tokensData);

  let html = fs.readFileSync(tmplPath, 'utf-8');
  const rootRegex = /:root\s*\{[^}]*\}/s;
  const match = html.match(rootRegex);

  if (!match) {
    const styleMatch = html.match(/<style>/);
    if (styleMatch) {
      html = html.replace(/<style>/, '<style>\n' + newRoot);
    } else {
      return { dir: dirPath, error: 'no <style> or :root found in template.html' };
    }
  } else {
    // --preserve: check for template-specific vars that would be lost
    if (opts.preserve && match) {
      const oldNames = extractVarNames(match[0]);
      const newNames = extractVarNames(newRoot);
      const lost = [];
      for (const name of oldNames) {
        if (!newNames.has(name) && !isKnownPreserve(name)) {
          lost.push(name);
        }
      }
      if (lost.length > 0) {
        return { dir: dirPath, error: '--preserve: 旧 :root 中以下变量不在新 :root 中，将被覆盖：\n    ' + lost.join(', ') + '\n    如需保留请加入 tokens.json，或确认覆盖请用 --force' };
      }
    }
    html = html.replace(rootRegex, newRoot);
  }

  const oldRoot = match ? match[0] : '(none)';
  if (oldRoot === newRoot) {
    return { dir: dirPath, changed: false };
  }

  fs.writeFileSync(tmplPath, html, 'utf-8');
  return { dir: dirPath, changed: true, oldRoot, newRoot };
}

// ── find all template dirs with tokens.json ────────────────────

function findTemplateDirs() {
  const dirs = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      if (fs.existsSync(path.join(full, 'tokens.json'))) {
        dirs.push(full);
      }
      walk(full);
    }
  }
  walk(templatesDir);
  return dirs;
}

// ── main (CLI only) ───────────────────────────────────────────

if (require.main !== module) return;

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const preserve = args.includes('--preserve');
const force = args.includes('--force');
const targetDir = args.find(a => a.startsWith('--dir='));

let dirs;
if (targetDir) {
  const d = path.resolve(projectDir, targetDir.replace('--dir=', ''));
  if (!fs.existsSync(path.join(d, 'tokens.json'))) {
    console.error('No tokens.json in ' + d);
    process.exit(1);
  }
  dirs = [d];
} else {
  dirs = findTemplateDirs();
}

if (dirs.length === 0) {
  console.log('No template directories with tokens.json found.');
  process.exit(0);
}

let synced = 0;
let unchanged = 0;
let errors = 0;

for (const d of dirs) {
  const result = syncOne(d, { preserve: preserve && !force });
  if (!result) continue;
  if (result.error) {
    console.error('ERROR: ' + path.relative(projectDir, d) + ' — ' + result.error);
    errors++;
  } else if (result.changed) {
    console.log('SYNCED: ' + path.relative(projectDir, d));
    synced++;
  } else {
    unchanged++;
  }
}

const summary = [synced + ' synced', unchanged + ' unchanged'];
if (errors > 0) summary.push(errors + ' errors');
console.log('\nDone. ' + summary.join(', ') + '.');

if (checkOnly && synced > 0) {
  console.log('\n--check mode: run without --check to apply changes.');
  process.exit(1);
}

process.exit(errors > 0 ? 1 : 0);

// sync-roots.js — tokens.json → :root 自动生成并同步到 template.html
// 一源双端：tokens.json 是唯一数据源，:root 从此派生，禁止手写
//
// Usage: node scripts/sync-roots.js [--check] [--dir templates/frontend-design/layout-gallery]

const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const templatesDir = path.join(projectDir, 'templates');

module.exports = { generateRoot };

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
  lines.push('  font-family:var(--font-sans); color:var(--text); background:var(--bg);');
  lines.push('  font-size:var(--text-base); line-height:1.5;');
  lines.push('}');
  return lines.join('\n');
}

// ── sync logic ────────────────────────────────────────────────

function syncOne(dirPath) {
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
    // No :root block — inject after <style> or at start of <style>
    const styleMatch = html.match(/<style>/);
    if (styleMatch) {
      html = html.replace(/<style>/, '<style>\n' + newRoot);
    } else {
      return { dir: dirPath, error: 'no <style> or :root found in template.html' };
    }
  } else {
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
  const result = syncOne(d);
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

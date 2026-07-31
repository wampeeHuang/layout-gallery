// extract-tokens.js — batch extract tokens.json from template.html :root
//
// Reads template.html → parses :root CSS block → categorizes variables
// → infers color roles → builds brandKit → writes tokens.json
//
// Usage:
//   node scripts/extract-tokens.js brutalist-paper    # single template
//   node scripts/extract-tokens.js --all              # all templates missing tokens.json
//   node scripts/extract-tokens.js --all --force       # overwrite existing tokens.json

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');

// ── CSS variable extraction ─────────────────────────────────────

function parseRootBlock(html) {
  // Find :root { ... } — handle nested braces
  const start = html.search(/:root\s*\{/);
  if (start === -1) return '';
  let depth = 0;
  let inBlock = false;
  let block = '';
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') { depth++; if (!inBlock) { inBlock = true; } else { block += ch; } }
    else if (ch === '}') { depth--; if (depth === 0) break; block += ch; }
    else if (inBlock && depth > 0) { block += ch; }
  }
  return block;
}

function extractVars(html) {
  const block = parseRootBlock(html);
  if (!block) return [];

  // Strip CSS comments
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, ' ');

  const vars = [];
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = regex.exec(clean))) {
    const name = m[1].trim();
    const value = m[2].trim();
    if (name && value && !name.endsWith('-rgb')) {
      vars.push({ name, value });
    }
  }

  // Deduplicate by name (first occurrence wins for same root block)
  const seen = new Set();
  return vars.filter(v => {
    if (seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
}

// ── Color analysis ───────────────────────────────────────────────

function isColorValue(val) {
  return /^#|^rgb|^hsl|^color-mix|^transparent|^currentColor|^var\(--/.test(val.trim());
}

function parseHex(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length < 6) return null;
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

function parseRGBA(val) {
  const m = val.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) return null;
  return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
}

function toRGB(val) {
  if (val.startsWith('#')) return parseHex(val);
  return parseRGBA(val);
}

function isGrayscale(rgb) {
  if (!rgb) return true;
  const avg = (rgb.r + rgb.g + rgb.b) / 3;
  return Math.abs(rgb.r - avg) < 15 && Math.abs(rgb.g - avg) < 15 && Math.abs(rgb.b - avg) < 15;
}

function luminance(rgb) {
  if (!rgb) return 0.5;
  const rs = rgb.r / 255, gs = rgb.g / 255, bs = rgb.b / 255;
  const rl = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gl = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bl = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function saturation(rgb) {
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  if (max === 0) return 0;
  return (max - min) / max;
}

// ── Variable categorization ──────────────────────────────────────

const CATEGORY_RULES = [
  // Typography (before color — text-xs/text-lg are sizes, not color names)
  { cat: 'typography', match: /^--(font|type|display|body|heading|weight|letter|line-height|text-\d|text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl|text-5xl|text-6xl|text-2xs|x-height|cap-height|font-size|font-weight|sz-|sans|serif|mono|sans-zh|serif-zh)/ },
  // Spacing
  { cat: 'spacing', match: /^--(space|spacing|gap|gutter|page-w|page-pad|pad|margin|padding|l-|sp-|section-gap|content-pad|container)/ },
  // Radius
  { cat: 'radius', match: /^--(radius|round)/ },
  // Shadow
  { cat: 'shadow', match: /^--(shadow|elevation|depth)/ },
  // Motion
  { cat: 'motion', match: /^--(ease|duration|transition|animate|motion|delay|timing)/ },
  // Color: known semantic names
  { cat: 'color', match: /^--(accent|primary|secondary|bg|background|text|fg|ink|border|line|surface|card|paper|overlay|danger|error|success|warning|info|neutral|gray|grey|slate|steel|iron|rust|oxide|chalk|concrete|bolt|shadow-solid|shadow-block)/ },
  // Color: generic color names (look like colors, are hex/rgb)
  { cat: 'color', match: /^--(red|blue|green|yellow|pink|purple|orange|cyan|lime|teal|mint|sage|blush|lemon|coral|amber|navy|olive|plum|gold|silver|bronze|copper|tan|cream|ivory|peach|mocha|sand|clay|brick|berry|grape|sky|ocean|forest|rose|ruby|jade|opal|topaz|onyx|ebony|pearl|flint|charcoal|smoke|ash|soot|bone|wheat|seafoam|cobalt|indigo|violet|magenta|maroon|scarlet|umber|ochre|sienna|taupe|beige|buff|linen|ecru|khaki|mustard|mahogany)/ },
];

function categorizeVar(v) {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(v.name)) return rule.cat;
  }
  // Default: if value looks like a color, it's color
  if (isColorValue(v.value)) return 'color';
  // If value has px/rem/em, it's spacing
  if (/^\d/.test(v.value) && /px|rem|em|%|vw|vh|ch|vmin|vmax/.test(v.value)) return 'spacing';
  return 'unknown';
}

function categorize(vars) {
  const result = { color: [], typography: [], spacing: [], radius: [], shadow: [], motion: [], unknown: [] };
  for (const v of vars) {
    const cat = categorizeVar(v);
    if (result[cat]) result[cat].push(v);
  }
  return result;
}

// ── Color role inference ─────────────────────────────────────────

function inferColorRoles(colorVars) {
  const candidates = colorVars.filter(v => isColorValue(v.value) && !v.value.startsWith('var('));

  function findByNames(names) {
    for (const n of names) {
      const found = candidates.find(c => c.name === n || c.name.endsWith('-' + n));
      if (found) return found.value;
    }
    return null;
  }

  // Try named patterns first
  const primary = findByNames(['accent', 'primary', '--accent', '--primary']);
  const secondary = findByNames(['accent-alt', 'secondary', 'accentAlt']);
  const background = findByNames(['bg', 'background', 'paper', '--bg', '--paper']);
  const text = findByNames(['text', 'fg', 'ink', '--text', '--ink']);
  const textSecondary = findByNames(['text-secondary', 'text-soft', 'textSecondary', 'text-muted', 'ink-soft', '--text-soft', '--text-muted', '--ink-soft']);
  const border = findByNames(['border', 'line', 'bolt', '--border', '--line']);
  const surface = findByNames(['surface', 'bg-card', 'card-bg', 'paper-deep', 'paper-2', 'bgCard', '--surface', '--bg-card']);

  // If we have at least primary + background, use them
  if (primary && background) {
    return {
      primary,
      secondary: secondary || lighten(primary, 60),
      background,
      text: text || '#111',
      textSecondary: textSecondary || '#888',
      border: border || (text ? hexToRgba(text, 0.15) : '#ddd'),
      surface: surface || background
    };
  }

  // Fallback: infer from the color values themselves
  const rgbVars = candidates.map(c => ({ ...c, rgb: toRGB(c.value) })).filter(c => c.rgb);

  // Background = lightest color
  const byLightness = [...rgbVars].sort((a, b) => luminance(b.rgb) - luminance(a.rgb));
  const lightest = byLightness[0];
  // Text = darkest color
  const darkest = byLightness[byLightness.length - 1];

  // Accent = most saturated non-grayscale color
  const colorful = rgbVars.filter(c => !isGrayscale(c.rgb)).sort((a, b) => saturation(b.rgb) - saturation(a.rgb));
  const accent = colorful[0];

  // Secondary = second most saturated, or lightened accent
  const secondaryColor = colorful[1] || accent;

  return {
    primary: accent ? accent.value : (colorful[0] ? colorful[0].value : '#333'),
    secondary: secondaryColor ? secondaryColor.value : '#888',
    background: lightest ? lightest.value : '#fff',
    text: darkest ? darkest.value : '#111',
    textSecondary: isGrayscale(darkest?.rgb) && byLightness.length > 3 ? byLightness[Math.floor(byLightness.length * 0.6)]?.value || '#888' : '#888',
    border: isGrayscale(darkest?.rgb) && darkest?.rgb ? hexToRgba(darkest.value, 0.18) : '#ddd',
    surface: lightest ? lightest.value : '#fff'
  };
}

// ── Helpers ──────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return 'rgba(0,0,0,' + alpha + ')';
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.substring(0, 6);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function lighten(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function buildDescription(v) {
  // Generate a human-readable description
  const name = v.name;
  if (/accent|primary/i.test(name)) return '主强调色';
  if (/secondary|accent-alt/i.test(name)) return '次级强调色';
  if (/^--bg$|background|paper/i.test(name) && !/card|surface|deep/i.test(name)) return '页面背景色';
  if (/bg-card|card-bg|paper-deep|surface/i.test(name)) return '卡片/面板背景';
  if (/^--text$|^--fg$|^--ink$/i.test(name)) return '主文字色';
  if (/text-soft|text-secondary|text-muted|ink-soft/i.test(name)) return '次级文字色';
  if (/border|line/i.test(name)) return '边框色';
  if (/font|display|body|sans|serif|mono/i.test(name)) return '字体';
  if (/text-\d|sz-|font-size/i.test(name)) return '字号';
  if (/radius/i.test(name)) return '圆角';
  if (/shadow/i.test(name)) return '阴影';
  if (/ease|duration|transition/i.test(name)) return '动效';
  if (/space|gap|gutter|spacing/i.test(name)) return '间距';
  if (/page-w|page-pad/i.test(name)) return '页面布局';
  return '';
}

function inferRole(v) {
  const name = v.name;
  if (/accent|primary/i.test(name)) return 'accent';
  if (/secondary|accent-alt/i.test(name)) return 'accent-alt';
  if (/^--bg$|background|paper/i.test(name) && !/card|surface|deep/i.test(name)) return 'surface-bg';
  if (/bg-card|card-bg|paper-deep|surface/i.test(name)) return 'surface-card';
  if (/^--text$|^--fg$|^--ink$/i.test(name)) return 'text-primary';
  if (/text-soft|text-secondary|text-muted|ink-soft/i.test(name)) return 'text-secondary';
  if (/border|line/i.test(name)) return 'border';
  if (/font|display|body/i.test(name)) return 'font';
  if (/radius/i.test(name)) return 'radius';
  if (/shadow/i.test(name)) return 'shadow';
  if (/ease|duration|transition/i.test(name)) return 'motion';
  if (/space|gap|gutter/i.test(name)) return 'spacing';
  return '';
}

// ── Tokens.json builder ──────────────────────────────────────────

function buildTokensJSON(entry, categorized, colorRoles) {
  const slug = entry.slug;
  const name = entry.name || slug;

  return {
    slug,
    version: 1,
    source: '提取自 template.html :root — 一源双端标准化',
    categories: ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'],
    tokens: {
      color: categorized.color.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      })),
      typography: categorized.typography.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      })),
      spacing: categorized.spacing.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      })),
      radius: categorized.radius.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      })),
      shadow: categorized.shadow.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      })),
      motion: categorized.motion.map(v => ({
        name: v.name,
        value: v.value,
        role: inferRole(v),
        description: buildDescription(v)
      }))
    },
    brandKit: {
      typeScale: categorized.typography
        .filter(v => /text-\d|sz-|font-size/.test(v.name))
        .map(v => ({ name: v.name, value: v.value })),
      spacingScale: categorized.spacing
        .filter(v => /space|spacing|sp-|gap/.test(v.name))
        .map(v => ({ name: v.name, value: v.value })),
      colorRoles
    }
  };
}

// ── Main ─────────────────────────────────────────────────────────

function extractTokens(entry) {
  const tmplPath = path.join(PROJECT_DIR, entry.template_path);
  if (!fs.existsSync(tmplPath)) {
    throw new Error('template.html not found: ' + tmplPath);
  }

  const html = fs.readFileSync(tmplPath, 'utf-8');
  const vars = extractVars(html);
  if (vars.length === 0) {
    throw new Error('no :root CSS variables found in ' + tmplPath);
  }

  const categorized = categorize(vars);
  const colorRoles = inferColorRoles(categorized.color);

  // Move stray variables from unknown to proper category
  for (const v of [...categorized.unknown]) {
    // Font stacks: comma-separated values with font names
    if (/sans|serif|mono|system-ui|Helvetica|Arial|Inter|Georgia|Times/i.test(v.value) && v.value.includes(',')) {
      categorized.typography.push(v); continue;
    }
    if (/px|rem|em|%/.test(v.value) && !isColorValue(v.value)) {
      if (/radius|round/.test(v.name)) categorized.radius.push(v);
      else if (/shadow|elevation/.test(v.name)) categorized.shadow.push(v);
      else if (/ease|duration|transition|delay/.test(v.name)) categorized.motion.push(v);
      else if (/font|display|body|weight|letter|sans|serif|mono/.test(v.name)) categorized.typography.push(v);
      else if (/space|gap|gutter|page|pad|margin|section|container|wrap/.test(v.name)) categorized.spacing.push(v);
      else categorized.spacing.push(v);
    }
  }

  return buildTokensJSON(entry, categorized, colorRoles);
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const verbose = args.includes('--verbose');

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const entries = registry.filter(e => e.status !== 'placeholder' && e.template_path);

  if (args.includes('--all')) {
    let ok = 0, skip = 0, fail = 0;

    for (const entry of entries) {
      const tmplDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
      const tokensPath = path.join(tmplDir, 'tokens.json');

      if (fs.existsSync(tokensPath) && !force) {
        if (verbose) console.log('SKIP ' + entry.slug + ' (tokens.json exists)');
        skip++;
        continue;
      }

      try {
        const tokensData = extractTokens(entry);
        fs.mkdirSync(tmplDir, { recursive: true });
        fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2), 'utf-8');
        console.log('OK   ' + entry.slug + ' (' + tokensData.tokens.color.length + ' colors, ' + tokensData.tokens.typography.length + ' fonts)');
        ok++;
      } catch (err) {
        console.error('FAIL ' + entry.slug + ': ' + err.message);
        fail++;
      }
    }

    console.log('\nDone: ' + ok + ' ok, ' + skip + ' skipped, ' + fail + ' failed | Total: ' + entries.length);
    if (ok > 0) {
      console.log('Next: node scripts/template-renderer.js --all');
    }
    return;
  }

  // Single template
  const slug = args[0];
  if (!slug) {
    console.log('Usage: node scripts/extract-tokens.js <slug> [--all] [--force]');
    console.log('  node scripts/extract-tokens.js brutalist-paper');
    console.log('  node scripts/extract-tokens.js --all');
    console.log('  node scripts/extract-tokens.js --all --force');
    process.exit(1);
  }

  const entry = entries.find(e => e.slug === slug);
  if (!entry) {
    console.error('Template not found: ' + slug);
    process.exit(1);
  }

  try {
    const tokensData = extractTokens(entry);
    const tmplDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
    const tokensPath = path.join(tmplDir, 'tokens.json');
    fs.mkdirSync(tmplDir, { recursive: true });
    fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2), 'utf-8');
    console.log('OK ' + slug + ' → ' + tokensPath);
    console.log('  Colors: ' + tokensData.tokens.color.length);
    console.log('  Typography: ' + tokensData.tokens.typography.length);
    console.log('  Spacing: ' + tokensData.tokens.spacing.length);
    console.log('  Color Roles: primary=' + tokensData.brandKit.colorRoles.primary + ' bg=' + tokensData.brandKit.colorRoles.background);
  } catch (err) {
    console.error('FAIL ' + slug + ': ' + err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractTokens, extractVars, categorize, inferColorRoles };

// _migrate-editorial.js — Restore old template.html, standardize CSS vars, strip Google Fonts
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const ARCHIVE_DIR = path.join(PROJECT_DIR, '_runtime', 'extract', 'templates', 'beautiful-html-templates');
const TEMPLATES_DIR = path.join(PROJECT_DIR, 'templates', 'beautiful-html-templates');

// ── Variable name mapping (old → standard) ────────────────────────
const VAR_MAP = {
  // Group 1: c-* convention (anthropic, broadside, vellum, warm-terminal)
  '--c-bg': '--bg',
  '--c-bg-alt': '--bg-alt',
  '--c-fg': '--text',
  '--c-fg-2': '--text-soft',
  '--c-accent': '--accent',
  '--c-emphasis': '--accent-alt',
  '--c-border': '--line',
  '--f-display': '--font-display',
  '--f-body': '--font-body',
  '--f-mono': '--font-mono',
  // Group 2: color-* convention (warm-paper-course and similar)
  '--color-bg': '--bg',
  '--color-text': '--text',
  '--color-text-secondary': '--text-soft',
  '--color-border': '--line',
  '--color-surface': '--surface',
  '--color-accent': '--accent',
  '--color-accent-hover': '--accent-hover',
  // Legacy
  '--display': '--font-display',
  '--body': '--font-body',
  '--mono': '--font-mono',
  '--paper': '--bg',
  '--ink': '--text',
  '--ink-soft': '--text-soft',
  '--page-w': '--page-wmax',
  // Playful category (capsule, coral, creative-mode, daisy-days, scatterbrain, etc.)
  '--fg': '--text',
  '--black': '--text',
  '--gray': '--text-soft',
  '--light-gray': '--line',
  '--text-dark': '--text',
  '--text-muted': '--text-soft',
  '--ink-2': '--text-soft',
  '--ink-light': '--text-soft',
  '--rule': '--line',
  '--outline': '--line',
  '--shadow-solid': '--shadow-md',
  // Note: --border intentionally NOT mapped (can be shorthand 2px solid #000 vs color #ccc)
  // New: cartesian naming convention
  '--bg-primary': '--bg',
  '--bg-secondary': '--surface',
  '--text-primary': '--text',
  '--text-secondary': '--text-soft',
  // New: blue-professional naming
  '--primary': '--accent',
  '--card-bg': '--surface',
  // New: retro-windows
  '--bg-gray': '--bg',
};

// Variable names to preserve from old :root (template-specific, not in standard contract)
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
  // warm-paper-course patterns
  /^--color-bg-warm/, /^--color-bg-code/, /^--color-text-muted/,
  /^--color-border-light/, /^--color-surface-warm/,
  /^--color-accent-light/, /^--color-accent-muted/,
  /^--color-success/, /^--color-success-light/, /^--color-error/, /^--color-error-light/,
  /^--color-info/, /^--color-info-light/,
  /^--space-/, /^--text-\w/, /^--leading-/, /^--nav-height/,
  /^--content-width/, /^--content-width-wide/,
  // Playful category patterns (palette colors and template-specific vars)
  /^--coral/, /^--cream/, /^--lime/, /^--lavender/, /^--sky/, /^--violet/,
  /^--yellow/, /^--peach/, /^--mint/, /^--green/, /^--pink/, /^--orange/,
  /^--blue/, /^--red/, /^--turquoise/, /^--soft-pink/, /^--butter/,
  /^--purple/, /^--light$/,
  /^--c-bg-light/, /^--c-bg-light-alt/,
  // Frontend-design material palettes
  /^--steel/, /^--iron/, /^--rust/, /^--concrete/, /^--oxide/, /^--slate/, /^--chalk/, /^--bolt/,
  /^--sumi/, /^--akari/, /^--koke/, /^--sakura/, /^--ai/, /^--kin/, /^--kasumi/, /^--ma/,
  /^--ebony/, /^--gold/, /^--champagne/, /^--marble/, /^--onyx/,
  /^--soil/, /^--leaf/, /^--stone/, /^--moss/, /^--bark/, /^--lichen/, /^--clay/,
  /^--void/, /^--neon-/, /^--grid-color/, /^--chrome/,
  // Paper/ink palette variants (preserve after main --paper/--ink are mapped)
  /^--paper-2$/, /^--paper-d/, /^--paper-dk/, /^--paper-vd/,
  /^--ink-dp/,
  /^--grid$/, /^--hair/, /^--mute/,
  /^--line-soft$/,
  // Neo-brutalist / raw-grid / block-frame
  /^--yellow/, /^--lime/, /^--cyan/, /^--pink-deep/,
  /^--darkgray/, /^--offwhite/,
  /^--shadow-lg/,
  // Blue-professional
  /^--accent-light/, /^--accent-medium/, /^--text-light/,
  // Lecture-clean (Windows 95 theme)
  /^--win-/, /^--font-sans/,
  // retro-windows
  /^--btn-/, /^--green-retro/, /^--red-retro/, /^--yellow-retro/, /^--cyan-retro/,
  /^--blue-navy/, /^--blue-bright/, /^--blue-light/,
  /^--bg-dark/, /^--bg-light/,
  // retro-zine
  /^--green-light/,
  // 8-bit-orbit
  /^--deep-navy/, /^--dark-void/, /^--soft-lavender/, /^--pixel-size/,
  // misc
  /^--radius-sm/,
];

// ── Helpers ────────────────────────────────────────────────────────

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

function hexToRgbParts(hex) {
  if (!hex || !hex.startsWith('#')) return '255,255,255';
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return r + ', ' + g + ', ' + b;
}

function darken(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
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

function isLightColor(hex) {
  if (!hex || !hex.startsWith('#')) return true;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
}

function flattenTokens(tokensData) {
  const vars = {};
  if (!tokensData || !tokensData.tokens) return vars;
  for (const tokens of Object.values(tokensData.tokens)) {
    if (!Array.isArray(tokens)) continue;
    for (const t of tokens) vars[t.name] = t.value;
  }
  return vars;
}

// ── System font stack for Google Fonts fallback ────────────────────

const GOOGLE_FONT_REPLACEMENTS = {
  '"Source Serif 4"': 'Georgia',
  '"Outfit"': 'system-ui',
  '"DM Sans"': 'Inter',
  '"Geist"': 'system-ui',
  '"Geist Mono"': '"JetBrains Mono"',
  '"IBM Plex Mono"': '"JetBrains Mono"',
  '"Barlow"': 'system-ui',
  '"Cormorant Garamond"': 'Georgia',
  '"Courier Prime"': '"Courier New"',
  '"Petrona"': 'Georgia',
  '"Lora"': 'Georgia',
  // Playful category
  '"Bodoni Moda"': 'Georgia',
  '"Space Grotesk"': 'system-ui',
  '"Fredoka One"': 'system-ui',
  '"Quicksand"': 'system-ui',
  // Remaining templates (beautiful-html-templates + design-systems)
  '"Playfair Display"': 'Georgia',
  '"Jost"': 'Inter',
  '"Lora"': 'Georgia',
  '"DM Sans"': 'Inter',
  '"Bricolage Grotesque"': 'system-ui',
  '"IBM Plex Mono"': '"JetBrains Mono"',
  '"DM Mono"': '"SF Mono"',
  '"Space Mono"': 'Consolas',
  '"Chakra Petch"': 'system-ui',
  '"Tektur"': 'system-ui',
  '"Newsreader"': 'Georgia',
  '"Hanken Grotesk"': 'Inter',
  '"Syne"': 'system-ui',
  '"Lexend Mega"': 'system-ui',
  '"Fraunces"': 'Georgia',
  '"Bebas Neue"': 'system-ui',
  '"Caveat"': 'cursive',
  '"Inter Tight"': 'Inter',
};

function replaceGoogleFontName(val) {
  let result = val;
  for (const [googleFont, fallback] of Object.entries(GOOGLE_FONT_REPLACEMENTS)) {
    result = result.replace(new RegExp(googleFont.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fallback);
  }
  return result;
}

function isShorthandValue(value) {
  // Returns true if value looks like a CSS shorthand (border, shadow, etc.), not a plain color
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  // Border shorthands: <width> <style> <color>
  if (/\d+(?:px|em|rem|%)\s+(?:solid|dashed|dotted|double|groove|ridge|inset|outset)/i.test(v)) return true;
  // Multi-part shadows or offsets
  if (/^\d+px\s+\d+px/.test(v) && !/^#[0-9a-fA-F]{3,8}$/.test(v) && !/^rgba?\(/.test(v)) return true;
  return false;
}

function fixTokensColorNames(tokensData) {
  // Rename color tokens from old naming (--color-bg) to standard (--bg)
  const colorTokens = tokensData.tokens.color || [];
  let changed = false;
  for (const t of colorTokens) {
    const newName = VAR_MAP[t.name];
    if (newName && !isShorthandValue(t.value)) {
      t.name = newName;
      t.description = 'Standard: ' + (t.description || '');
      changed = true;
    }
  }
  // Remove duplicates after rename
  if (changed) {
    const seen = new Set();
    tokensData.tokens.color = colorTokens.filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  }
  return changed;
}

function fixTokensVarRefs(tokensData) {
  // Replace var(--old-name) references inside token values (e.g. shadow tokens)
  let changed = false;
  for (const cat of Object.keys(tokensData.tokens)) {
    for (const t of (tokensData.tokens[cat] || [])) {
      if (typeof t.value !== 'string') continue;
      for (const [oldName, newName] of Object.entries(VAR_MAP)) {
        const re = new RegExp('var\\(' + oldName.replace(/-/g, '\\-') + '(?=[,)])', 'g');
        const newVal = t.value.replace(re, 'var(' + newName);
        if (newVal !== t.value) { t.value = newVal; changed = true; }
      }
    }
  }
  return changed;
}

function ensureStandardTokens(tokensData) {
  // Derive standard contract token values from brandKit + fallbacks (mirrors buildStandardRoot logic)
  // Adds missing standard tokens to tokens.json so they survive validation
  const cr = (tokensData.brandKit && tokensData.brandKit.colorRoles) ? tokensData.brandKit.colorRoles : {};
  const vars = flattenTokens(tokensData);
  function find(keys) { for (const k of keys) { if (vars[k]) return vars[k]; } return ''; }

  // Actual token values take precedence; brandKit is fallback, not override
  const primary = find(['--accent', '--c-accent']) || cr.primary || '#333';
  const secondary = find(['--accent-alt', '--c-emphasis']) || cr.secondary || lighten(primary, 80);
  const background = find(['--bg', '--c-bg']) || cr.background || '#fff';
  const text = find(['--text', '--c-fg']) || cr.text || '#111';
  const textSecondary = find(['--text-soft', '--c-fg-2']) || cr.textSecondary || '#888';
  const border = find(['--line', '--c-border']) || cr.border || '#ddd';
  const surface = find(['--surface', '--c-bg-alt']) || cr.surface || '#fff';
  const fontDisplay = vars['--font-display'] || vars['--f-display'] || 'Georgia, serif';
  const fontBody = vars['--font-body'] || vars['--f-body'] || 'Inter, sans-serif';
  const fontMono = vars['--font-mono'] || vars['--f-mono'] || '"SF Mono", Consolas, monospace';

  // Ensure token categories exist
  ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'].forEach(cat => {
    if (!tokensData.tokens[cat]) tokensData.tokens[cat] = [];
  });

  function upsert(cat, name, value, description) {
    const arr = tokensData.tokens[cat];
    const existing = arr.find(t => t.name === name);
    if (existing) { existing.value = value; return false; }
    arr.push({ name, value, role: '', description: description || '' });
    return true;
  }

  upsert('color', '--accent', primary, '主强调色');
  upsert('color', '--accent-hover', lighten(primary, 30), '强调色悬停态');
  upsert('color', '--accent-alt', secondary, '辅强调色');
  upsert('color', '--bg', background, '页面底色');
  upsert('color', '--surface', surface, '卡片/面板背景');
  upsert('color', '--text', text, '主文字色');
  upsert('color', '--text-soft', textSecondary, '次级文字色');
  upsert('color', '--line', border, '边框色');

  upsert('typography', '--font-display', replaceGoogleFontName(fontDisplay), '标题字体栈');
  upsert('typography', '--font-body', replaceGoogleFontName(fontBody), '正文字体栈');
  upsert('typography', '--font-mono', replaceGoogleFontName(fontMono), '等宽字体栈');

  upsert('spacing', '--page-wmax', vars['--page-wmax'] || vars['--page-w'] || '1200px', '内容最大宽度');
  upsert('spacing', '--page-pad', '32px', '页面水平内边距');
  upsert('spacing', '--gap', '24px', '元素/网格间距');
  upsert('spacing', '--gutter', vars['--gutter'] || '24px', '列间距/留白基准');

  upsert('radius', '--radius', vars['--radius'] || '8px', '圆角基准值');

  upsert('shadow', '--shadow-sm', vars['--shadow-sm'] || '0 1px 3px rgba(0,0,0,0.06)', '轻阴影');
  upsert('shadow', '--shadow-md', vars['--shadow-md'] || vars['--shadow'] || '0 8px 30px rgba(0,0,0,0.1)', '中阴影');

  upsert('motion', '--ease-default', vars['--ease-default'] || '0.18s ease', '标准缓动曲线');
  upsert('motion', '--duration-base', '150ms', '基础过渡时长');

  return true;
}

function fixTokensFonts(tokensData) {
  // Replace Google Font names in typography tokens with system equivalents
  const typo = tokensData.tokens.typography || [];
  let changed = false;
  for (const t of typo) {
    const newVal = replaceGoogleFontName(t.value);
    if (newVal !== t.value) {
      t.value = newVal;
      changed = true;
    }
  }
  return changed;
}

// ── :root builder (mirrors template-renderer.js buildTokenCSS) ─────

function buildStandardRoot(tokensData) {
  const cr = (tokensData.brandKit && tokensData.brandKit.colorRoles) ? tokensData.brandKit.colorRoles : {};
  const vars = flattenTokens(tokensData);

  function find(keys) { for (const k of keys) { if (vars[k]) return vars[k]; } return ''; }

  // Actual token values take precedence; brandKit is fallback, not override
  const primary = find(['--accent', '--c-accent']) || cr.primary || '#333';
  const secondary = find(['--accent-alt', '--c-emphasis']) || cr.secondary || lighten(primary, 80);
  const background = find(['--bg', '--c-bg']) || cr.background || '#fff';
  const text = find(['--text', '--c-fg']) || cr.text || '#111';
  const textSecondary = find(['--text-soft', '--c-fg-2']) || cr.textSecondary || '#888';
  const border = find(['--line', '--c-border']) || cr.border || '#ddd';
  const surface = find(['--surface', '--c-bg-alt']) || cr.surface || '#fff';

  const accentHover = lighten(primary, 30);
  const accentDark = vars['--accent-dark'] || darken(primary, 20);
  const bgSoft = hexToRgba(background, 0.75);
  const lineSoft = vars['--line-soft'] || hexToRgba(border, 0.5);
  const shadowSolid = vars['--shadow-solid'] || ('4px 4px 0 ' + primary);
  const shadowBlock = vars['--shadow-block'] || ('10px 10px 0 ' + primary);
  const easeDefault = vars['--ease-default'] || '0.18s ease';
  const easeHover = vars['--ease-hover'] || '0.2s ease';
  const textRgb = hexToRgbParts(text);
  const bgRgb = hexToRgbParts(background);
  const accentRgb = hexToRgbParts(primary);
  const bgAlt = vars['--bg-alt'] || surface;

  // Typography
  const fontDisplay = vars['--font-display'] || vars['--f-display'] || 'Georgia, serif';
  const fontBody = vars['--font-body'] || vars['--f-body'] || 'Inter, sans-serif';
  const fontMono = vars['--font-mono'] || vars['--f-mono'] || '"SF Mono", Consolas, monospace';

  // Shadow, spacing, radius
  const shadowSm = vars['--shadow-sm'] || '0 1px 3px rgba(0,0,0,0.06)';
  const shadowMd = vars['--shadow-md'] || '0 8px 30px rgba(0,0,0,0.1)';
  const radius = vars['--radius'] || '8px';
  const pageW = vars['--page-wmax'] || vars['--page-w'] || '1200px';
  const gutter = vars['--gutter'] || '24px';

  const lines = [
    '  --accent: ' + primary + ';',
    '  --accent-hover: ' + accentHover + ';',
    '  --accent-dark: ' + accentDark + ';',
    '  --accent-alt: ' + secondary + ';',
    '  --bg: ' + background + ';',
    '  --bg-soft: ' + bgSoft + ';',
    '  --bg-alt: ' + bgAlt + ';',
    '  --text: ' + text + ';',
    '  --text-soft: ' + textSecondary + ';',
    '  --line: ' + border + ';',
    '  --line-soft: ' + lineSoft + ';',
    '  --surface: ' + surface + ';',
    '  --text-rgb: ' + textRgb + ';',
    '  --bg-rgb: ' + bgRgb + ';',
    '  --accent-rgb: ' + accentRgb + ';',
    '  --font-display: ' + fontDisplay + ';',
    '  --font-body: ' + fontBody + ';',
    '  --font-mono: ' + fontMono + ';',
    '  --radius: ' + radius + ';',
    '  --shadow-sm: ' + shadowSm + ';',
    '  --shadow-md: ' + shadowMd + ';',
    '  --shadow-solid: ' + shadowSolid + ';',
    '  --shadow-block: ' + shadowBlock + ';',
    '  --ease-default: ' + easeDefault + ';',
    '  --ease-hover: ' + easeHover + ';',
    '  --duration-base: 150ms;',
    '  --page-wmax: ' + pageW + ';',
    '  --page-pad: 32px;',
    '  --gap: 24px;',
    '  --gutter: ' + gutter + ';',
  ];

  // Pass through ALL tokens from tokens.json (color/typography/spacing/radius/shadow/motion)
  const declared = new Set(lines.map(l => l.match(/(--[\w-]+)/)[1]));
  ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'].forEach(cat => {
    (tokensData.tokens[cat] || []).forEach(t => {
      if (!declared.has(t.name)) {
        lines.push('  ' + t.name + ': ' + t.value + ';');
        declared.add(t.name);
      }
    });
  });

  return lines;
}

// ── Extract template-specific vars from old :root ──────────────────

function extractPreservedVars(oldRoot, standardLines) {
  // Names already covered by standard :root (from buildStandardRoot)
  const standardNames = new Set();
  standardLines.forEach(l => {
    const m = l.match(/(--[\w-]+)/);
    if (m) standardNames.add(m[1]);
  });

  // All standard contract names (will be handled by standard :root)
  const standardContract = new Set([
    '--accent', '--accent-hover', '--accent-dark', '--accent-alt',
    '--bg', '--bg-soft', '--bg-alt', '--text', '--text-soft',
    '--line', '--line-soft', '--surface', '--text-rgb', '--bg-rgb', '--accent-rgb',
    '--font-display', '--font-body', '--font-mono',
    '--radius', '--shadow-sm', '--shadow-md', '--shadow-solid', '--shadow-block',
    '--ease-default', '--ease-hover', '--duration-base',
    '--page-wmax', '--page-pad', '--gap', '--gutter',
  ]);

  // Non-standard naming conventions that are being replaced via VAR_MAP
  const mappedConventions = [
    /^--c-bg/, /^--c-fg/, /^--c-accent/, /^--c-border/, /^--c-emphasis/,
    /^--f-display$/, /^--f-body$/, /^--f-mono$/,
    /^--color-bg$/, /^--color-text/, /^--color-border/, /^--color-surface/, /^--color-accent/,
  ];

  const lines = [];
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(oldRoot)) !== null) {
    const name = m[1];
    const value = m[2].trim();

    // Skip if mapped to standard name (unless value is a shorthand — preserve those)
    if (VAR_MAP[name] && !isShorthandValue(value)) continue;
    // Skip if already in standard :root
    if (standardNames.has(name)) continue;
    // Skip if in standard contract
    if (standardContract.has(name)) continue;
    // Skip if matches non-standard conventions being replaced
    if (mappedConventions.some(p => p.test(name))) continue;

    // Keep everything else (template-specific palette, layout, etc.)
    lines.push('  ' + name + ': ' + replaceGoogleFontName(value) + ';');
  }
  return lines;
}

// ── Strip Google Fonts ─────────────────────────────────────────────

function stripGoogleFonts(html) {
  // Remove <link> tags pointing to fonts.googleapis.com
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*\/?>/gi, '');
  // Remove @import statements for Google Fonts
  html = html.replace(/@import\s+url\(['"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;/gi, '');
  // Collapse blank lines left over from removal
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  return html;
}

// ── Replace var() references ───────────────────────────────────────

function replaceVarRefs(html, oldRoot) {
  let result = html;
  for (const [oldName, newName] of Object.entries(VAR_MAP)) {
    // Skip if old value is a CSS shorthand (e.g. --border: 3px solid #000)
    if (oldRoot) {
      const valRe = new RegExp(oldName.replace(/-/g, '\\-') + '\\s*:\\s*([^;]+);');
      const oldValMatch = oldRoot.match(valRe);
      if (oldValMatch && isShorthandValue(oldValMatch[1].trim())) continue;
    }
    // Replace var(--old-name) → var(--new-name)
    const re = new RegExp('var\\(' + oldName.replace(/-/g, '\\-') + '(?=[,)])', 'g');
    result = result.replace(re, 'var(' + newName);
  }
  return result;
}

// ── Main migration ─────────────────────────────────────────────────

function migrateTemplate(slug) {
  // Look up template path from registry
  const registry = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'data', 'registry.json'), 'utf-8'));
  const entry = registry.find(e => e.slug === slug);
  if (!entry) { console.log(slug + ': SKIP — not in registry'); return false; }

  const templateDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  const skillName = path.basename(path.dirname(templateDir)); // beautiful-html-templates, codebase-to-course, etc.
  const tokensPath = path.join(templateDir, 'tokens.json');
  const outPath = path.join(templateDir, 'template.html');

  // Archive path mirrors template structure
  const archiveTemplatePath = path.join(PROJECT_DIR, '_runtime', 'extract', 'templates', skillName, slug, 'template.html');

  if (!fs.existsSync(archiveTemplatePath)) {
    console.log(slug + ': SKIP — no archived template');
    return false;
  }
  if (!fs.existsSync(tokensPath)) {
    console.log(slug + ': SKIP — no tokens.json');
    return false;
  }

  const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  // Fix color token names (--color-bg → --bg)
  const tokensColorsFixed = fixTokensColorNames(tokensData);
  // Fix var() references inside token values (e.g. shadow tokens)
  const tokensVarRefsFixed = fixTokensVarRefs(tokensData);
  // Fix Google Font names in tokens.json (sync source of truth)
  const tokensFontsFixed = fixTokensFonts(tokensData);
  // Ensure standard contract tokens exist in tokens.json
  const tokensEnsured = ensureStandardTokens(tokensData);
  if (tokensColorsFixed || tokensVarRefsFixed || tokensFontsFixed || tokensEnsured) {
    fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2) + '\n', 'utf-8');
  }

  let html = fs.readFileSync(archiveTemplatePath, 'utf-8');

  // 1. Build new standardized :root block
  const standardLines = buildStandardRoot(tokensData);

  // 2. Extract template-specific vars from old :root
  const oldRootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  const oldRoot = oldRootMatch ? oldRootMatch[1] : '';
  const preservedLines = extractPreservedVars(oldRoot, standardLines);

  // 3. Replace old :root with new merged :root
  const allLines = standardLines.concat(preservedLines);
  const newRoot = ':root {\n' + allLines.join('\n') + '\n}';

  if (oldRootMatch) {
    html = html.replace(/:root\s*\{[^}]*\}/s, newRoot);
  } else {
    // No :root found — inject after first <style> tag
    html = html.replace(/(<style[^>]*>)/, '$1\n' + newRoot);
  }

  // 4. Replace var() references (pass oldRoot to skip shorthand-valued vars)
  html = replaceVarRefs(html, oldRoot);

  // 5. Strip Google Fonts
  html = stripGoogleFonts(html);

  // 6. Font names already fixed via tokens.json sync and extractPreservedVars

  // 7. Fix lang attribute
  html = html.replace(/lang="en"/g, 'lang="zh-CN"');
  html = html.replace(/<title>[^<]*<\/title>/, '<title>编辑画册模板</title>');

  fs.writeFileSync(outPath, html, 'utf-8');
  return true;
}

// ── Run ────────────────────────────────────────────────────────────

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.log('Usage: node scripts/_migrate-editorial.js <slug1> <slug2> ...');
  process.exit(1);
}

slugs.forEach(slug => {
  const ok = migrateTemplate(slug);
  console.log(slug + ': ' + (ok ? 'MIGRATED' : 'SKIP'));
});

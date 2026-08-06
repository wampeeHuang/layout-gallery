import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(PROJECT_DIR, 'templates');
const CONTRACT_PATH = path.join(PROJECT_DIR, 'meta', 'token-contract.json');

const NEW_TEMPLATES = [
  'block-frame', 'blue-professional', 'bold-poster', 'broadside', 'capsule',
  'cartesian', 'cobalt-grid', 'coral', 'creative-mode', 'daisy-days',
  'editorial-forest', 'editorial-tri-tone', 'emerald-editorial', 'grove',
  'long-table', 'mat', 'monochrome', 'neo-grid-bold', 'peoples-platform',
  'pin-and-paper', 'playful', 'raw-grid', 'retro-windows', 'retro-zine',
  'sakura-chroma', 'scatterbrain', 'signal', 'stencil-tablet', 'vellum'
];

// 27 required standard variables
const REQUIRED_STANDARD = [
  '--color-primary', '--color-secondary', '--color-surface', '--color-on-surface',
  '--color-on-surface-variant', '--color-outline', '--color-surface-container-low',
  '--text-rgb', '--bg-rgb', '--accent-rgb',
  '--font-display', '--font-body', '--font-mono',
  '--radius-base', '--radius-sm', '--radius-pill',
  '--elevation-sm', '--elevation-md',
  '--ease-standard', '--duration-base',
  '--space-page-wmax', '--space-page-pad', '--space-gap', '--space-gutter'
];

function hexToRgb(hex) {
  if (!hex || !hex.match(/^#[0-9a-fA-F]{3,8}$/)) return null;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if (h.length === 8) h = h.slice(0, 6); // drop alpha
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return `${r},${g},${b}`;
}

function extractRootVars(html) {
  const m = html.match(/:root\s*\{([^}]*)\}/s);
  if (!m) return {};
  const vars = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(m[1])) !== null) {
    vars['--' + match[1]] = match[2].trim();
  }
  return vars;
}

function findBestMatch(nativeVars, patterns) {
  for (const p of patterns) {
    for (const [name, value] of Object.entries(nativeVars)) {
      if (name.toLowerCase().includes(p)) return { name, value };
    }
  }
  return null;
}

function findColorByRole(nativeVars) {
  // Find the primary/accent color (most saturated or explicitly named)
  const accent = findBestMatch(nativeVars, ['primary', 'accent', 'brand', 'highlight', 'emphasis']);
  if (accent) return accent;

  // Find the darkest non-black for on-surface
  const darkest = findBestMatch(nativeVars, ['ink', 'text', 'foreground', 'on-surface', 'dark', 'black', 'near-black']);
  // Find the lightest for surface
  const lightest = findBestMatch(nativeVars, ['paper', 'surface', 'bg', 'background', 'white', 'offwhite', 'cream', 'canvas']);

  return { name: darkest?.name, value: darkest?.value };
}

function standardizeTemplate(slug) {
  const dir = path.join(TEMPLATES_DIR, slug);
  const htmlPath = path.join(dir, 'template.html');
  const brandPath = path.join(dir, 'brand.json');
  const layoutPath = path.join(dir, 'layout.json');

  if (!fs.existsSync(htmlPath)) return null;

  let html = fs.readFileSync(htmlPath, 'utf-8');
  const nativeVars = extractRootVars(html);
  const brand = JSON.parse(fs.readFileSync(brandPath, 'utf-8'));
  const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

  const standards = {};
  const exemptions = []; // native var names that don't match standard

  // ── Color mapping ────────────────────────────────────────────
  // Primary (accent)
  const primary = findBestMatch(nativeVars, ['primary', 'accent', 'brand', 'highlight', 'emphasis', 'neon', 'pop', 'hot', 'electric', '--red', '--blue', '--green', '--purple', '--teal', '--orange', '--pink', '--yellow']);
  const secondary = findBestMatch(nativeVars, ['secondary', 'muted', 'grey', 'gray', 'neutral', 'subdued']);
  const surface = findBestMatch(nativeVars, ['surface', 'paper', 'bg', 'background', 'canvas', 'cream', 'offwhite', 'white', 'light']);
  const onSurface = findBestMatch(nativeVars, ['on-surface', 'ink', 'text', 'foreground', 'dark', 'black', 'near-black', 'charcoal']);
  const onSurfaceVariant = findBestMatch(nativeVars, ['variant', 'secondary', 'grey', 'gray', 'muted', 'subdued', 'dim', 'soft']);
  const outline = findBestMatch(nativeVars, ['outline', 'border', 'rule', 'line', 'stroke', 'hairline', 'grid']);
  const containerLow = findBestMatch(nativeVars, ['container', 'card', 'elevated', 'raised', 'grey-1', 'gray-1', 'tint', 'highlight', 'alt']);

  // Assign standard colors
  standards['--color-primary'] = primary?.value || '#333333';
  standards['--color-secondary'] = secondary?.value || onSurfaceVariant?.value || '#666666';
  standards['--color-surface'] = surface?.value || '#FFFFFF';
  standards['--color-on-surface'] = onSurface?.value || '#0A0A0A';
  standards['--color-on-surface-variant'] = onSurfaceVariant?.value || (secondary?.value) || '#666666';
  standards['--color-outline'] = outline?.value || 'rgba(10,10,10,0.15)';
  standards['--color-surface-container-low'] = containerLow?.value || surface?.value || '#F5F5F5';

  // RGB versions for WebGL etc.
  const surfaceHex = standards['--color-surface'];
  const onSurfaceHex = standards['--color-on-surface'];
  const primaryHex = standards['--color-primary'];

  standards['--bg-rgb'] = hexToRgb(surfaceHex) ? hexToRgb(surfaceHex) : '255,255,255';
  standards['--text-rgb'] = hexToRgb(onSurfaceHex) ? hexToRgb(onSurfaceHex) : '10,10,10';
  standards['--accent-rgb'] = hexToRgb(primaryHex) ? hexToRgb(primaryHex) : '51,51,51';

  // ── Typography mapping ────────────────────────────────────────
  const display = findBestMatch(nativeVars, ['display', 'heading', 'title', 'serif']);
  const body = findBestMatch(nativeVars, ['body', 'text', 'sans', 'ui']);
  const mono = findBestMatch(nativeVars, ['mono', 'code', 'console']);

  standards['--font-display'] = display?.value || body?.value || 'Inter, system-ui, sans-serif';
  standards['--font-body'] = body?.value || display?.value || 'Inter, system-ui, sans-serif';
  standards['--font-mono'] = mono?.value || 'ui-monospace, SF Mono, Consolas, monospace';

  // ── Radius ────────────────────────────────────────────────────
  const radius = findBestMatch(nativeVars, ['radius', 'round']);
  standards['--radius-base'] = radius?.value || '4px';
  standards['--radius-sm'] = findBestMatch(nativeVars, ['radius-sm', 'radius-small'])?.value || '2px';
  standards['--radius-pill'] = findBestMatch(nativeVars, ['pill', 'round', 'full'])?.value || '999px';

  // ── Elevation ────────────────────────────────────────────────
  const shadowSm = findBestMatch(nativeVars, ['shadow-sm', 'elevation-sm', 'shadow-small']);
  const shadowMd = findBestMatch(nativeVars, ['shadow-md', 'elevation-md', 'shadow', 'elevation']);
  standards['--elevation-sm'] = shadowSm?.value || '0 1px 3px rgba(0,0,0,0.06)';
  standards['--elevation-md'] = shadowMd?.value || '0 8px 30px rgba(0,0,0,0.1)';

  // ── Motion ───────────────────────────────────────────────────
  const ease = findBestMatch(nativeVars, ['ease', 'timing', 'bezier', 'cubic']);
  const duration = findBestMatch(nativeVars, ['duration', 'speed', 'transition-time']);
  standards['--ease-standard'] = ease?.value || '0.18s ease';
  standards['--duration-base'] = duration?.value || '150ms';

  // ── Spacing ──────────────────────────────────────────────────
  const maxW = findBestMatch(nativeVars, ['wmax', 'max-width', 'container', 'page-w', 'max-w']);
  const pad = findBestMatch(nativeVars, ['pad', 'padding', 'page-pad']);
  const gap = findBestMatch(nativeVars, ['gap', 'spacing']);
  const gutter = findBestMatch(nativeVars, ['gutter', 'col-gap']);

  standards['--space-page-wmax'] = maxW?.value || '1200px';
  standards['--space-page-pad'] = pad?.value || '32px';
  standards['--space-gap'] = gap?.value || '24px';
  standards['--space-gutter'] = gutter?.value || gap?.value || '24px';

  // ── Inject standard vars into :root ──────────────────────────
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  if (rootMatch) {
    let rootBlock = rootMatch[1];

    // Build new standard var lines (only add if not already present)
    const existingNames = new Set(Object.keys(nativeVars));
    const newLines = [];
    for (const [name, value] of Object.entries(standards)) {
      if (!existingNames.has(name)) {
        newLines.push(`  ${name}: ${value};`);
      }
    }

    if (newLines.length > 0) {
      // Insert standard vars at the top of :root (after the opening brace)
      const insertion = '\n  /* ── Standard Roles (auto-injected) ── */\n' + newLines.join('\n') + '\n';
      rootBlock = insertion + rootBlock;
      html = html.replace(rootMatch[1], rootBlock);
    }
  }

  // ── Remove Google Fonts ────────────────────────────────────
  // Remove <link> tags
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*\/?>\s*\n?/gi, '');
  // Remove @import statements
  html = html.replace(/@import\s+url\(['"]?https?:\/\/fonts\.googleapis\.com[^)]*\)\s*;?\s*\n?/gi, '');
  // Remove inline font-face blocks referencing google fonts
  html = html.replace(/\/\*.*?google.*?fonts.*?\*\/\s*@import[^;]*;\s*\n?/gi, '');
  // Remove <link> preconnect/preload for fonts.googleapis / fonts.gstatic
  html = html.replace(/<link[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*\/?>\s*\n?/gi, '');

  fs.writeFileSync(htmlPath, html, 'utf-8');

  // ── Update brand.json with standard colorRoles ───────────────
  brand.colorRoles = {
    primary: standards['--color-primary'],
    secondary: standards['--color-secondary'],
    background: standards['--color-surface'],
    surface: standards['--color-surface-container-low'],
    text: standards['--color-on-surface'],
    textSecondary: standards['--color-on-surface-variant'],
    border: standards['--color-outline']
  };

  // ── Add standard tokens to brand.json tokens ────────────────
  const addToken = (arr, name, value, role, desc) => {
    if (!arr.find(t => t.name === name)) {
      arr.push({ name, value, role, description: desc });
    }
  };

  addToken(brand.tokens.color, '--color-primary', standards['--color-primary'], 'accent', '主强调色');
  addToken(brand.tokens.color, '--color-secondary', standards['--color-secondary'], 'accent-alt', '辅强调色');
  addToken(brand.tokens.color, '--color-surface', standards['--color-surface'], 'surface-bg', '默认表面');
  addToken(brand.tokens.color, '--color-on-surface', standards['--color-on-surface'], 'text-primary', '主文字色');
  addToken(brand.tokens.color, '--color-on-surface-variant', standards['--color-on-surface-variant'], 'text-secondary', '次级文字');
  addToken(brand.tokens.color, '--color-outline', standards['--color-outline'], 'border-default', '主边框');
  addToken(brand.tokens.color, '--color-surface-container-low', standards['--color-surface-container-low'], 'surface-card', '卡片容器');

  addToken(brand.tokens.typography, '--font-display', standards['--font-display'], 'display-font', '标题字体');
  addToken(brand.tokens.typography, '--font-body', standards['--font-body'], 'body-font', '正文字体');
  addToken(brand.tokens.typography, '--font-mono', standards['--font-mono'], 'mono-font', '等宽字体');

  addToken(brand.tokens.radius, '--radius-base', standards['--radius-base'], 'radius', '基础圆角');
  addToken(brand.tokens.radius, '--radius-sm', standards['--radius-sm'], 'radius', '小圆角');
  addToken(brand.tokens.radius, '--radius-pill', standards['--radius-pill'], 'radius', '药丸圆角');

  addToken(brand.tokens.shadow, '--elevation-sm', standards['--elevation-sm'], 'shadow', '低阴影');
  addToken(brand.tokens.shadow, '--elevation-md', standards['--elevation-md'], 'shadow', '中阴影');

  addToken(brand.tokens.motion, '--ease-standard', standards['--ease-standard'], 'easing', '标准缓动');
  addToken(brand.tokens.motion, '--duration-base', standards['--duration-base'], 'duration', '基础时长');

  fs.writeFileSync(brandPath, JSON.stringify(brand, null, 2), 'utf-8');

  // ── Update layout.json with standard spacing tokens ──────────
  addToken(layout.tokens.spacing, '--space-page-wmax', standards['--space-page-wmax'], 'content-max-width', '内容最大宽度');
  addToken(layout.tokens.spacing, '--space-page-pad', standards['--space-page-pad'], 'page-padding', '页面内边距');
  addToken(layout.tokens.spacing, '--space-gap', standards['--space-gap'], 'element-gap', '元素间距');
  addToken(layout.tokens.spacing, '--space-gutter', standards['--space-gutter'], 'column-gutter', '列间距');

  // Ensure typeScale and spacingScale exist
  if (!layout.typeScale || layout.typeScale.length === 0) {
    layout.typeScale = [{ name: '--text-base', value: '16px', usage: '默认正文字号' }];
  }
  if (!layout.spacingScale || layout.spacingScale.length === 0) {
    layout.spacingScale = [
      { name: '--sp-pad-x', value: standards['--space-page-pad'] },
      { name: '--sp-gap', value: standards['--space-gap'] }
    ];
  }

  fs.writeFileSync(layoutPath, JSON.stringify(layout, null, 2), 'utf-8');

  // ── Collect native names for exemptions ──────────────────────
  for (const name of Object.keys(nativeVars)) {
    if (!REQUIRED_STANDARD.includes(name)) {
      exemptions.push(name);
    }
  }

  return { slug, standards, exemptions, nativeCount: Object.keys(nativeVars).length };
}

// ── Main ───────────────────────────────────────────────────────

console.log(`Standardizing ${NEW_TEMPLATES.length} templates...\n`);

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf-8'));
if (!contract.templateSpecific) contract.templateSpecific = {};

let totalStandardVars = 0;
let totalExemptions = 0;

for (const slug of NEW_TEMPLATES) {
  process.stdout.write(`${slug}... `);
  try {
    const result = standardizeTemplate(slug);
    if (result) {
      totalStandardVars += Object.keys(result.standards).length;
      totalExemptions += result.exemptions.length;

      // Register template-specific exemptions (broad match: almost any native var not in standard list)
      const isColor = (n) => n.match(/color|primary|secondary|surface|bg\b|paper|canvas|ink\b|text\b|foreground|border|outline|rule|line\b|stroke|shadow|elevation|accent|brand|cream|white|black|dark|light|grey|gray|neutral|neon|glow|muted|tint|tone|highlight|pastel|bright|deep|warm|cool|soft|rich|pale|vivid|sun|sky|sea|leaf|rose|gold|rust/);
      const isType = (n) => n.match(/font|type|display|body|mono|sans|serif/);
      const isRad = (n) => n.match(/radius|round/);
      const isShadow = (n) => n.match(/shadow|elevation/);
      const isMotion = (n) => n.match(/ease|duration|motion|transition|timing|bezier/);
      const isSpacing = (n) => n.match(/space|spacing|gap|gutter|pad|margin|page-w|container/);
      const isSize = (n) => n.match(/text-\d|font-size|fs-|sz-|scale/);

      const allExempt = result.exemptions;
      const categorized = new Set();

      contract.templateSpecific[slug] = {
        brand: {
          color: allExempt.filter(n => { if (isColor(n)) { categorized.add(n); return true; } return false; }),
          typography: allExempt.filter(n => { if (isType(n)) { categorized.add(n); return true; } return false; }),
          radius: allExempt.filter(n => { if (isRad(n)) { categorized.add(n); return true; } return false; }),
          shadow: allExempt.filter(n => { if (isShadow(n)) { categorized.add(n); return true; } return false; }),
          motion: allExempt.filter(n => { if (isMotion(n)) { categorized.add(n); return true; } return false; }),
        },
        layout: {
          spacing: allExempt.filter(n => { if (isSpacing(n)) { categorized.add(n); return true; } return false; }),
          typography: allExempt.filter(n => { if (isSize(n)) { categorized.add(n); return true; } return false; }),
        }
      };

      // Catch-all: anything uncategorized goes to brand/other
      const uncategorized = allExempt.filter(n => !categorized.has(n));
      if (uncategorized.length > 0) {
        contract.templateSpecific[slug].brand.other = uncategorized;
      }

      // Clean empty categories
      for (const [layer, groups] of Object.entries(contract.templateSpecific[slug])) {
        for (const [cat, names] of Object.entries(groups)) {
          if (names.length === 0) delete groups[cat];
        }
      }

      console.log(`OK (${Object.keys(result.standards).length} std, ${result.exemptions.length} exempt, ${result.nativeCount} native)`);
    } else {
      console.log('SKIP');
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
  }
}

fs.writeFileSync(CONTRACT_PATH, JSON.stringify(contract, null, 2), 'utf-8');

console.log(`\nDone. ${totalStandardVars} standard vars injected, ${totalExemptions} native exemptions registered.`);
console.log('contract.json updated with templateSpecific entries.');

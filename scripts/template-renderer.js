// template-renderer.js — tokens.json → template.html
//
// Pipeline:
//   1. Read tokens.json from template dir
//   2. Match skeleton by template_type from registry
//   3. Map colorRoles/typography/spacing → CSS :root variables
//   4. Inject content placeholders
//   5. Output template.html
//
// Usage:
//   node scripts/template-renderer.js <template-slug>
//   node scripts/template-renderer.js brutalist-paper
//   node scripts/template-renderer.js --all   (render all templates with tokens.json)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const SKELETONS_DIR = path.join(PROJECT_DIR, 'templates', 'skeletons');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');

// ── Skeleton matching ──────────────────────────────────────────────

const SKELETON_MAP = {
  'product-listing': 'product-listing.html',
  'single-page': 'editorial-single-page.html',
  'slide-deck': 'editorial-single-page.html',
  'report': 'editorial-single-page.html',
  'default': 'product-listing.html'
};

function matchSkeleton(entry) {
  const type = entry.template_type || 'default';
  const file = SKELETON_MAP[type] || SKELETON_MAP['default'];
  const skeletonPath = path.join(SKELETONS_DIR, file);
  if (!fs.existsSync(skeletonPath)) {
    throw new Error('Skeleton not found: ' + skeletonPath + ' (template_type=' + type + ')');
  }
  return skeletonPath;
}

// ── Token extraction ───────────────────────────────────────────────

function extractColorRoles(tokensData) {
  const bk = tokensData.brandKit || {};
  const cr = bk.colorRoles || {};

  // Try both brandKit.colorRoles and direct token lookup
  const vars = flattenTokens(tokensData);

  function find(keys) { for (const k of keys) { if (vars[k]) return vars[k]; } return ''; }

  const primary = cr.primary || find(['--accent', '--primary', '--dtcg-semantic-color-action-primary', '--color-primary']) || '#333';
  const secondary = cr.secondary || find(['--accent-alt', '--secondary', '--dtcg-semantic-color-action-secondary', '--color-secondary']) || lighten(primary, 80);

  return {
    primary: primary,
    secondary: secondary,
    background: cr.background || find(['--bg', '--background', '--dtcg-semantic-color-surface-default', '--color-bg']) || '#fff',
    text: cr.text || find(['--text', '--dtcg-semantic-color-text-body', '--color-text']) || '#111',
    textSecondary: cr.textSecondary || find(['--text-secondary', '--text-soft', '--dtcg-primitive-color-neutral-n400']) || '#888',
    border: cr.border || find(['--border', '--line', '--dtcg-primitive-color-neutral-n500']) || '#ddd',
    surface: cr.surface || find(['--bg-card', '--surface', '--card-bg', '--dtcg-primitive-color-neutral-n200']) || '#fff'
  };
}

function extractTypography(tokensData) {
  const vars = flattenTokens(tokensData);
  const bk = tokensData.brandKit || {};

  const display = findFont(vars, ['--display', '--font-display', '--display-font', '--font-sans', '--dtcg-primitive-fontFamily-f0']);
  const body = findFont(vars, ['--body', '--font-body', '--body-font', '--font-sans', '--dtcg-semantic-typography-body-fontFamily']);

  return {
    display: display || 'Georgia, "Times New Roman", serif',
    body: body || 'Inter, system-ui, -apple-system, sans-serif'
  };
}

function findFont(vars, keys) {
  for (const k of keys) {
    if (vars[k]) {
      var v = vars[k];
      // Already a font stack with commas
      if (v.includes(',')) return v;
      // Bare font name — wrap in quotes for CSS
      return '"' + v + '", system-ui, sans-serif';
    }
  }
  return '';
}

function extractRadius(tokensData) {
  const vars = flattenTokens(tokensData);
  return vars['--radius']
    || vars['--radius-lg']
    || vars['--dtcg-semantic-radius-control']
    || vars['--dtcg-primitive-radius-r1']
    || '8px';
}

function extractShadow(tokensData) {
  const vars = flattenTokens(tokensData);
  return vars['--shadow-md']
    || vars['--shadow-sm']
    || vars['--shadow']
    || vars['--dtcg-semantic-shadow-elevated']
    || vars['--dtcg-primitive-shadow-sh0']
    || '0px 4px 15px 0px rgba(0,0,0,0.1)';
}

function extractPageWidth(tokensData) {
  const vars = flattenTokens(tokensData);
  return vars['--page-w'] || '1200px';
}

function extractGutter(tokensData) {
  const vars = flattenTokens(tokensData);
  return vars['--gutter'] || '24px';
}

// ── Helpers ────────────────────────────────────────────────────────

function flattenTokens(tokensData) {
  const vars = {};
  if (!tokensData || !tokensData.tokens) return vars;
  for (const tokens of Object.values(tokensData.tokens)) {
    if (!Array.isArray(tokens)) continue;
    for (const t of tokens) {
      vars[t.name] = t.value;
    }
  }
  return vars;
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return 'rgba(0,0,0,' + alpha + ')';
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) { h = h.substring(0, 6); }
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

function darken(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = Math.max(0, parseInt(h.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(h.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(h.substring(4, 6), 16) - amount);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Editorial content builder ────────────────────────────────────────

function buildEditorialContent(entry) {
  const name = entry.name || 'Template';
  const tagline = entry.tagline || 'A statement that demands attention.';

  return {
    PAGE_TITLE: name + ' · Template Gallery',
    TEMPLATE_NAME: name.split('·')[0].trim(),
    LOGO_INITIAL: name.charAt(0).toUpperCase(),
    MASTHEAD_LEFT: 'PUBLICATION · 2026',
    MASTHEAD_RIGHT: 'PUBLIC STATEMENT',
    HERO_HEADLINE: 'Your Big<br>Headline<br>Goes Here',
    HERO_COPY: tagline,
    CTA_PRIMARY: 'Take Action',
    CTA_SECONDARY: 'Read More',
    HERO_NOTE: 'A supplementary note, disclaimer, or citation. Rendered with a warm amber left-border accent.',
    SECTION1_TITLE: 'Section<br>Heading',
    SECTION1_SUBTITLE: 'Section subtitle explaining the evidence, argument, or angle that follows.',
    CARD1_TITLE: 'Card Title One',
    CARD1_DESC: 'Card body text. Hover inverts to dark background with light text.',
    CARD2_TITLE: 'Card Title Two',
    CARD2_DESC: 'Second point. The grid uses borders — no rounded corners, no box-shadows.',
    CARD3_TITLE: 'Card Title Three',
    CARD3_DESC: 'Third argument. These cards work for presenting evidence or documenting incidents.',
    CARD4_TITLE: 'Card Title Four',
    CARD4_DESC: 'Fourth entry. Cards can also link out to references or source links.',
    QUOTE_TEXT: '"A pull quote that dominates the page. Big serif, tight leading, full-width impact."',
    PANEL1_EYEBROW: 'Context',
    PANEL1_TITLE: 'Background',
    PANEL1_DESC: 'Background information or context for the argument.',
    PANEL2_EYEBROW: 'Action Items',
    PANEL2_TITLE: 'What To Do',
    PANEL2_ITEM1: 'First concrete action item',
    PANEL2_ITEM2: 'Second action item with detail',
    PANEL2_ITEM3: 'Third point — keep actionable',
    PANEL2_ITEM4: 'Fourth item if needed',
    TIMELINE_TITLE: 'Documented<br>Timeline',
    TIMELINE_SUBTITLE: 'A chronological record of events, incidents, or milestones.',
    RECORD1_DATE: '2026-07-15', RECORD1_TAG: 'Category', RECORD1_TITLE: 'Event or milestone headline', RECORD1_DESC: 'Description of what happened and why it matters.',
    RECORD2_DATE: '2026-07-01', RECORD2_TAG: 'Category', RECORD2_TITLE: 'Another recorded event', RECORD2_DESC: 'Second entry in the chronology.',
    RECORD3_DATE: '2026-06-15', RECORD3_TAG: 'Category', RECORD3_TITLE: 'Earlier milestone', RECORD3_DESC: 'Third record in the timeline.',
    MANIFESTO_EYEBROW: 'Manifesto',
    MANIFESTO_TITLE: 'This is where you make your closing statement.',
    MANIFESTO_P1: 'The manifesto block inverts the page: dark background, light text, with the accent as an offset shadow. Use it for your strongest argument or call to action.',
    MANIFESTO_P2: 'Second paragraph reinforces the point. Tokens drive every color decision — swap the tokens.json and the entire page re-themes.',
    MANIFESTO_CTA: 'Primary CTA',
    MANIFESTO_LINK: 'Secondary Link'
  };
}

// ── Product listing content builder ──────────────────────────────────

const DEFAULT_PRODUCTS = [
  { icon: '&#x1f6cf;', badge: 'badge-new', title: 'MALM Desk', desc: 'Simple, clean design that fits anywhere.', price: '$149' },
  { icon: '&#x1f4fa;', badge: 'badge-sale', title: 'KALLAX Shelf', desc: 'Timeless cube storage. Horizontal or vertical.', price: '$79.99' },
  { icon: '&#x1faa1;', badge: '', title: 'STOCKHOLM Rug', desc: 'Handwoven flatwoven rug. Wool with linen luster.', price: '$299' },
  { icon: '&#x1f4a1;', badge: 'badge-new', title: 'HEKTAR Lamp', desc: 'Industrial design. Soft directional light.', price: '$89.99' },
  { icon: '&#x1f6d0;', badge: '', title: 'GODMORGON Vanity', desc: 'Bathroom storage with smart compartments.', price: '$249' },
  { icon: '&#x1f37d;', badge: 'badge-sale', title: 'IKEA 365+ Cookware', desc: 'Stainless steel. Oven-safe. Everyday cooking.', price: '$59.99' }
];

function buildProductContent(entry) {
  const name = entry.name || 'Template';
  const tagline = entry.tagline || 'Design tokens applied to a living page.';

  const content = {
    PAGE_TITLE: name + ' · Template Gallery',
    TEMPLATE_NAME: name,
    LOGO_INITIAL: name.charAt(0).toUpperCase(),
    HERO_TITLE: 'Design your dream space',
    HERO_SUBTITLE: tagline,
    CTA_TEXT: 'Shop now',
    BANNER_TITLE: 'Spring Sale — Up to 40% Off',
    BANNER_SUBTITLE: 'Limited-time offers on furniture and home accessories.',
    BANNER_CTA: 'Browse deals',
    FOOTER_TEXT: name + ' · Generated by template-renderer.js from tokens.json'
  };

  // Product cards
  DEFAULT_PRODUCTS.forEach((p, i) => {
    const n = i + 1;
    content['CARD_ICON_' + n] = p.icon;
    content['CARD_TITLE_' + n] = p.title;
    content['CARD_DESC_' + n] = p.desc;
    content['CARD_PRICE_' + n] = p.price;
    if (p.badge) {
      // Keep the badge HTML; if no badge, hide it via empty span
    }
  });

  return content;
}

// ── CSS :root block builder ────────────────────────────────────────

function buildTokenCSS(roles, typo, radius, shadow, pageW, gutter, tokensData) {
  const accentHover = lighten(roles.primary, 30);
  const vars = flattenTokens(tokensData);
  const lineSoft = vars['--line-soft'] || (roles.border.startsWith('#') ? hexToRgba(roles.border, 0.5) : roles.border);

  // Editorial skeleton extras
  const accentDark = vars['--oxide-dark'] || vars['--accent-dark'] || darken(roles.primary, 20);
  const shadowSolid = vars['--shadow-solid'] || vars['--shadow-sm'] || ('4px 4px 0 ' + roles.primary);
  const shadowBlock = vars['--shadow-block'] || vars['--shadow-md'] || ('10px 10px 0 ' + roles.primary);
  const bgSoft = hexToRgba(roles.background, 0.75);
  const easeDefault = vars['--ease-default'] || vars['--duration-fast'] || '0.18s ease';
  const easeHover = vars['--ease-hover'] || vars['--duration-base'] || '0.2s ease';

  return `:root {
  --accent: ${roles.primary};
  --accent-hover: ${accentHover};
  --accent-dark: ${accentDark};
  --accent-alt: ${roles.secondary};
  --bg: ${roles.background};
  --bg-soft: ${bgSoft};
  --text: ${roles.text};
  --text-soft: ${roles.textSecondary};
  --line: ${roles.border};
  --line-soft: ${lineSoft};
  --surface: ${roles.surface};
  --display: ${typo.display};
  --body: ${typo.body};
  --radius: ${radius};
  --shadow: ${shadow};
  --shadow-solid: ${shadowSolid};
  --shadow-block: ${shadowBlock};
  --ease-default: ${easeDefault};
  --ease-hover: ${easeHover};
  --page-w: ${pageW};
  --gutter: ${gutter};
}`;
}

// ── Content dispatch ────────────────────────────────────────────────

function buildContent(entry, skeletonType) {
  if (skeletonType === 'editorial-single-page.html') {
    return buildEditorialContent(entry);
  }
  return buildProductContent(entry);
}

// ── Main render function ───────────────────────────────────────────

function renderTemplate(entry, projectDir) {
  const tmplDir = path.join(projectDir, path.dirname(entry.template_path));
  const tokensPath = path.join(tmplDir, 'tokens.json');

  if (!fs.existsSync(tokensPath)) {
    throw new Error('Missing tokens.json for: ' + entry.slug + '\n  Expected: ' + tokensPath);
  }

  const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const skeletonPath = matchSkeleton(entry);
  const skeletonType = path.basename(skeletonPath);
  const skeleton = fs.readFileSync(skeletonPath, 'utf-8');

  const roles = extractColorRoles(tokensData);
  const typo = extractTypography(tokensData);
  const radius = extractRadius(tokensData);
  const shadow = extractShadow(tokensData);
  const pageW = extractPageWidth(tokensData);
  const gutter = extractGutter(tokensData);

  const tokenCSS = buildTokenCSS(roles, typo, radius, shadow, pageW, gutter, tokensData);
  const content = buildContent(entry, skeletonType);

  let out = skeleton;
  out = out.replace('{{TOKEN_CSS}}', tokenCSS);

  for (const [key, val] of Object.entries(content)) {
    // Values containing HTML tags are intentional markup (e.g. <br> in headlines)
    const escaped = /<[a-z][\s\S]*>/i.test(val) ? val : esc(val);
    out = out.replace(new RegExp('{{' + key + '}}', 'g'), escaped);
  }

  return out;
}

// ── CLI ─────────────────────────────────────────────────────────────

function loadEntry(slug) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const entry = registry.find(e => e.slug === slug);
  if (!entry) throw new Error('Template not found in registry: ' + slug);
  return entry;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    let rendered = 0;
    let skipped = 0;

    for (const entry of registry) {
      const tmplDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
      const tokensPath = path.join(tmplDir, 'tokens.json');
      if (!fs.existsSync(tokensPath)) {
        console.log('SKIP ' + entry.slug + ' (no tokens.json)');
        skipped++;
        continue;
      }
      try {
        const html = renderTemplate(entry, PROJECT_DIR);
        const outPath = path.join(tmplDir, 'template.html');
        fs.writeFileSync(outPath, html, 'utf-8');
        console.log('OK   ' + entry.slug + ' → ' + outPath);
        rendered++;
      } catch (err) {
        console.error('FAIL ' + entry.slug + ': ' + err.message);
      }
    }
    console.log('\nRendered: ' + rendered + ' | Skipped: ' + skipped + ' | Total: ' + registry.length);
    return;
  }

  if (args.length === 0) {
    console.log('Usage: node scripts/template-renderer.js <slug> [--all]');
    console.log('  node scripts/template-renderer.js brutalist-paper');
    console.log('  node scripts/template-renderer.js --all');
    process.exit(1);
  }

  const slug = args[0];
  const entry = loadEntry(slug);
  const html = renderTemplate(entry, PROJECT_DIR);
  const outPath = path.join(PROJECT_DIR, path.dirname(entry.template_path), 'template.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('OK ' + slug + ' → ' + outPath);
}

if (require.main === module) {
  main();
}

module.exports = { renderTemplate };

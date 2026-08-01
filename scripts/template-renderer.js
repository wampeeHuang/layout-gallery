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

// Route templates to skeletons based on template_type + design_style.
// slide-deck (37 templates) splits across 5 deck skeletons.
function matchSkeleton(entry) {
  const type = entry.template_type || 'slide-deck';
  const style = (entry.design_style || '').toLowerCase();
  const slug = entry.slug || '';

  // native → zero-layout passthrough skeletons
  if (type === 'native-editorial') {
    const fp = path.join(SKELETONS_DIR, 'native-editorial.html');
    if (fs.existsSync(fp)) return fp;
    // fallback if skeleton missing
    return path.join(SKELETONS_DIR, 'editorial-single-page.html');
  }
  if (type === 'native-swiss') {
    const fp = path.join(SKELETONS_DIR, 'native-swiss.html');
    if (fs.existsSync(fp)) return fp;
    return path.join(SKELETONS_DIR, 'editorial-single-page.html');
  }

  // native-web → full-viewport slide deck skeletons (restored from archive)
  if (type === 'native-editorial-web') {
    const fp = path.join(SKELETONS_DIR, 'native-editorial-web.html');
    if (fs.existsSync(fp)) return fp;
    return path.join(SKELETONS_DIR, 'editorial-single-page.html');
  }
  if (type === 'native-swiss-web') {
    const fp = path.join(SKELETONS_DIR, 'native-swiss-web.html');
    if (fs.existsSync(fp)) return fp;
    return path.join(SKELETONS_DIR, 'editorial-single-page.html');
  }

  // single-page → editorial (with fallback for product-like names)
  if (type === 'single-page') {
    return path.join(SKELETONS_DIR, 'editorial-single-page.html');
  }

  // brand_kit → capsule
  if (type === 'brand_kit') {
    return path.join(SKELETONS_DIR, 'capsule.html');
  }

  // slide-deck routing by design_style
  if (type === 'slide-deck') {
    if (style === 'swiss' || style === 'corporate') {
      return path.join(SKELETONS_DIR, 'blue-professional.html');
    }
    if (style === 'modern' || style === 'retro') {
      return path.join(SKELETONS_DIR, 'retro-windows.html');
    }
    if (style === 'brutalist') {
      return path.join(SKELETONS_DIR, 'broadside-engine.html');
    }
    if (style === 'organic' || style === 'playful') {
      return path.join(SKELETONS_DIR, 'capsule.html');
    }
    // editorial → retro-zine for creative zine feel
    if (style === 'editorial') {
      return path.join(SKELETONS_DIR, 'retro-zine.html');
    }
    // default slide-deck → broadside
    return path.join(SKELETONS_DIR, 'broadside-engine.html');
  }

  // fallback
  const fp = path.join(SKELETONS_DIR, 'editorial-single-page.html');
  if (!fs.existsSync(fp)) throw new Error('Skeleton not found: ' + fp);
  return fp;
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

function hexToRgbParts(hex) {
  if (!hex || !hex.startsWith('#')) return '10,10,11';
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length >= 8) h = h.substring(0, 6);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return r + ',' + g + ',' + b;
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
  const textRgb = hexToRgbParts(roles.text);
  const bgRgb = hexToRgbParts(roles.background);
  const accentRgb = hexToRgbParts(roles.primary);
  const fontDisplay = typo.display || vars['--font-display'] || 'Georgia, serif';
  const fontBody = typo.body || vars['--font-body'] || 'Inter, sans-serif';
  const fontMono = vars['--font-mono'] || vars['--mono'] || '"SF Mono", Consolas, monospace';

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
  --text-rgb: ${textRgb};
  --bg-rgb: ${bgRgb};
  --accent-rgb: ${accentRgb};
  --font-display: ${fontDisplay};
  --font-body: ${fontBody};
  --font-mono: ${fontMono};
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

// ── Font imports builder ────────────────────────────────────────────

function buildFontImports(tokensData) {
  const vars = flattenTokens(tokensData);
  const bk = tokensData.brandKit || {};
  const fonts = bk.fonts || {};

  // Find Google Fonts references
  const fontVals = [];
  for (const key of ['--display', '--body', '--mono', '--hand', '--font-display', '--font-body']) {
    const v = vars[key];
    if (v && !fontVals.includes(v)) fontVals.push(v);
  }

  // If tokensData has a googleFonts or fontImports field, use it
  if (bk.googleFonts) {
    return bk.googleFonts;
  }
  if (tokensData.fontImports) {
    return tokensData.fontImports;
  }

  // Default: empty (fonts defined in tokens.json via CSS @import or system stacks)
  return '';
}

// ── Per-skeleton content builders ──────────────────────────────────

function buildBroadsideContent(entry) {
  const name = esc(entry.name || 'Template');
  const tagline = esc(entry.tagline || 'A bold statement.');
  return {
    PAGE_TITLE: name + ' · Template Gallery',
    COVER_NUM: '01', COVER_SECTION: 'Cover',
    COVER_TITLE: name,
    COVER_SUBTITLE: tagline,
    COVER_AUTHOR: 'Presented by Company',
    COVER_CONTEXT: '2026',
    CHAPTER_NUM: '02', CHAPTER_LABEL: 'Context',
    CHAPTER_TITLE: 'Setting the Stage',
    CHAPTER_SUBTITLE: 'Understanding the landscape before we build.',
    STMT_SECTION: 'Statement', STMT_NUM: '03',
    STMT_KICKER: 'Our Philosophy',
    STMT_HEADLINE: '"The best work comes from clarity of vision and precision of craft."',
    STMT_AUTHOR: 'Design Principle', STMT_FOOTER: 'Internal',
    SPLIT_SECTION: 'Approach', SPLIT_NUM: '04',
    SPLIT_KICKER: 'Methodology',
    SPLIT_HEADLINE: 'The Approach',
    SPLIT_BODY: 'We combine rigorous methodology with creative exploration.',
    SPLIT_ITEM_1: 'Research & Discovery', SPLIT_ITEM_2: 'Prototyping & Validation', SPLIT_ITEM_3: 'Delivery & Iteration',
    SPLIT_IMAGE_LABEL: 'Diagram', SPLIT_IMAGE_CAPTION: 'Process overview.',
    SPLIT_AUTHOR: 'Team', SPLIT_FOOTER: 'Confidential',
    STATS_NUM: '05', STATS_SECTION: 'Metrics',
    STATS_VAL_1: '12.4M', STATS_LABEL_1: 'Total Reach', STATS_NOTE_1: 'across all channels',
    STATS_VAL_2: '98.2%', STATS_LABEL_2: 'Uptime', STATS_NOTE_2: 'last 12 months',
    STATS_VAL_3: '48', STATS_LABEL_3: 'Partners', STATS_NOTE_3: 'and growing',
    STATS_FOOTER_LEFT: 'Q4 2026', STATS_FOOTER_RIGHT: 'Internal',
    QUOTE_KICKER: 'Reminder',
    QUOTE_TEXT: '"Every pixel, every word, every interaction matters."',
    QUOTE_ATTR: 'Our Philosophy', QUOTE_SOURCE: 'Internal memo · 2026',
    LIST_SECTION: 'Capabilities', LIST_NUM: '06',
    LIST_KICKER: 'What We Do',
    LIST_HEADLINE: 'Capabilities',
    LIST_ITEM_1: 'Strategy & Research', LIST_ITEM_2: 'Design & Prototyping',
    LIST_ITEM_3: 'Engineering & Delivery', LIST_ITEM_4: 'Growth & Optimization',
    LIST_AUTHOR: 'Team', LIST_FOOTER: 'Overview',
    COMPARE_SECTION: 'Before/After', COMPARE_NUM: '07',
    COMPARE_BEFORE_LABEL: 'BEFORE', COMPARE_BEFORE_TITLE: 'Fragmented',
    COMPARE_BEFORE_BODY: 'Inconsistent workflows, missed deadlines, siloed teams.',
    COMPARE_BEFORE_ITEM_1: 'Manual processes', COMPARE_BEFORE_ITEM_2: 'No single source of truth', COMPARE_BEFORE_ITEM_3: 'Slow feedback loops',
    COMPARE_AFTER_LABEL: 'AFTER', COMPARE_AFTER_TITLE: 'Unified',
    COMPARE_AFTER_BODY: 'Streamlined pipeline, quality assurance, predictable delivery.',
    COMPARE_AFTER_ITEM_1: 'Automated workflows', COMPARE_AFTER_ITEM_2: 'Centralized data', COMPARE_AFTER_ITEM_3: 'Real-time insights',
    COMPARE_AUTHOR: 'Impact', COMPARE_FOOTER: 'Summary',
    CHART_SECTION: 'Growth', CHART_NUM: '08',
    CHART_TITLE: 'Growth Trajectory', CHART_SUBTITLE: 'Quarterly performance across fiscal year 2026.',
    CHART_BAR1_VAL: '45%', CHART_BAR1_H: '45', CHART_BAR1_LABEL: 'Q1',
    CHART_BAR2_VAL: '62%', CHART_BAR2_H: '62', CHART_BAR2_LABEL: 'Q2',
    CHART_BAR3_VAL: '78%', CHART_BAR3_H: '78', CHART_BAR3_LABEL: 'Q3',
    CHART_BAR4_VAL: '94%', CHART_BAR4_H: '94', CHART_BAR4_LABEL: 'Q4',
    CHART_SOURCE: 'Source: Internal analytics · FY 2026',
    CHART_AUTHOR: 'Data', CHART_FOOTER: 'Verified',
    END_NUM: '09', END_SECTION: 'Closing',
    END_HEADLINE: 'Thank You',
    END_CONTACT: 'hello@company.co',
    END_AUTHOR: 'Company', END_CONTEXT: '2026'
  };
}

function buildBlueProfessionalContent(entry) {
  const name = esc(entry.name || 'Template');
  const tagline = esc(entry.tagline || '');
  return {
    PAGE_TITLE: name + ' · Template Gallery',
    COVER_TITLE: name,
    COVER_SUBTITLE: tagline || 'Quarterly Business Review',
    COVER_META: 'Confidential · 2026',
    AGENDA_HEADER: 'Agenda', AGENDA_TAG: 'Overview',
    AGENDA_1_TITLE: 'Executive Summary', AGENDA_1_DESC: 'Key highlights and strategic overview.',
    AGENDA_2_TITLE: 'Financial Performance', AGENDA_2_DESC: 'Revenue, costs, and growth metrics.',
    AGENDA_3_TITLE: 'Product Roadmap', AGENDA_3_DESC: 'Current status and upcoming milestones.',
    AGENDA_4_TITLE: 'Market Analysis', AGENDA_4_DESC: 'Competitive landscape and opportunities.',
    AGENDA_5_TITLE: 'Team & Resources', AGENDA_5_DESC: 'Organizational updates and hiring plan.',
    AGENDA_6_TITLE: 'Q&A Discussion', AGENDA_6_DESC: 'Open floor for questions and next steps.',
    METRICS_HEADER: 'Performance', METRICS_TAG: 'Dashboard',
    METRICS_TITLE: 'Key Performance Indicators',
    METRIC_1_VALUE: '$2.1M', METRIC_1_LABEL: 'Quarterly Revenue', METRIC_1_DESC: 'Total recognized revenue for Q4 2026.',
    METRIC_1_SUPP_1: 'Enterprise: $1.2M', METRIC_1_SUPP_2: 'Mid-market: $0.6M', METRIC_1_SUPP_3: 'SMB: $0.3M',
    METRIC_1_CHANGE: '+18.3% vs Q3',
    METRIC_2_VALUE: '1,482', METRIC_2_LABEL: 'Active Customers', METRIC_2_DESC: 'Total paying accounts as of Dec 31.',
    METRIC_2_SUPP_1: 'New: +124 this quarter', METRIC_2_SUPP_2: 'Churn: 2.1%', METRIC_2_SUPP_3: 'Expansion: $48K MRR',
    METRIC_2_CHANGE: '-12% churn reduction',
    METRIC_3_VALUE: '94.2%', METRIC_3_LABEL: 'Gross Retention', METRIC_3_DESC: 'Annual recurring revenue retention rate.',
    METRIC_3_SUPP_1: 'Net retention: 112%', METRIC_3_SUPP_2: 'Logo retention: 89%', METRIC_3_SUPP_3: 'Target: 95%+',
    METRIC_3_CHANGE: '+2.1% YoY',
    DASH_HEADER: 'Analytics', DASH_TAG: 'Snapshot',
    DASH_TITLE: 'Operational Dashboard',
    STAT_1_NUM: '4.2M', STAT_1_UNIT: '', STAT_1_NAME: 'API Calls / Day', STAT_1_CONTEXT: 'avg over 30 days',
    STAT_2_NUM: '124', STAT_2_UNIT: 'ms', STAT_2_NAME: 'Avg Response Time', STAT_2_CONTEXT: 'p99: 380ms',
    STAT_3_NUM: '99.97', STAT_3_UNIT: '%', STAT_3_NAME: 'System Uptime', STAT_3_CONTEXT: 'last 12 months',
    STAT_4_NUM: '342', STAT_4_UNIT: '', STAT_4_NAME: 'Support Tickets', STAT_4_CONTEXT: '-12% from last quarter',
    STAT_5_NUM: '68', STAT_5_UNIT: '%', STAT_5_NAME: 'Feature Adoption', STAT_5_CONTEXT: 'new v2 features',
    STAT_6_NUM: '72', STAT_6_UNIT: '', STAT_6_NAME: 'NPS Score', STAT_6_CONTEXT: 'industry avg: 45',
    SPLIT_HEADER: 'Strategy', SPLIT_TAG: 'Focus',
    SPLIT_TITLE: 'Strategic Priorities',
    SPLIT_LI_1: 'Accelerate enterprise adoption with dedicated support and SLAs.',
    SPLIT_LI_2: 'Launch AI-powered analytics module for predictive insights.',
    SPLIT_LI_3: 'Expand into APAC region with localized infrastructure.',
    SPLIT_LI_4: 'Achieve SOC 2 Type II certification for compliance.',
    SPLIT_STAT: '340%', SPLIT_STAT_LABEL: 'projected growth',
    SPLIT_STAT_2: '4', SPLIT_STAT_2_LABEL: 'key initiatives',
    BARS_HEADER: 'Revenue', BARS_TAG: 'Breakdown',
    BARS_TITLE: 'Revenue by Product Line',
    BAR_1_VAL: '82%', BAR_1_H: '82', BAR_1_LABEL: 'Platform',
    BAR_2_VAL: '67%', BAR_2_H: '67', BAR_2_LABEL: 'Services',
    BAR_3_VAL: '45%', BAR_3_H: '45', BAR_3_LABEL: 'API',
    BAR_4_VAL: '38%', BAR_4_H: '38', BAR_4_LABEL: 'Consulting',
    BAR_5_VAL: '22%', BAR_5_H: '22', BAR_5_LABEL: 'Marketplace',
    QUOTE_TEXT: '"The companies that thrive are not the ones that predict the future — they are the ones that build it."',
    QUOTE_ATTR: 'Strategic Vision', QUOTE_SOURCE: 'Annual Letter · 2026',
    TIMELINE_HEADER: 'Roadmap', TIMELINE_TAG: 'Plan',
    TIMELINE_TITLE: 'Product Roadmap 2026-2027',
    TL_1_DATE: 'Q1 2026', TL_1_TITLE: 'Platform v2.0 Launch', TL_1_DESC: 'Complete redesign of core infrastructure with new API surface.',
    TL_2_DATE: 'Q2 2026', TL_2_TITLE: 'Analytics Dashboard', TL_2_DESC: 'Real-time visualization with 25+ widget types and custom layouts.',
    TL_3_DATE: 'Q3 2026', TL_3_TITLE: 'AI Assistant Beta', TL_3_DESC: 'Predictive modeling and intelligent automation for enterprise users.',
    CLOSE_TITLE: 'Thank You',
    CLOSE_SUB: 'Questions & Discussion',
    CLOSE_CTA: 'Get in Touch',
    CLOSE_CONTACT: 'hello@company.co'
  };
}

function buildRetroZineContent(entry) {
  const name = esc(entry.name || 'Template');
  const tagline = esc(entry.tagline || '');
  return {
    PAGE_TITLE: name + ' · Template Gallery',
    ZINE_HERO_LABEL: 'Strategic Overview',
    ZINE_HERO_TITLE: name.toUpperCase(),
    ZINE_HERO_SUB: 'Growth &mdash; Innovation &mdash; Partnership',
    ZINE_HERO_DATE: '2026',
    ZINE_SPLIT_LABEL: 'Our Mission',
    ZINE_SPLIT_HEADING: 'Building<br>Tomorrow',
    ZINE_SPLIT_BODY: tagline || 'We partner with ambitious teams to turn complex challenges into scalable solutions.',
    ZINE_SPLIT_STAT: '340%',
    ZINE_SPLIT_STAT_LABEL: 'year-over-year growth',
    ZINE_QUOTE_TEXT: '"The companies that thrive are not the ones that predict the future. They are the ones that build it."',
    ZINE_QUOTE_AUTHOR: '&mdash; Our founding principle since day one',
    ZINE_GRID_HEADER: 'At a Glance',
    ZINE_GRID1_LABEL: 'Founded', ZINE_GRID1_VALUE: '<strong>2019</strong> &mdash; San Francisco, CA',
    ZINE_GRID2_LABEL: 'Team', ZINE_GRID2_VALUE: '<strong>120</strong> people across 4 continents',
    ZINE_GRID3_LABEL: 'Clients', ZINE_GRID3_VALUE: '<strong>48</strong> active partnerships',
    ZINE_GRID4_LABEL: 'Revenue', ZINE_GRID4_VALUE: '$12.4M ARR &mdash; <strong>profitable</strong>',
    ZINE_VISUAL_TITLE: 'Q3<br>Target',
    ZINE_VISUAL_SUB: '$18M ARR by December',
    ZINE_VISUAL_CAPTION: 'Fiscal year ending March 2027',
    ZINE_ED_TITLE: 'Product<br>Roadmap',
    ZINE_ED_ISSUE: 'FY 2026 / 2027',
    ZINE_ED_COL1: '<span class="ed-drop">P</span>hase one is about foundation — refining our core platform, improving onboarding velocity, and expanding our API surface. <span class="ed-highlight">Enterprise clients</span> with stricter compliance needs are our priority.',
    ZINE_ED_COL2: '<strong style="font-family: var(--display); font-size: 18px; letter-spacing: 2px;">PHASE TWO: SCALE</strong><br><br>Next quarter we shift from build mode to distribution. International expansion, two new regions, localized support.<br><br><em style="font-family: var(--hand, cursive); font-size: 22px;">Speed without sacrifice is the goal.</em>',
    ZINE_NUMBERS_HEADER: 'Our Core Values',
    ZINE_NUM1_LABEL: 'Clarity', ZINE_NUM1_DESC: 'Complex problems deserve simple explanations.',
    ZINE_NUM2_LABEL: 'Velocity', ZINE_NUM2_DESC: 'Ship fast, learn faster, iterate always.',
    ZINE_NUM3_LABEL: 'Trust', ZINE_NUM3_DESC: 'Every partnership is built on radical transparency.',
    ZINE_COLLAGE_HEADER: 'Capabilities',
    ZINE_COLLAGE1_TITLE: 'Strategy', ZINE_COLLAGE1_DESC: 'Market analysis, competitive positioning, and roadmaps.',
    ZINE_COLLAGE2_TITLE: 'Design', ZINE_COLLAGE2_DESC: 'Product design, brand systems, and user experiences.',
    ZINE_COLLAGE3_TITLE: 'Engineering', ZINE_COLLAGE3_DESC: 'Scalable architecture, robust APIs, and infrastructure.',
    ZINE_COLLAGE4_TITLE: 'Growth', ZINE_COLLAGE4_DESC: 'Go-to-market planning, partner programs, and revenue ops.',
    ZINE_RSVP_TITLE: 'Let\'s Talk',
    ZINE_RSVP_SUBTITLE: 'Ready to explore what we can build together?',
    ZINE_RSVP_FIELD1: 'Name', ZINE_RSVP_FIELD2: 'Company',
    ZINE_RSVP_FIELD3: 'Email', ZINE_RSVP_FIELD4: 'Project',
    ZINE_RSVP_STAMP: 'CONTACT US',
    ZINE_CLOSING_LABEL: 'Thank You',
    ZINE_CLOSING_TITLE: 'Let\'s Build<br>Together',
    ZINE_CLOSING_CONTACT: 'hello@company.co &mdash; San Francisco &mdash; Worldwide',
    ZINE_SOCIAL1: 'LinkedIn', ZINE_SOCIAL2: 'Contact', ZINE_SOCIAL3: 'Careers'
  };
}

function buildCapsuleContent(entry) {
  const name = esc(entry.name || 'Template');
  const tagline = esc(entry.tagline || '');
  return {
    PAGE_TITLE: name + ' · Template Gallery',
    CAP_DECO1: 'Concept', CAP_DECO2: 'Strategy', CAP_DECO3: 'Vision',
    CAP_DECO4: 'Future', CAP_DECO5: '2026', CAP_DECO6: 'Design', CAP_DECO7: 'Next',
    CAP_TITLE_PILL: 'Presentation Template',
    CAP_MAIN_TITLE: name.toUpperCase(),
    CAP_MAIN_SUBTITLE: tagline || 'A Framework for Bold Ideas',
    CAP_INTRO_HEADING: 'Every Great Endeavor Begins with a Single Thought',
    CAP_INTRO_P1: 'We believe in the power of structured creativity. By combining rigorous methodology with unbounded imagination, teams can transform abstract concepts into tangible outcomes.',
    CAP_INTRO_P2: 'This template exists to give shape to your boldest visions — a starting point, a scaffold, and a catalyst for the work that matters most.',
    CAP_ORBIT_CENTER: '01',
    CAP_ORBIT1: 'Research', CAP_ORBIT2: 'Ideation', CAP_ORBIT3: 'Prototype',
    CAP_ORBIT4: 'Iterate', CAP_ORBIT5: 'Launch', CAP_ORBIT6: 'Scale',
    CAP_PILLARS_PILL: 'Core Principles',
    CAP_PILLARS_HEADING: 'The Foundation of Every Decision',
    CAP_PILLAR1_TITLE: 'Clarity of Purpose', CAP_PILLAR1_DESC: 'Define the north star that guides every subsequent choice.',
    CAP_PILLAR2_TITLE: 'Structured Flexibility', CAP_PILLAR2_DESC: 'Rigorous frameworks need not constrain creativity.',
    CAP_PILLAR3_TITLE: 'Measured Impact', CAP_PILLAR3_DESC: 'Success is not a feeling but a quantity. Establish clear metrics early.',
    CAP_CHART_HEADING: 'Performance Indicators',
    CAP_CHART1_LABEL: 'Market Reach', CAP_CHART1_PCT: '82', CAP_CHART1_VAL: '8.2M',
    CAP_CHART2_LABEL: 'Engagement', CAP_CHART2_PCT: '67', CAP_CHART2_VAL: '4.5M',
    CAP_CHART3_LABEL: 'Conversion', CAP_CHART3_PCT: '45', CAP_CHART3_VAL: '2.1M',
    CAP_CHART4_LABEL: 'Retention', CAP_CHART4_PCT: '91', CAP_CHART4_VAL: '7.8M',
    CAP_CHART5_LABEL: 'Satisfaction', CAP_CHART5_PCT: '74', CAP_CHART5_VAL: '6.3M',
    CAP_Q_FLOAT1: 'Bold', CAP_Q_FLOAT2: 'Inspire', CAP_Q_FLOAT3: 'Create',
    CAP_Q_FLOAT4: 'Elevate', CAP_Q_FLOAT5: 'Now', CAP_Q_FLOAT6: 'Today',
    CAP_QUOTE_TEXT: 'The best time to plant a tree was twenty years ago. The second best time is <span class="quote-highlight">right now</span>. Every moment of hesitation is a moment where <span class="quote-highlight alt">possibility</span> quietly dims.',
    CAP_QUOTE_ATTR: 'A Philosophy of Action',
    CAP_TIMELINE_HEADING: 'Phased Implementation',
    CAP_STEP1_LABEL: 'Discovery', CAP_STEP1_DESC: 'Map the terrain before you traverse it',
    CAP_STEP2_LABEL: 'Definition', CAP_STEP2_DESC: 'Sharpen the question to find the answer',
    CAP_STEP3_LABEL: 'Development', CAP_STEP3_DESC: 'Build with intent, iterate with care',
    CAP_STEP4_LABEL: 'Delivery', CAP_STEP4_DESC: 'Ship the work, then make it better',
    CAP_STEP5_LABEL: 'Evolution', CAP_STEP5_DESC: 'Growth is a process, not a destination',
    CAP_STATS_HEADING: 'Key Metrics at a Glance',
    CAP_STAT1_NUM: '340%', CAP_STAT1_LABEL: 'Growth in<br>Active Users',
    CAP_STAT2_NUM: '12.4M', CAP_STAT2_LABEL: 'Total Reach<br>Across Channels',
    CAP_STAT3_NUM: '98.2%', CAP_STAT3_LABEL: 'System<br>Uptime Record',
    CAP_STAT4_NUM: '4.9', CAP_STAT4_LABEL: 'Average User<br>Satisfaction Score',
    CAP_DIAGRAM_HEADING: 'System Architecture Overview',
    CAP_DIAG_NODE1: 'Input Layer', CAP_DIAG_NODE2: 'Processing Core',
    CAP_DIAG_NODE3: 'Decision Engine', CAP_DIAG_NODE4: 'Output Stream',
    CAP_DIAG_SUB1_TITLE: 'Data Ingestion', CAP_DIAG_SUB1_DESC: 'Raw signals are captured and normalized from multiple sources in real time',
    CAP_DIAG_SUB2_TITLE: 'Transformation', CAP_DIAG_SUB2_DESC: 'Information is enriched, filtered, and structured for downstream consumption',
    CAP_DIAG_SUB3_TITLE: 'Distribution', CAP_DIAG_SUB3_DESC: 'Results are routed to appropriate endpoints with guaranteed delivery',
    CAP_VISUAL_PLACEHOLDER: 'Visual Placeholder',
    CAP_SPLIT_HEADING: 'Where Vision Meets Execution',
    CAP_SPLIT_P1: 'Great ideas deserve more than good intentions. They demand rigorous craft, thoughtful iteration, and an unwavering commitment to the user experience.',
    CAP_SPLIT_P2: 'Our methodology bridges the gap between aspiration and reality, grounding creative instinct in empirical insight.',
    CAP_TAG1: 'Research', CAP_TAG2: 'Strategy', CAP_TAG3: 'Design', CAP_TAG4: 'Build', CAP_TAG5: 'Measure',
    CAP_CL_DECO1: 'Continue', CAP_CL_DECO2: 'Explore', CAP_CL_DECO3: 'Discover',
    CAP_CL_DECO4: 'Go', CAP_CL_DECO5: 'Begin', CAP_CL_DECO6: 'Launch', CAP_CL_DECO7: 'More',
    CAP_CLOSING_PILL: 'The Journey Continues',
    CAP_CLOSING_TITLE: 'Thank You for Your Attention',
    CAP_CLOSING_SUB: 'Questions and conversation welcome'
  };
}

function buildRetroWindowsContent(entry) {
  const name = esc(entry.name || 'Template');
  return {
    PAGE_TITLE: name + ' · Template Gallery',
    WIN_APP_TITLE: 'PRESENTATION.EXE',
    WIN_SPLASH_TITLE: 'QUARTERLY OVERVIEW',
    WIN_MARQUEE: 'Welcome to the presentation template &bull; Use arrow keys or navigation dots to browse slides',
    WIN_LOADING_TEXT: 'Please wait while content loads...',
    WIN_VERSION_LINE: 'Version 1.0 &bull; Build 2026.05.01 &bull; All systems operational',
    WIN_AGENDA_TITLE: 'AGENDA.TXT',
    WIN_AGENDA_HEADING: 'Today\'s Discussion Topics',
    WIN_AGENDA_SUBTITLE: 'Select an item to navigate. Use keyboard shortcuts for faster access.',
    WIN_AGENDA_PRIMARY_LABEL: 'Primary Items',
    WIN_AGENDA_ITEM1: 'Executive Summary & Key Highlights',
    WIN_AGENDA_ITEM2: 'Financial Performance Metrics',
    WIN_AGENDA_ITEM3: 'Product Development Roadmap',
    WIN_AGENDA_ITEM4: 'Market Analysis & Competitive Landscape',
    WIN_AGENDA_ITEM5: 'Customer Satisfaction Overview',
    WIN_AGENDA_SECONDARY_LABEL: 'Secondary Items',
    WIN_AGENDA_ITEM6: 'Team Structure & Resource Allocation',
    WIN_AGENDA_ITEM7: 'Risk Assessment Matrix',
    WIN_AGENDA_ITEM8: 'Strategic Initiatives for Next Quarter',
    WIN_AGENDA_ITEM9: 'Budget Forecast & Allocation Plan',
    WIN_AGENDA_ITEM10: 'Open Discussion & Q&A Session',
    WIN_STATUS_LABEL: 'Status:', WIN_STATUS_VALUE: 'READY',
    WIN_CHECK1: 'Notify participants', WIN_CHECK2: 'Record session',
    WIN_META_DURATION: 'Estimated duration: 45 minutes',
    WIN_META_UPDATED: 'Last updated: 05/01/2026',
    WIN_META_COUNT: 'Items: 10 total',
    WIN_SUMMARY_TITLE: 'README.DOC',
    WIN_SUMMARY_HEADING: 'Executive Summary',
    WIN_SUMMARY_BODY: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    WIN_OBJ_LABEL: 'Key Objectives',
    WIN_OBJ_BODY: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    WIN_OUTCOME_LABEL: 'Primary Outcomes',
    WIN_OUTCOME_BODY: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    WIN_META1_LABEL: 'Prepared by', WIN_META1_VAL: 'Department Name',
    WIN_META2_LABEL: 'Date', WIN_META2_VAL: 'May 01, 2026',
    WIN_META3_LABEL: 'Classification', WIN_META3_VAL: 'Internal Use',
    WIN_META4_LABEL: 'Review Status', WIN_META4_VAL: 'Approved',
    WIN_CHART_TITLE: 'DATAVIEW.CSV',
    WIN_CHART_HEADING: 'Quarterly Revenue Comparison',
    WIN_CHART_HIGHLIGHTS_LABEL: 'Highlights',
    WIN_CHART_HL1: 'Q3 exceeded projections by 18%',
    WIN_CHART_HL2: 'Enterprise segment grew 24% YoY',
    WIN_CHART_HL3: 'Recurring revenue now at 62% of total',
    WIN_TABLE_COL1: 'Quarter', WIN_TABLE_COL2: 'Revenue', WIN_TABLE_COL3: 'Growth',
    WIN_TABLE_R1C1: 'Q1 2026', WIN_TABLE_R1C2: '$1.2M', WIN_TABLE_R1C3: '+5%',
    WIN_TABLE_R2C1: 'Q2 2026', WIN_TABLE_R2C2: '$1.5M', WIN_TABLE_R2C3: '+12%',
    WIN_TABLE_R3C1: 'Q3 2026', WIN_TABLE_R3C2: '$1.9M', WIN_TABLE_R3C3: '+18%',
    WIN_TABLE_R4C1: 'Q4 2026', WIN_TABLE_R4C2: '$2.1M', WIN_TABLE_R4C3: '+22%',
    WIN_CHART_SOURCE: 'Data source: Internal reporting system',
    WIN_CHART_UPDATED: 'Updated: May 2026',
    WIN_CHART_UNIT: 'Currency: USD (millions)',
    WIN_FEATURES_TITLE: 'FEATURES.INI',
    WIN_FEATURES_HEADING: 'Product Capabilities Overview',
    WIN_FEATURES_SUBTITLE: 'A detailed breakdown of current platform features and their implementation status.',
    WIN_MODULES_LABEL: 'Core Modules',
    WIN_MOD1_NAME: 'User Authentication Service', WIN_MOD1_PCT: '100',
    WIN_MOD2_NAME: 'Data Processing Engine', WIN_MOD2_PCT: '92',
    WIN_MOD3_NAME: 'Reporting Dashboard', WIN_MOD3_PCT: '88',
    WIN_MOD4_NAME: 'Advanced Analytics Suite', WIN_MOD4_PCT: '65',
    WIN_COMPLETION_LABEL: 'Overall Completion', WIN_COMPLETION_PCT: '86',
    WIN_DETAILS_LABEL: 'Module Details',
    WIN_DETAIL1: '<strong>Auth Service:</strong> Supports SSO, MFA, and role-based access control. Fully deployed.',
    WIN_DETAIL2: '<strong>Data Engine:</strong> Handles 10M+ records daily with sub-second query response times.',
    WIN_DETAIL3: '<strong>Dashboard:</strong> Real-time visualization with 25+ widget types and custom layouts.',
    WIN_DETAIL4: '<strong>Analytics:</strong> Predictive modeling and trend forecasting. Beta in Q3 2026.',
    WIN_COUNT1_LABEL: 'Active', WIN_COUNT1: '12',
    WIN_COUNT2_LABEL: 'In Dev', WIN_COUNT2: '3',
    WIN_COUNT3_LABEL: 'Planned', WIN_COUNT3: '2',
    WIN_PIE_TITLE: 'GRAPHS.BMP',
    WIN_PIE_HEADING: 'Market Segment Distribution',
    WIN_PIE_BREAKDOWN_LABEL: 'Segment Breakdown',
    WIN_PIE_SEG1_LABEL: 'Enterprise', WIN_PIE_SEG1_PCT: '42',
    WIN_PIE_SEG2_LABEL: 'Mid-Market', WIN_PIE_SEG2_PCT: '28',
    WIN_PIE_SEG3_LABEL: 'Small Business', WIN_PIE_SEG3_PCT: '18',
    WIN_PIE_SEG4_LABEL: 'Government', WIN_PIE_SEG4_PCT: '12',
    WIN_PIE_INSIGHT_LABEL: 'Key Insight',
    WIN_PIE_INSIGHT_TEXT: 'Enterprise clients drive the majority of revenue, with a 15% increase in average contract value year-over-year.',
    WIN_PIE_FOOTER: 'Total Addressable Market: $4.2B &bull; Our Share: 8.3%',
    WIN_METRICS_TITLE: 'METRICS.LOG',
    WIN_METRICS_HEADING: 'Performance Metrics Dashboard',
    WIN_METRIC1_LABEL: 'Revenue', WIN_METRIC1_VAL: '$2.1M', WIN_METRIC1_DELTA: '+18.3%', WIN_METRIC1_CONTEXT: 'vs previous quarter',
    WIN_METRIC2_LABEL: 'Customers', WIN_METRIC2_VAL: '1,482', WIN_METRIC2_DELTA: '+124', WIN_METRIC2_CONTEXT: 'new this quarter',
    WIN_METRIC3_LABEL: 'Retention', WIN_METRIC3_VAL: '94.2%', WIN_METRIC3_DELTA: '+2.1%', WIN_METRIC3_CONTEXT: 'annual rate',
    WIN_METRIC4_LABEL: 'NPS Score', WIN_METRIC4_VAL: '72', WIN_METRIC4_DELTA: '+5', WIN_METRIC4_CONTEXT: 'industry avg: 45',
    WIN_LINE_CHART_LABEL: 'Monthly Active Users Trend',
    WIN_KPI_LABEL: 'Operational KPIs',
    WIN_KPI1_LABEL: 'Avg. Response Time', WIN_KPI1_VAL: '124ms',
    WIN_KPI2_LABEL: 'System Uptime', WIN_KPI2_VAL: '99.97%',
    WIN_KPI3_LABEL: 'Support Tickets', WIN_KPI3_VAL: '342 (-12%)',
    WIN_KPI4_LABEL: 'Feature Adoption', WIN_KPI4_VAL: '68%',
    WIN_KPI5_LABEL: 'API Calls / Day', WIN_KPI5_VAL: '4.2M',
    WIN_SYSTEM_STATUS: 'All systems operational',
    WIN_ORG_TITLE: 'EXPLORER.EXE',
    WIN_ORG_HEADING: 'Organizational Structure',
    WIN_ORG_PATH: 'C:\\ORG\\STRUCTURE',
    WIN_ORG_DEPT1: 'Executive Leadership', WIN_ORG_DEPT1_SUB1: 'Office of the CEO', WIN_ORG_DEPT1_SUB2: 'Chief of Staff', WIN_ORG_DEPT1_SUB3: 'Board Relations', WIN_ORG_DEPT1_SUB3_1: 'Governance', WIN_ORG_DEPT1_SUB3_2: 'Committees',
    WIN_ORG_DEPT2: 'Engineering', WIN_ORG_DEPT2_SUB1: 'Platform Team', WIN_ORG_DEPT2_SUB2: 'Product Engineering', WIN_ORG_DEPT2_SUB3: 'Infrastructure', WIN_ORG_DEPT2_SUB4: 'QA & DevOps',
    WIN_ORG_DEPT3: 'Commercial', WIN_ORG_DEPT3_SUB1: 'Sales', WIN_ORG_DEPT3_SUB2: 'Marketing', WIN_ORG_DEPT3_SUB3: 'Customer Success',
    WIN_ORG_DEPT4: 'Operations', WIN_ORG_DEPT4_SUB1: 'Finance', WIN_ORG_DEPT4_SUB2: 'Legal & Compliance', WIN_ORG_DEPT4_SUB3: 'People & Culture',
    WIN_ORG_TABLE_LABEL: 'Department Headcount',
    WIN_ORG_COL1: 'Department', WIN_ORG_COL2: 'Headcount', WIN_ORG_COL3: 'Open Roles',
    WIN_ORG_R1C1: 'Engineering', WIN_ORG_R1C2: '84', WIN_ORG_R1C3: '12',
    WIN_ORG_R2C1: 'Commercial', WIN_ORG_R2C2: '56', WIN_ORG_R2C3: '8',
    WIN_ORG_R3C1: 'Operations', WIN_ORG_R3C2: '32', WIN_ORG_R3C3: '4',
    WIN_ORG_R4C1: 'Leadership', WIN_ORG_R4C2: '8', WIN_ORG_R4C3: '0',
    WIN_ORG_GROWTH_LABEL: 'Growth Plan',
    WIN_ORG_GROWTH_TEXT: 'Planning to expand engineering by 25% and commercial teams by 18% over the next two quarters.',
    WIN_ORG_GROWTH1: 'Engineering: +21', WIN_ORG_GROWTH2: 'Sales: +10', WIN_ORG_GROWTH3: 'Support: +6',
    WIN_ORG_TOTAL_LABEL: 'Total Organization', WIN_ORG_TOTAL: '180 employees',
    WIN_TIMELINE_TITLE: 'TIMELINE.PRJ',
    WIN_TIMELINE_HEADING: 'Project Roadmap 2026',
    WIN_TL_Q1: 'Q1 2026', WIN_TL_Q1_STATUS: 'Completed', WIN_TL_Q1_ITEM1: 'Platform v2.0 release', WIN_TL_Q1_ITEM2: 'Mobile app launch', WIN_TL_Q1_ITEM3: 'Partner integrations',
    WIN_TL_Q2: 'Q2 2026', WIN_TL_Q2_STATUS: 'Completed', WIN_TL_Q2_ITEM1: 'Analytics dashboard', WIN_TL_Q2_ITEM2: 'API marketplace', WIN_TL_Q2_ITEM3: 'Regional expansion EU',
    WIN_TL_Q3: 'Q3 2026', WIN_TL_Q3_STATUS: 'In Progress', WIN_TL_Q3_ITEM1: 'AI assistant beta', WIN_TL_Q3_ITEM2: 'Enterprise security', WIN_TL_Q3_ITEM3: 'Team expansion',
    WIN_TL_Q4: 'Q4 2026', WIN_TL_Q4_STATUS: 'Planned', WIN_TL_Q4_ITEM1: 'Global data centers', WIN_TL_Q4_ITEM2: 'Advanced reporting', WIN_TL_Q4_ITEM3: 'Series C prep',
    WIN_TL_MILESTONE_LABEL: 'Current Milestone: Q3 2026',
    WIN_TL_MILESTONE_PCT: '55', WIN_TL_MILESTONE_SUB: '6 of 11 milestones',
    WIN_TL_RISK_LABEL: 'Risk Level', WIN_TL_RISK_VAL: 'MODERATE', WIN_TL_RISK_SUB: '2 risks identified',
    WIN_TL_BUDGET_LABEL: 'Budget Status', WIN_TL_BUDGET_VAL: 'ON TRACK', WIN_TL_BUDGET_SUB: '$1.2M remaining',
    WIN_TL_REVIEW_LABEL: 'Next Review', WIN_TL_REVIEW_VAL: 'JUL 15', WIN_TL_REVIEW_SUB: 'Q3 checkpoint',
    WIN_CLOSING_TITLE: 'SHUTDOWN.EXE',
    WIN_CLOSING_HEADING: 'THANK YOU FOR WATCHING',
    WIN_CLOSING_BODY: 'Questions and feedback are always welcome.',
    WIN_CLOSING_MARQUEE: 'Contact us at hello@company.example &bull; Visit www.company.example &bull; Follow @companyhandle',
    WIN_CONTACT1_LABEL: 'Email', WIN_CONTACT1_VAL: 'hello@example.com',
    WIN_CONTACT2_LABEL: 'Phone', WIN_CONTACT2_VAL: '+1 (555) 000-0000',
    WIN_CONTACT3_LABEL: 'Website', WIN_CONTACT3_VAL: 'www.example.com',
    WIN_CLOSING_BTN1: 'Restart', WIN_CLOSING_BTN2: 'Contact', WIN_CLOSING_BTN3: 'End Session',
    WIN_COPYRIGHT: '&copy; 2026 Company Name &bull; All rights reserved &bull; Confidential & Proprietary',
    WIN_BAR_LABELS_JS: "'Q1', 'Q2', 'Q3', 'Q4'",
    WIN_BAR_DATASET_LABEL: 'Revenue ($M)',
    WIN_BAR_DATA_JS: '1.2, 1.5, 1.9, 2.1',
    WIN_PIE_LABELS_JS: "'Enterprise', 'Mid-Market', 'Small Business', 'Government'",
    WIN_PIE_DATA_JS: '42, 28, 18, 12',
    WIN_LINE_LABELS_JS: "'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'",
    WIN_LINE_DATASET_LABEL: 'Active Users (K)',
    WIN_LINE_DATA_JS: '42, 48, 55, 62, 71, 78'
  };
}

// ── Content dispatch ────────────────────────────────────────────────

function buildContent(entry, skeletonType) {
  switch (skeletonType) {
    case 'broadside-engine.html': return buildBroadsideContent(entry);
    case 'blue-professional.html': return buildBlueProfessionalContent(entry);
    case 'retro-zine.html': return buildRetroZineContent(entry);
    case 'capsule.html': return buildCapsuleContent(entry);
    case 'retro-windows.html': return buildRetroWindowsContent(entry);
    case 'product-listing.html': return buildProductContent(entry);
    case 'editorial-single-page.html':
    default: return buildEditorialContent(entry);
  }
}

// ── Main render function ───────────────────────────────────────────

function renderTemplate(entry, projectDir, overrideTokensData) {
  const tmplDir = path.join(projectDir, path.dirname(entry.template_path));
  const tokensPath = path.join(tmplDir, 'tokens.json');

  let tokensData;
  if (overrideTokensData) {
    tokensData = overrideTokensData;
  } else {
    if (!fs.existsSync(tokensPath)) {
      throw new Error('Missing tokens.json for: ' + entry.slug + '\n  Expected: ' + tokensPath);
    }
    tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  }
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
  const fontImports = buildFontImports(tokensData);
  out = out.replace('{{FONT_IMPORTS}}', fontImports);

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

module.exports = { renderTemplate, loadEntry, matchSkeleton, extractColorRoles, extractTypography, extractRadius, extractShadow, extractPageWidth, extractGutter, buildTokenCSS, buildFontImports, buildContent };

module.exports = { renderTemplate };

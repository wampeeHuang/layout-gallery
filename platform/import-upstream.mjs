import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');
const UPSTREAM_DIR = path.resolve(PROJECT_DIR, '..', '_beautiful-html-templates', 'templates');
const TEMPLATES_DIR = path.join(PROJECT_DIR, 'templates');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');

// Already imported slugs
const EXISTING = new Set([
  '8-bit-orbit', 'biennale-yellow', 'pink-script', 'soft-editorial', 'studio',
  'template', 'template-swiss', 'brutalist-paper', 'layout-gallery'
]);

// ── Helpers ─────────────────────────────────────────────────────

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

function guessRole(name, value) {
  const n = name.toLowerCase();
  const v = value.toLowerCase();

  // ── Color roles ─────────────────────────────────────────────
  if (n.match(/color-primary|--primary\b|accent|--brand/)) return 'accent';
  if (n.match(/color-secondary/)) return 'accent-alt';

  // Surface / background
  if (n.match(/surface|bg\b|background|paper|canvas|cream|offwhite|white|--light\b/)) {
    if (n.match(/container|card|alt|2|dk|deep|tint|variant/)) return 'surface-card';
    return 'surface-bg';
  }

  // Text / ink
  if (n.match(/on-surface|ink\b|text\b|foreground|black\b|dark\b|near-black/)) {
    if (n.match(/variant|secondary|2|3|soft|muted|dim|alt/)) return 'text-secondary';
    return 'text-primary';
  }

  // Border / outline
  if (n.match(/border|outline|rule|line\b|stroke|hairline/)) return 'border-default';

  // Shadow / elevation
  if (n.match(/shadow|elevation/)) return 'shadow';

  // Try to infer from value
  if (v.match(/rgba?\(/)) {
    // RGBA values are usually text-secondary, border, or surface-container
    if (v.match(/0\.[0-3]/)) return 'text-tertiary';
    return 'text-secondary';
  }
  if (v.match(/#[0-9a-fA-F]{3,6}/)) {
    const hex = v.match(/#([0-9a-fA-F]{3,6})/)[1];
    const full = hex.length === 3 ? hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2] : hex;
    const r = parseInt(full.slice(0,2), 16);
    const g = parseInt(full.slice(2,4), 16);
    const b = parseInt(full.slice(4,6), 16);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 240) return 'surface-bg';
    if (lum > 200) return 'surface-container';
    if (lum < 40) return 'text-primary';
    if (n.match(/grey|gray|neutral|muted/)) return 'text-secondary';
    if (lum > 128) return 'surface-light-alt';
    return 'accent';
  }

  return 'unknown';
}

function guessTypeRole(name) {
  const n = name.toLowerCase();
  if (n.match(/display|hero|giant|huge|--sz-display/)) return 'display-font';
  if (n.match(/body|text|base/)) return 'body-font';
  if (n.match(/mono|code/)) return 'mono-font';
  if (n.match(/display|heading|title|headline/)) return 'display-font';
  return 'body-font';
}

function guessSpacingRole(name) {
  const n = name.toLowerCase();
  if (n.match(/page-wmax|max-width|container/)) return 'content-max-width';
  if (n.match(/page-pad|pad-x|pad-y|padding/)) return 'page-padding';
  if (n.match(/gap|gutter/)) return 'element-gap';
  if (n.match(/3xl|section/)) return 'section-gap';
  if (n.match(/2xl/)) return 'large-section-gap';
  if (n.match(/xl|component/)) return 'component-gap';
  if (n.match(/lg|card/)) return 'card-padding';
  return 'spacing';
}

function guessSizeRole(name) {
  const n = name.toLowerCase();
  if (n.match(/3xl|display|hero|giant/)) return 'display-size';
  if (n.match(/2xl|h1/)) return 'h1-size';
  if (n.match(/xl|h2/)) return 'h2-size';
  if (n.match(/base|body|text-base/)) return 'body-size';
  if (n.match(/sm|caption/)) return 'caption-size';
  if (n.match(/xs|label/)) return 'label-size';
  return 'size-token';
}

function extractFontFamilies(vars) {
  for (const [k, v] of Object.entries(vars)) {
    if (k.match(/font-display|display-font|heading-font|title-font/)) return v;
  }
  return null;
}
function extractBodyFont(vars) {
  for (const [k, v] of Object.entries(vars)) {
    if (k.match(/font-body|body-font|text-font/)) return v;
  }
  return null;
}
function extractMonoFont(vars) {
  for (const [k, v] of Object.entries(vars)) {
    if (k.match(/font-mono|mono-font|code-font/)) return v;
  }
  return null;
}

// ── Main import logic ───────────────────────────────────────────

function importTemplate(slug) {
  const srcDir = path.join(UPSTREAM_DIR, slug);
  const dstDir = path.join(TEMPLATES_DIR, slug);

  if (!fs.existsSync(srcDir)) {
    console.log(`  SKIP: source not found for ${slug}`);
    return null;
  }

  const tmplJsonPath = path.join(srcDir, 'template.json');
  const tmplHtmlPath = path.join(srcDir, 'template.html');
  const designMdPath = path.join(srcDir, 'design.md');

  if (!fs.existsSync(tmplJsonPath) || !fs.existsSync(tmplHtmlPath)) {
    console.log(`  SKIP: missing template.json or template.html for ${slug}`);
    return null;
  }

  const meta = JSON.parse(fs.readFileSync(tmplJsonPath, 'utf-8'));
  const html = fs.readFileSync(tmplHtmlPath, 'utf-8');
  const vars = extractRootVars(html);

  // ── Build brand.json ──────────────────────────────────────────

  const colors = [];
  const typography = [];
  const radius = [];
  const shadow = [];
  const motion = [];

  for (const [name, value] of Object.entries(vars)) {
    const role = guessRole(name, value);

    if (name.match(/color|primary|secondary|surface|bg\b|background|paper|canvas|ink\b|text\b|foreground|black|white|cream|dark|light|border|outline|line\b|rule|shadow|elevation|grey|gray|neutral|accent|brand/)) {
      if (role === 'shadow') {
        shadow.push({ name, value, role, description: '' });
      } else {
        colors.push({ name, value, role, description: '' });
      }
    } else if (name.match(/font|typography/)) {
      typography.push({ name, value, role: guessTypeRole(name), description: '' });
    } else if (name.match(/radius/)) {
      radius.push({ name, value, role: 'radius', description: '' });
    } else if (name.match(/ease|duration|motion|transition/)) {
      motion.push({ name, value, role: name.match(/ease/) ? 'easing' : 'duration', description: '' });
    }
  }

  // Build colorRoles summary
  const findColor = (role) => {
    const c = colors.find(t => t.role === role);
    return c ? c.value : undefined;
  };

  const brand = {
    slug,
    kind: 'brand',
    version: 1,
    source: `导入自 beautiful-html-templates/${slug} — ${meta.tagline || ''}`,
    tokens: { color: colors, typography, radius, shadow, motion },
    colorRoles: {
      primary: findColor('accent') || colors[0]?.value || '#000000',
      secondary: findColor('accent-alt') || findColor('text-secondary') || '#666666',
      background: findColor('surface-bg') || '#FFFFFF',
      surface: findColor('surface-card') || '#F5F5F5',
      text: findColor('text-primary') || '#000000',
      textSecondary: findColor('text-secondary') || 'rgba(0,0,0,0.6)',
      border: findColor('border-default') || 'rgba(0,0,0,0.12)',
    },
  };

  // ── Build layout.json ─────────────────────────────────────────

  const spacing = [];
  const typeScale = [];

  for (const [name, value] of Object.entries(vars)) {
    if (name.match(/space|spacing|gap|gutter|pad|margin/)) {
      spacing.push({ name, value, role: guessSpacingRole(name), description: '' });
    } else if (name.match(/text-\d|font-size|fs-|sz-/)) {
      typeScale.push({ name, value, role: guessSizeRole(name), description: '' });
    }
  }

  const layout = {
    slug,
    kind: 'layout',
    version: 1,
    source: `导入自 beautiful-html-templates/${slug}`,
    tokens: { typography: typeScale, spacing },
    typeScale: typeScale.length > 0 ? typeScale : undefined,
    spacingScale: spacing.length > 0 ? spacing.map(s => ({ name: s.name, value: s.value })) : undefined,
  };

  // ── Write files ───────────────────────────────────────────────

  fs.mkdirSync(dstDir, { recursive: true });
  fs.copyFileSync(tmplHtmlPath, path.join(dstDir, 'template.html'));
  if (fs.existsSync(designMdPath)) {
    fs.copyFileSync(designMdPath, path.join(dstDir, 'design.md'));
  }
  fs.writeFileSync(path.join(dstDir, 'brand.json'), JSON.stringify(brand, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dstDir, 'layout.json'), JSON.stringify(layout, null, 2), 'utf-8');

  // ── Build registry entry ──────────────────────────────────────

  const entry = {
    slug,
    name: meta.name || slug,
    tagline: meta.tagline || '',
    template_type: 'single-page',
    design_style: meta.tone?.[0] || 'editorial',
    scheme: meta.scheme || 'light',
    formality: meta.formality || 'medium',
    density: meta.density || 'medium',
    mood: meta.mood || [],
    palette: (meta.palette && !Array.isArray(meta.palette) && typeof meta.palette === 'object')
      ? Object.entries(meta.palette)
          .filter(([k]) => k !== 'description')
          .slice(0, 6)
          .map(([k, v]) => ({ name: k, color: v }))
      : [],
    displayFont: meta.typography?.display || extractFontFamilies(vars) || 'Inter',
    bodyFont: meta.typography?.body || extractBodyFont(vars) || 'Noto Sans SC',
    typography_style: meta.typography?.style || 'modern',
    best_for: meta.best_for ? [meta.best_for] : (meta.occasion || []).slice(0, 3),
    avoid_for: meta.avoid_for ? [meta.avoid_for] : [],
    features: [],
    css_variables: Object.entries(vars).map(([name, value]) => ({ name, value })),
    visibility: 'public',
    status: 'active',
    template_path: `templates/${slug}/template.html`,
    skill: '_growth',
    slide_count: meta.slide_count || 0,
  };

  return entry;
}

// ── Run ─────────────────────────────────────────────────────────

const upstreamDirs = fs.readdirSync(UPSTREAM_DIR)
  .filter(f => fs.statSync(path.join(UPSTREAM_DIR, f)).isDirectory());

const newSlugs = upstreamDirs.filter(s => !EXISTING.has(s));

console.log(`Found ${upstreamDirs.length} upstream templates`);
console.log(`Already imported: ${[...EXISTING].length}`);
console.log(`New to import: ${newSlugs.length}\n`);

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
const imported = [];

for (const slug of newSlugs) {
  process.stdout.write(`${slug}... `);
  try {
    const entry = importTemplate(slug);
    if (entry) {
      const idx = registry.findIndex(e => e.slug === slug);
      if (idx >= 0) registry[idx] = entry;
      else registry.push(entry);
      imported.push(slug);
      console.log('OK');
    }
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
  }
}

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

console.log(`\nImported: ${imported.length}/${newSlugs.length}`);
console.log(`Registry: ${registry.length} entries`);

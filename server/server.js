const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderBrandKit } = require('./brand-renderer');
const { readManifest } = require('../scripts/template-package.cjs');
const { generateRoot } = require('../scripts/tokens-to-css.cjs');

const app = express();
const PORT = process.env.PORT || 3080;
const PROJECT_DIR = path.resolve(__dirname, '..');
const ENABLE_GROW = process.env.ENABLE_GROW === 'true';

// ── Startup audit ───────────────────────────────────────────────

function startupAudit() {
  try {
    const registryPath = path.join(PROJECT_DIR, 'data', 'registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const total = registry.length;
    let hasTokens = 0;
    for (const entry of registry) {
      if (!entry.template_path) continue;
      const dir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
      if (fs.existsSync(path.join(dir, 'tokens.json'))) hasTokens++;
    }
    console.log(`[Startup audit] ${total} templates | tokens.json: ${hasTokens}/${total}`);
  } catch (e) {
    console.warn('[Startup audit] skipped: ' + e.message);
  }
}

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.json());

// ── API ──────────────────────────────────────────────────────

const registryPath = path.join(PROJECT_DIR, 'data', 'registry.json');
const taxonomyPath = path.join(PROJECT_DIR, 'data', 'taxonomy.json');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

function loadTaxonomy() {
  try { return JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8')); } catch (_) { return null; }
}

function loadTokensFor(entry) {
  if (!entry.template_path) return null;
  const dir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  const p = path.join(dir, 'tokens.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch (_) { return null; }
}

// 从 tokens.json 派生视觉值展示（palette 色点 / 六色系统 / 排版尺度 / 字体栈）
// 真相源是 tokens.json，registry 不再存这些副本。
function deriveVisuals(tokensData) {
  const empty = { palette: [], color_system: null, typography_scale: null, displayFont: null, bodyFont: null };
  if (!tokensData || !tokensData.tokens) return empty;
  const colors = tokensData.tokens.color || [];
  const typography = tokensData.tokens.typography || [];

  const palette = colors
    .filter(t => t.$type === 'color')
    .slice(0, 8)
    .map(t => ({ name: String(t.name || '').replace(/^--/, ''), color: t.value }));

  const stdKeys = ['--color-primary', '--color-secondary', '--color-surface', '--color-on-surface'];
  const colorParts = stdKeys
    .map(k => colors.find(c => c.name === k))
    .filter(Boolean)
    .map(t => `${t.name.replace(/^--/, '')}: ${t.value}`);
  const color_system = colorParts.length ? colorParts.join('; ') : null;

  const scale = typography
    .filter(t => t.role === 'type-scale')
    .map(t => `${String(t.name || '').replace(/^--sz-/, '')}: ${t.value}`);
  const typography_scale = scale.length ? scale.join('; ') : null;

  const display = typography.find(t => t.role === 'display-font');
  const body = typography.find(t => t.role === 'body-font');
  const displayFont = display ? display.value : null;
  const bodyFont = body ? body.value : null;

  return { palette, color_system, typography_scale, displayFont, bodyFont };
}

function isBrandKitReady(entry) {
  if (!entry.template_path) return false;
  const dir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  return fs.existsSync(path.join(dir, 'tokens.json'))
      || (fs.existsSync(path.join(dir, 'brand.json')) && fs.existsSync(path.join(dir, 'layout.json')));
}

function packageProjection(entry) {
  try {
    const info = readManifest(PROJECT_DIR, entry.template_path, entry);
    const manifest = info.manifest || {};
    return {
      quality_tier: manifest.lifecycle?.qualityTier || null,
      exposure: manifest.lifecycle?.exposure || null,
      lifecycle_state: manifest.lifecycle?.state || null,
      taxonomy: manifest.taxonomy || null,
      cover: `/generated/${entry.slug}/cover.webp`,
      mobile_proof: `/generated/${entry.slug}/mobile.webp`,
      detail_url: `/templates/${entry.slug}/`,
    };
  } catch (_) {
    return { quality_tier: null, exposure: null, lifecycle_state: null, taxonomy: null };
  }
}

// GET /api/registry — query + filter
app.get('/api/registry', (req, res) => {
  let items = loadRegistry();
  const isPublic = process.env.VERCEL || process.env.PUBLIC_MODE;

  const filters = {
    visual_family: req.query.visual_family,
    content_type: req.query.content_type,
    scheme: req.query.scheme,
    formality: req.query.formality,
    density: req.query.density,
    skill: req.query.skill,
    q: req.query.q,
  };

  if (isPublic) {
    items = items.filter(e => e.visibility === 'public');
  }

  if (filters.scheme) items = items.filter(e => e.scheme === filters.scheme);
  if (filters.formality) items = items.filter(e => e.formality === filters.formality);
  if (filters.density) items = items.filter(e => e.density === filters.density);
  if (filters.skill) items = items.filter(e => e.skill === filters.skill);

  // Enrich with derived visuals + brand readiness
  const enriched = items.map(e => {
    const projection = packageProjection(e);
    return {
      ...e,
      ...projection,
      ...deriveVisuals(loadTokensFor(e)),
      brand_kit_ready: isBrandKitReady(e),
      html_api: '/api/template/' + e.slug + '/html'
    };
  });

  // Apply taxonomy filters (post-merge)
  let result = enriched;
  if (filters.visual_family) result = result.filter(e => e.visual_family === filters.visual_family);
  if (filters.content_type) result = result.filter(e => e.content_type === filters.content_type);

  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.tagline || '').toLowerCase().includes(q) ||
      (e.tone || []).some(m => m.toLowerCase().includes(q)) ||
      (e.visual_family || '').toLowerCase().includes(q)
    );
  }

  res.json({ count: result.length, items: result });
});

// GET /api/template/:slug — single template detail
app.get('/api/template/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json({ ...entry, ...packageProjection(entry), brand_kit_ready: isBrandKitReady(entry), html_api: '/api/template/' + entry.slug + '/html' });
});

// GET /api/template/:slug/html — raw template HTML
app.get('/api/template/:slug/html', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const tmplPath = path.join(PROJECT_DIR, entry.template_path);
  if (!fs.existsSync(tmplPath)) return res.status(404).json({ error: 'template file not found' });
  res.sendFile(tmplPath);
});

// GET /api/taxonomy — label system
app.get('/api/taxonomy', (req, res) => {
  const tx = loadTaxonomy();
  if (!tx) return res.status(404).json({ error: 'taxonomy.json not found' });
  res.json(tx);
});

// GET /api/design-styles — list all visual_family values with counts
app.get('/api/design-styles', (req, res) => {
  const items = loadRegistry();
  const map = {};
  items.forEach(e => {
    if (e.status === 'placeholder') return;
    if (!e.visual_family) return;
    map[e.visual_family] = (map[e.visual_family] || 0) + 1;
  });
  res.json(Object.entries(map).map(([name, count]) => ({ name, count })));
});

// GET /api/brand/:slug — brand kit structured data
app.get('/api/brand/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const tmplPath = path.join(PROJECT_DIR, entry.template_path);
  const html = fs.readFileSync(tmplPath, 'utf-8');
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  const tokens = {};
  if (rootMatch) {
    const re = /--([\w-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(rootMatch[1])) !== null) {
      tokens['--' + m[1]] = m[2].trim();
    }
  }

  const visuals = deriveVisuals(loadTokensFor(entry));

  res.json({
    slug: entry.slug,
    name: entry.name,
    tagline: entry.tagline,
    visual_family: entry.visual_family || null,
    content_type: entry.content_type || null,
    tone: entry.tone || [],
    scheme: entry.scheme,
    formality: entry.formality,
    density: entry.density,
    palette: visuals.palette,
    typography: { displayFont: visuals.displayFont, bodyFont: visuals.bodyFont },
    best_for: entry.best_for,
    avoid_for: entry.avoid_for,
    features: entry.features,
    tokens,
  });
});

// GET /api/prompt — AI prompt text
app.get('/api/prompt', (req, res) => {
  const promptPath = path.join(PROJECT_DIR, 'data', 'ai-system-prompt.md');
  if (!fs.existsSync(promptPath)) return res.status(404).json({ error: 'ai-system-prompt.md not found' });
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(promptPath);
});

// GET /api/template/:slug/audit — Token role coverage audit
app.get('/api/template/:slug/audit', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const dir = path.join(PROJECT_DIR, path.dirname(entry.template_path || ''));
  const tokensPath = path.join(dir, 'tokens.json');
  if (!fs.existsSync(tokensPath)) return res.json({ ok: false, reason: 'no tokens.json' });

  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const allTokens = [];
  for (const group of Object.values(tokens.tokens || {})) {
    allTokens.push(...group);
  }
  res.json({ ok: true, slug: entry.slug, tokenCount: allTokens.length, groups: Object.keys(tokens.tokens || {}) });
});

// GET /api/token-contract — Token naming standard JSON
app.get('/api/token-contract', (req, res) => {
  const contractPath = path.join(PROJECT_DIR, 'schemas', 'token-contract.json');
  if (!fs.existsSync(contractPath)) return res.status(404).json({ error: 'token-contract.json not found' });
  res.sendFile(contractPath);
});

// GET /api/template/:slug/tokens — raw token key-value pairs
app.get('/api/template/:slug/tokens', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const tmplPath = path.join(PROJECT_DIR, entry.template_path);
  if (!fs.existsSync(tmplPath)) return res.status(404).json({ error: 'template file not found' });

  const html = fs.readFileSync(tmplPath, 'utf-8');
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  const tokens = {};
  if (rootMatch) {
    const re = /--([\w-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(rootMatch[1])) !== null) {
      tokens['--' + m[1]] = m[2].trim();
    }
  }
  res.json(tokens);
});

app.get('/brand/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  try {
    const generated = path.join(PROJECT_DIR, 'generated', entry.slug, 'brand.html');
    const enriched = { ...entry, ...deriveVisuals(loadTokensFor(entry)) };
    const html = fs.existsSync(generated) ? fs.readFileSync(generated, 'utf8') : renderBrandKit(enriched, PROJECT_DIR);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html);
  } catch (err) {
    console.error('Brand kit render error:', err);
    res.status(500).json({ error: 'render failed', detail: err.message });
  }
});

app.get('/templates/:slug/', (req, res) => {
  const entry = loadRegistry().find(item => item.slug === req.params.slug);
  if (!entry) return res.status(404).send('Template not found');
  const projection = packageProjection(entry);
  if (projection.exposure !== 'listed') return res.status(404).send('Template is not publicly listed');
  const { manifest } = readManifest(PROJECT_DIR, entry.template_path, entry);
  const escHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let html = fs.readFileSync(path.join(PROJECT_DIR, 'public', 'template-detail.html'), 'utf8');
  const replacements = {
    SLUG: manifest.slug, NAME: manifest.name, TAGLINE: manifest.tagline || entry.tagline || '',
    TIER: manifest.lifecycle.qualityTier, FAMILY: manifest.taxonomy.visualFamily,
    TYPE: manifest.taxonomy.templateType, CONTENT: manifest.taxonomy.contentType,
    COVER: projection.cover, MOBILE: projection.mobile_proof,
    PREVIEW: `/${entry.template_path}`, BRAND: `/brand/${entry.slug}/`,
    REPORT: manifest.quality.report ? `/${manifest.quality.report}` : '',
  };
  for (const [key, value] of Object.entries(replacements)) html = html.replaceAll(`{{${key}}}`, escHtml(value));
  servePage(res, path.join(PROJECT_DIR, 'public', 'template-detail.html'), galleryTokensDir, 'library', html);
});

// GET /learn — knowledge base hub
app.get('/learn', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'public', 'learn.html'), galleryTokensDir, 'learn');
});

// GET /learn/articles/:slug — 设计方法论文章（build-time 由 scripts/generate-articles.mjs 生成）
const ARTICLE_SLUGS = new Set(['delivery-standard', 'visual-quality', 'design-token', 'anti-ai-slop']);
app.get('/learn/articles/:slug', (req, res, next) => {
  const { slug } = req.params;
  if (!ARTICLE_SLUGS.has(slug)) return next(); // 非文章 slug（如 .svg 静态资源）放行给 express.static
  const filePath = path.join(PROJECT_DIR, 'public', 'learn', 'articles', slug + '.html');
  servePage(res, filePath, galleryTokensDir, 'learn');
});

// GET /grow — AI extraction
app.get('/grow', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'public', 'grow.html'), galleryTokensDir, 'grow');
});

// GET /agentos — public AgentOS case-study / product narrative
app.get(['/agentos', '/agentos/'], (req, res) => {
  const filePath = path.join(PROJECT_DIR, 'public', 'agentos', 'index.html');
  if (!fs.existsSync(filePath)) return res.status(404).send('AgentOS page not found');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(filePath);
});

// POST /api/grow — SSE growth pipeline
app.post('/api/grow', (req, res) => {
  if (!ENABLE_GROW) return res.status(503).json({ error: 'Growth pipeline is disabled. Set ENABLE_GROW=true to enable.' });
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is empty' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const { runPipeline } = require('../growth/growth-agent');

  runPipeline(url, {
    onProgress(ev) {
      res.write('data:' + JSON.stringify(ev) + '\n\n');
    },
    onError(err) {
      res.write('data:' + JSON.stringify({ step: 'error', status: 'error', error: err.message, timestamp: Date.now() }) + '\n\n');
    },
  }).then(result => {
    res.write('data:' + JSON.stringify({ step: 'done', status: 'done', ok: result.ok, slug: result.slug, error: result.error, timestamp: Date.now() }) + '\n\n');
    res.end();
  }).catch(err => {
    res.write('data:' + JSON.stringify({ step: 'error', status: 'error', error: err.message, timestamp: Date.now() }) + '\n\n');
    res.end();
  });
});

// POST /api/grow/approve — register to registry.json
app.post('/api/grow/approve', (req, res) => {
  if (!ENABLE_GROW) return res.status(503).json({ error: 'Growth pipeline is disabled.' });
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug is empty' });

  const growthDir = path.join(PROJECT_DIR, 'templates', '_growth', slug);
  const tokensPath = path.join(growthDir, 'tokens.json');
  const tmplPath = path.join(growthDir, 'template.html');

  if (!fs.existsSync(tokensPath) || !fs.existsSync(tmplPath)) {
    return res.status(404).json({ error: 'template files not found: ' + growthDir });
  }

  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  const colorTokens = tokens.tokens?.color || [];
  const bg = colorTokens.find(t => t.role === 'surface-bg');
  const bgIsDark = bg && bg.value.match(/#([0-9a-fA-F]{3,6})/) && parseInt(bg.value.match(/#([0-9a-fA-F]{3,6})/)[1], 16) < 0x808080;
  const scheme = bgIsDark ? 'dark' : 'light';

  const spacings = tokens.tokens?.spacing || [];
  const density = spacings.length <= 3 ? 'low' : spacings.length <= 5 ? 'medium' : 'high';

  const metaPath = path.join(growthDir, '.growth-meta.json');
  let growthMeta = {};
  if (fs.existsSync(metaPath)) {
    try { growthMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch (_) {}
  }

  const entry = {
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    tagline: 'Growth Agent auto-extract · ' + new Date().toISOString().slice(0, 10),
    visual_family: growthMeta.visual_family || null,
    content_type: growthMeta.content_type || null,
    tone: growthMeta.tone || [],
    scheme,
    formality: 'medium',
    density,
    best_for: ['brand landing page'],
    avoid_for: [],
    features: [],
    visibility: 'public',
    status: 'active',
    template_path: 'templates/' + slug + '/template.html',
    skill: '_growth',
  };

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  const idx = registry.findIndex(e => e.slug === slug);
  if (idx >= 0) {
    registry[idx] = { ...registry[idx], ...entry };
  } else {
    registry.push(entry);
  }
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');

  res.json({ ok: true, entry });
});

// POST /api/grow/reject — cleanup temp files
app.post('/api/grow/reject', (req, res) => {
  if (!ENABLE_GROW) return res.status(503).json({ error: 'Growth pipeline is disabled.' });
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug is empty' });

  const growthDir = path.join(PROJECT_DIR, 'templates', '_growth', slug);
  if (fs.existsSync(growthDir)) {
    fs.rmSync(growthDir, { recursive: true, force: true });
    res.json({ ok: true, removed: growthDir });
  } else {
    res.json({ ok: true, note: 'directory does not exist, nothing to clean' });
  }
});

// ── Page serving with injection ─────────────────────────────

// ── Inline token loading (replaces sync-roots.js) ─────────────

function loadTokens(tmplDir) {
  const tokensPath = path.join(tmplDir, 'tokens.json');
  if (fs.existsSync(tokensPath)) {
    return JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  }
  return null;
}

const galleryTokensDir = path.join(PROJECT_DIR, 'templates', 'layout-gallery');
const navHTML = fs.readFileSync(path.join(PROJECT_DIR, 'server', 'nav.html'), 'utf-8');
const footerHTML = fs.readFileSync(path.join(PROJECT_DIR, 'server', 'footer.html'), 'utf-8');

function servePage(res, filePath, tokensDir, activeNav, preparedHtml) {
  let html = preparedHtml || fs.readFileSync(filePath, 'utf-8');
  html = html.replace('<style>', '<style data-turbo-track="dynamic">');
  if (tokensDir) {
    const tokens = loadTokens(tokensDir);
    if (tokens) html = html.replace('<!-- ROOT_INJECT -->', generateRoot(tokens.tokens));
  }
  html = html.replace('<!-- NAV_INJECT -->', navHTML);
  html = html.replace('<!-- FOOTER_INJECT -->', footerHTML);
  if (activeNav) {
    html = html.replace('data-nav="' + activeNav + '"', 'data-nav="' + activeNav + '" class="active"');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

// GET / — gallery landing
app.get('/', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'public', 'index.html'), galleryTokensDir, 'home');
});

// GET /library — template library
app.get('/library', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'public', 'library.html'), galleryTokensDir, 'library');
});

// ── Static Files ─────────────────────────────────────────────

app.use(express.static(PROJECT_DIR));

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Layout Gallery -> http://localhost:${PORT}`);
  const items = loadRegistry();
  const publicCount = items.filter(e => e.visibility === 'public' && e.status !== 'placeholder').length;
  console.log(`  ${items.length} templates (${publicCount} public)`);
  startupAudit();
});

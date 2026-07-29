const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderBrandKit } = require('./scripts/brand-renderer');

const app = express();
const PORT = process.env.PORT || 3080;
const PROJECT_DIR = __dirname;

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.json());

// ── API ──────────────────────────────────────────────────────

const registryPath = path.join(PROJECT_DIR, 'registry.json');

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

// GET /api/registry — query + filter
app.get('/api/registry', (req, res) => {
  let items = loadRegistry();
  const isPublic = process.env.VERCEL || process.env.PUBLIC_MODE;

  const filters = {
    type: req.query.type,
    design_style: req.query.design_style,
    scheme: req.query.scheme,
    formality: req.query.formality,
    density: req.query.density,
    skill: req.query.skill,
    q: req.query.q,
  };

  // Public mode: only show public templates
  if (isPublic) {
    items = items.filter(e => e.visibility === 'public');
  }

  // Filter by query params
  if (filters.type) items = items.filter(e => e.template_type === filters.type);
  if (filters.design_style) items = items.filter(e => e.design_style === filters.design_style);
  if (filters.scheme) items = items.filter(e => e.scheme === filters.scheme);
  if (filters.formality) items = items.filter(e => e.formality === filters.formality);
  if (filters.density) items = items.filter(e => e.density === filters.density);
  if (filters.skill) items = items.filter(e => e.skill === filters.skill);

  // Text search
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.tagline || '').toLowerCase().includes(q) ||
      (e.mood || []).some(m => m.toLowerCase().includes(q)) ||
      (e.design_style || '').toLowerCase().includes(q)
    );
  }

  res.json({ count: items.length, items });
});

// GET /api/template/:slug — single template detail
app.get('/api/template/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json(entry);
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

// GET /api/design-styles — list all design_style values with counts
app.get('/api/design-styles', (req, res) => {
  const items = loadRegistry();
  const map = {};
  items.forEach(e => {
    if (e.status === 'placeholder') return;
    map[e.design_style] = (map[e.design_style] || 0) + 1;
  });
  res.json(Object.entries(map).map(([name, count]) => ({ name, count })));
});

// GET /api/brand/:slug — 品牌套件结构化数据
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

  res.json({
    slug: entry.slug,
    name: entry.name,
    tagline: entry.tagline,
    design_style: entry.design_style,
    scheme: entry.scheme,
    formality: entry.formality,
    density: entry.density,
    mood: entry.mood,
    palette: entry.palette,
    typography: { displayFont: entry.displayFont, bodyFont: entry.bodyFont, style: entry.typography_style },
    best_for: entry.best_for,
    avoid_for: entry.avoid_for,
    features: entry.features,
    tokens,
    css_variables: entry.css_variables,
  });
});

// GET /api/prompt — AI 套件提示词（ai-system-prompt.md）
app.get('/api/prompt', (req, res) => {
  const promptPath = path.join(PROJECT_DIR, 'meta', 'ai-system-prompt.md');
  if (!fs.existsSync(promptPath)) return res.status(404).json({ error: 'ai-system-prompt.md not found' });
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(promptPath);
});

// GET /api/token-contract — Token 命名标准 JSON
app.get('/api/token-contract', (req, res) => {
  const contractPath = path.join(PROJECT_DIR, 'meta', 'token-contract.json');
  if (!fs.existsSync(contractPath)) return res.status(404).json({ error: 'token-contract.json not found' });
  res.sendFile(contractPath);
});

// GET /api/template/:slug/tokens — 纯 token 键值对
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

// GET /brand/:slug — 品牌套件 HTML 页
app.get('/brand/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  try {
    const html = renderBrandKit(entry, PROJECT_DIR);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Brand kit render error:', err);
    res.status(500).json({ error: 'render failed', detail: err.message });
  }
});

// GET /learn — 设计原理页
app.get('/learn', (req, res) => {
  const learnPath = path.join(PROJECT_DIR, 'meta', 'learn-template.html');
  res.sendFile(learnPath);
});

// ── Static Files ─────────────────────────────────────────────

app.use(express.static(PROJECT_DIR));

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Layout Gallery → http://localhost:${PORT}`);
  const items = loadRegistry();
  const public = items.filter(e => e.visibility === 'public' && e.status !== 'placeholder').length;
  console.log(`  ${items.length} templates (${public} public)`);
});

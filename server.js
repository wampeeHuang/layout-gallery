const express = require('express');
const fs = require('fs');
const path = require('path');

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

// ── Static Files ─────────────────────────────────────────────

app.use(express.static(PROJECT_DIR));

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Layout Gallery → http://localhost:${PORT}`);
  const items = loadRegistry();
  const public = items.filter(e => e.visibility === 'public' && e.status !== 'placeholder').length;
  console.log(`  ${items.length} templates (${public} public)`);
});

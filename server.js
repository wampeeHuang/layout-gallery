const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderBrandKit } = require('./scripts/brand-renderer');
const { validateAll } = require('./scripts/validate-templates');

const app = express();
const PORT = process.env.PORT || 3080;
const PROJECT_DIR = __dirname;

// ── Startup audit ───────────────────────────────────────────────

function startupAudit() {
  try {
    const registryPath = path.join(PROJECT_DIR, 'data', 'registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const { results } = validateAll(registry, {});
    const total = results.length;
    const ok = results.filter(r => r.ok).length;
    const hasTokens = results.filter(r => r.optional.present.includes('tokens.json')).length;
    console.log(`[启动审计] ${total} 模板 | 合约合规: ${ok}/${total} | tokens.json: ${hasTokens}/${total}`);
    const missingTokens = results.filter(r => !r.optional.present.includes('tokens.json')).map(r => r.slug);
    if (missingTokens.length > 0) {
      console.log(`[启动审计] 缺 tokens.json (${missingTokens.length}): ${missingTokens.slice(0, 8).join(', ')}${missingTokens.length > 8 ? '...' : ''}`);
    }
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      console.warn(`[启动审计] ⚠ ${failed.length} 模板不合规:`);
      failed.forEach(r => console.warn(`  ${r.slug}: ${r.required.missing.join(', ')}`));
    }
  } catch (e) {
    console.warn('[启动审计] 跳过: ' + e.message);
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

function loadRegistry() {
  return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
}

function isBrandKitReady(entry) {
  if (!entry.template_path) return false;
  const tokensPath = path.join(PROJECT_DIR, path.dirname(entry.template_path), 'tokens.json');
  return fs.existsSync(tokensPath);
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

  const enriched = items.map(e => ({
    ...e,
    brand_kit_ready: isBrandKitReady(e),
    html_api: '/api/template/' + e.slug + '/html'
  }));
  res.json({ count: enriched.length, items: enriched });
});

// GET /api/template/:slug — single template detail
app.get('/api/template/:slug', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json({ ...entry, brand_kit_ready: isBrandKitReady(entry), html_api: '/api/template/' + entry.slug + '/html' });
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

// GET /api/template/:slug/audit — Token 角色覆盖审计
app.get('/api/template/:slug/audit', (req, res) => {
  const items = loadRegistry();
  const entry = items.find(e => e.slug === req.params.slug);
  if (!entry) return res.status(404).json({ error: 'not found' });

  const { auditEntry, loadContractRoles } = require('./scripts/audit-tokens');
  const contractRoles = loadContractRoles();
  res.json(auditEntry(entry, contractRoles));
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
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html);
  } catch (err) {
    console.error('Brand kit render error:', err);
    res.status(500).json({ error: 'render failed', detail: err.message });
  }
});

// GET /learn — 知识库
app.get('/learn', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'meta', 'learn-template.html'), galleryTokensPath, 'learn');
});

// GET /grow — AI 萃取
app.get('/grow', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'grow.html'), galleryTokensPath, 'grow');
});

// POST /api/grow — SSE 生长管线
app.post('/api/grow', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL 为空' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const { runPipeline } = require('./scripts/growth-agent');

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

// POST /api/grow/approve — 注册到 registry.json
app.post('/api/grow/approve', (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug 为空' });

  const growthDir = path.join(PROJECT_DIR, 'templates', '_growth', slug);
  const tokensPath = path.join(growthDir, 'tokens.json');
  const tmplPath = path.join(growthDir, 'template.html');

  if (!fs.existsSync(tokensPath) || !fs.existsSync(tmplPath)) {
    return res.status(404).json({ error: '模板文件不存在: ' + growthDir });
  }

  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const tmplHtml = fs.readFileSync(tmplPath, 'utf-8');

  // Extract :root
  const rootMatch = tmplHtml.match(/:root\s*\{([^}]*)\}/s);
  const cssVars = [];
  if (rootMatch) {
    const re = /--([\w-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(rootMatch[1])) !== null) {
      cssVars.push({ name: '--' + m[1], value: m[2].trim() });
    }
  }

  // Extract palette from color tokens
  const colorTokens = tokens.tokens?.color || [];
  const palette = colorTokens.slice(0, 8).map(t => ({
    name: (t.description || t.name).slice(0, 20),
    color: t.value,
  }));

  // Detect style signals from tokens
  const bg = colorTokens.find(t => t.role === 'surface-bg');
  const bgIsDark = bg && bg.value.match(/#([0-9a-fA-F]{3,6})/) && parseInt(bg.value.match(/#([0-9a-fA-F]{3,6})/)[1], 16) < 0x808080;
  const scheme = bgIsDark ? 'dark' : 'light';

  // Density from spacing tokens
  const spacings = tokens.tokens?.spacing || [];
  const density = spacings.length <= 3 ? 'low' : spacings.length <= 5 ? 'medium' : 'high';

  // Read pipeline metadata (written by Step 7)
  const metaPath = path.join(growthDir, '.growth-meta.json');
  let growthMeta = { template_type: 'single-page', design_style: 'editorial' };
  if (fs.existsSync(metaPath)) {
    try { growthMeta = { ...growthMeta, ...JSON.parse(fs.readFileSync(metaPath, 'utf-8')) }; } catch (_) {}
  }

  const entry = {
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    tagline: '生长 Agent 自动提取 · ' + new Date().toISOString().slice(0, 10),
    template_type: growthMeta.template_type,
    design_style: growthMeta.design_style,
    scheme,
    formality: 'medium',
    density,
    mood: [],
    palette,
    displayFont: 'Inter',
    bodyFont: 'Noto Sans SC',
    typography_style: 'modern',
    best_for: ['品牌落地页'],
    avoid_for: [],
    features: [],
    css_variables: cssVars,
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

// POST /api/grow/reject — 清理临时文件
app.post('/api/grow/reject', (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug 为空' });

  const growthDir = path.join(PROJECT_DIR, 'templates', '_growth', slug);
  if (fs.existsSync(growthDir)) {
    fs.rmSync(growthDir, { recursive: true, force: true });
    res.json({ ok: true, removed: growthDir });
  } else {
    res.json({ ok: true, note: '目录不存在，无需清理' });
  }
});

// ── Page serving with injection ─────────────────────────────

const { generateRoot } = require('./scripts/sync-roots');
const galleryTokensPath = path.join(PROJECT_DIR, 'templates', 'layout-gallery', 'tokens.json');
const navHTML = fs.readFileSync(path.join(PROJECT_DIR, 'meta', 'nav.html'), 'utf-8');
const footerHTML = fs.readFileSync(path.join(PROJECT_DIR, 'meta', 'footer.html'), 'utf-8');
const turboScript = '<script src="https://cdn.jsdelivr.net/npm/@hotwired/turbo@8.0.12/dist/turbo.es2017-umd.js" defer data-turbo-track="reload"></script>';

function servePage(res, filePath, tokensPath, activeNav) {
  let html = fs.readFileSync(filePath, 'utf-8');
  // Turbo merges <head> across visits. Mark the page stylesheet as dynamic so
  // rules from the previous page cannot leak into the next one.
  html = html.replace('<style>', '<style data-turbo-track="dynamic">');
  // Application scripts belong in <head>; body scripts are evaluated again on
  // every Turbo visit and would install duplicate navigation lifecycles.
  html = html.replace('</head>', turboScript + '\n</head>');
  // Inject :root from tokens.json
  if (tokensPath) {
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    html = html.replace('<!-- ROOT_INJECT -->', generateRoot(tokens));
  }
  // Inject nav
  html = html.replace('<!-- NAV_INJECT -->', navHTML);
  // Inject footer
  html = html.replace('<!-- FOOTER_INJECT -->', footerHTML);
  // Mark active nav item
  if (activeNav) {
    html = html.replace('data-nav="' + activeNav + '"', 'data-nav="' + activeNav + '" class="active"');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}

// GET / — 画廊 landing
app.get('/', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'index.html'), galleryTokensPath, 'home');
});

// GET /library — 版式库
app.get('/library', (req, res) => {
  servePage(res, path.join(PROJECT_DIR, 'library.html'), galleryTokensPath, 'library');
});

// ── Static Files ─────────────────────────────────────────────

app.use(express.static(PROJECT_DIR));

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Layout Gallery → http://localhost:${PORT}`);
  const items = loadRegistry();
  const public = items.filter(e => e.visibility === 'public' && e.status !== 'placeholder').length;
  console.log(`  ${items.length} templates (${public} public)`);
  startupAudit();
});

const fs = require('fs');
const path = require('path');

// ── Token contract fallback lookup ──────────────────────────────
// Single source of truth: token-contract.json defines default values
// per role. When a template lacks a token, renderer reads from contract,
// never hardcodes.

function loadFallbackMap(projectDir) {
  const contractPath = path.join(projectDir, 'meta', 'token-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  const map = {};
  for (const cat of Object.values(contract.categories)) {
    for (const role of cat.roles) {
      map[role.role] = role.fallback;
    }
  }
  return map;
}

// Standard CSS variable vocabulary — enforced by validate-templates.js.
// These are the ONLY names renderer reads directly. Domain names
// (--ink, --oxide) are deprecated; the fallback chain is soft landing
// for unmigrated templates.
const STD = {
  color: {
    bg: '--bg', surface: '--surface', text: '--text',
    textSecondary: '--text-soft', border: '--line',
    accent: '--accent', accentAlt: '--accent-alt', accentHover: '--accent-hover'
  },
  typography: {
    display: '--font-display', body: '--font-body', mono: '--font-mono'
  },
  spacing: {
    pageW: '--page-wmax', pagePad: '--page-pad', gap: '--gap', gutter: '--gutter'
  },
  radius: { default: '--radius' },
  shadow: { sm: '--shadow-sm', md: '--shadow-md' },
  motion: { ease: '--ease-default', duration: '--duration-base' }
};

function renderBrandKit(entry, projectDir) {
  const fb = loadFallbackMap(projectDir);
  const tmplPath = path.join(projectDir, entry.template_path);
  const html = fs.readFileSync(tmplPath, 'utf-8');

  // ── Token data: tokens.json required (一源双端, no fallback) ──
  const tokensPath = path.join(path.dirname(tmplPath), 'tokens.json');
  if (!fs.existsSync(tokensPath)) {
    throw new Error('Missing tokens.json for template: ' + entry.slug + '\n  Expected: ' + tokensPath + '\n  Every template MUST have tokens.json — 一源双端 hard requirement.');
  }
  const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const vars = flattenTokens(tokensData);
  const tokensByGroup = groupTokensFromData(tokensData);

  // ── Layer 2: Auto-derive standard aliases from brandKit.colorRoles ──
  // Templates define domain tokens (--ink, --paper). Renderer injects standard
  // names (--accent, --bg) so brand page :root and buildPalette() resolve
  // without requiring duplicate alias entries in tokens.json.
  // colorRoles → CSS var mapping is the standard contract. Single source of truth.
  const cr = (tokensData.brandKit && tokensData.brandKit.colorRoles) ? tokensData.brandKit.colorRoles : {};
  const ROLE_TO_VAR = {
    primary: '--accent', secondary: '--accent-alt',
    background: '--bg', text: '--text',
    textSecondary: '--text-soft', border: '--line', surface: '--surface'
  };
  for (const [role, varName] of Object.entries(ROLE_TO_VAR)) {
    if (cr[role] && !vars[varName]) vars[varName] = cr[role];
  }

  const P = buildPalette(entry, vars, fb);
  const T = buildTypography(entry, vars, fb);
  const assets = extractTemplateAssets(html, P, vars);

  let out = fs.readFileSync(path.join(projectDir, 'meta', 'brand-template.html'), 'utf-8');

  // ── CSS :root values (no HTML escaping — these go into <style> context) ──
  out = out.replace(/\{\{FONT_SANS\}\}/g, T.body);
  out = out.replace(/\{\{FONT_SERIF\}\}/g, T.display);
  out = out.replace(/\{\{FONT_MONO\}\}/g, T.mono);
  out = out.replace(/\{\{BG\}\}/g, P.bg);
  out = out.replace(/\{\{BG_CARD\}\}/g, P.bgCard);
  out = out.replace(/\{\{TEXT\}\}/g, P.text);
  out = out.replace(/\{\{TEXT_SECONDARY\}\}/g, P.textSecondary);
  out = out.replace(/\{\{TEXT_MUTED\}\}/g, P.textMuted);
  out = out.replace(/\{\{BORDER\}\}/g, P.border);
  out = out.replace(/\{\{ACCENT\}\}/g, P.accent);
  out = out.replace(/\{\{ACCENT_HOVER\}\}/g, P.accentHover);
  // Derive radius from template: explicit token → hardcoded CSS → contract fallback (sharp=0px)
  const radius = vars['--radius']
    || (assets.implicit.radius.length > 0 ? assets.implicit.radius[0] : null)
    || fb['sharp'];
  out = out.replace(/\{\{RADIUS\}\}/g, radius);
  out = out.replace(/\{\{SHADOW_SM\}\}/g, vars['--shadow-sm'] || fb['default']);
  out = out.replace(/\{\{SHADOW_MD\}\}/g, vars['--shadow-md'] || fb['card-hover']);
  // accent at 10% opacity for token-note backgrounds (brand-page UI constant, not a token)
  const accent10 = hexToRgba(P.accent, 0.1);
  out = out.replace(/\{\{ACCENT_10\}\}/g, accent10);

  // ── Brand kit type scale & spacing (from tokens.json brandKit section) ──
  const brandKit = tokensData.brandKit || {};
  if (brandKit.typeScale) {
    out = out.replace(/\{\{TYPE_SCALE_VARS\}\}/g, brandKit.typeScale.map(t => t.name + ':' + (t.size || t.value)).join(';') + ';');
  }
  if (brandKit.spacingScale) {
    const bkSpacing = brandKit.spacingScale.map(t => t.name + ':' + t.value).join(';');
    const tokenSpacing = (tokensByGroup.Spacing || tokensByGroup.spacing || []).map(t => t.name + ':' + t.value).join(';');
    out = out.replace(/\{\{SPACING_VARS\}\}/g, bkSpacing + ';' + tokenSpacing + ';');
  }
  if (brandKit.components) {
    out = out.replace(/\{\{BRAND_COMPONENT_VARS\}\}/g, Object.entries(brandKit.components).map(([k, v]) => k + ':' + v).join(';') + ';');
  }

  // ── Inject template domain color tokens into brand page :root ──
  // So var(--ink), var(--paper) etc. resolve natively in browser.
  // Standard aliases (--accent, --bg) already handled by colorRoles augmentation.
  const colorVars = (tokensByGroup.Color || []).map(t => t.name + ':' + t.value).join(';');
  out = out.replace(/\{\{TEMPLATE_COLOR_VARS\}\}/g, colorVars ? colorVars + ';' : '');

  // ── Page layout vars from tokens.json spacing ──
  out = out.replace(/\{\{PAGE_WMAX\}\}/g, vars[STD.spacing.pageW] || '1200px');
  out = out.replace(/\{\{PAGE_PAD\}\}/g, vars[STD.spacing.pagePad] || '32px');

  // ── Template heading typography overrides ──
  // Extract only font-family from template styles. Font-size/line-height/letter-spacing
  // stay with brand-template.html's own layout — the brand-kit is a spec sheet, not a poster.
  let headingOverrides = '';
  if (assets.h1Style) {
    const h1FF = (assets.h1Style.match(/font-family\s*:\s*([^;]+);/) || [])[1];
    headingOverrides += '.bk-hero h1{' + (h1FF ? 'font-family:' + h1FF + ';' : '') + 'font-weight:700}\n';
  }
  if (assets.h2Style) {
    const h2FF = (assets.h2Style.match(/font-family\s*:\s*([^;]+);/) || [])[1];
    headingOverrides += '.bk-section h2{' + (h2FF ? 'font-family:' + h2FF + ';' : '') + 'font-weight:700}\n';
  }
  out = out.replace(/\{\{HEADING_OVERRIDES\}\}/g, headingOverrides);

  // ── Hero ──
  out = out.replace(/\{\{TEMPLATE_NAME\}\}/g, esc(entry.name));
  out = out.replace(/\{\{TAGLINE\}\}/g, esc(entry.tagline || ''));
  out = out.replace(/\{\{EYEBROW_TEXT\}\}/g, esc(styleLabel(entry.design_style) + ' · 设计基因套件'));
  out = out.replace(/\{\{MOOD_CHIPS\}\}/g, buildMoodChips(entry, P));

  // ── Overview ──
  out = out.replace(/\{\{OVERVIEW_DESC\}\}/g, esc(buildOverview(entry)));
  out = out.replace(/\{\{BEST_FOR\}\}/g, esc(entry.best_for || '—'));
  out = out.replace(/\{\{AVOID_FOR\}\}/g, esc(entry.avoid_for || '—'));
  out = out.replace(/\{\{DESIGN_DNA\}\}/g, esc(buildDNA(entry)));

  // ── Colors ──
  const seed = findSeed(P);
  out = out.replace(/\{\{SEED_NAME\}\}/g, esc(seed.name));
  out = out.replace(/\{\{SEED_HEX\}\}/g, esc(seed.hex));
  out = out.replace(/\{\{SEED_ROLE\}\}/g, esc(seed.role || '主强调色'));
  out = out.replace(/\{\{COLOR_DESC\}\}/g, esc(buildColorDesc(entry, P)));
  out = out.replace(/\{\{COLOR_PREVIEW_CARDS\}\}/g, buildColorPreviewCards(P));
  out = out.replace(/\{\{COLOR_TOKEN_GRID\}\}/g, buildColorTokenGrid(tokensByGroup));

  // ── Typography ──
  out = out.replace(/\{\{TYPOGRAPHY_DESC\}\}/g, esc(buildTypeDesc(entry, T)));
  out = out.replace(/\{\{TYPE_SPECIMEN_ROWS\}\}/g, buildTypeSpecimens(T, P));
  out = out.replace(/\{\{TYPE_SCALE_ROWS\}\}/g, buildTypeScaleTable(tokensByGroup, tokensData.brandKit));

  // ── Spacing ──
  out = out.replace(/\{\{SPACING_DESC\}\}/g, esc(buildSpacingDesc(tokensByGroup, assets.implicit.spacing, tokensData.brandKit)));
  out = out.replace(/\{\{SPACING_BARS\}\}/g, buildSpacingBars(tokensByGroup, assets.implicit.spacing, P, tokensData.brandKit));

  // ── Radius ──
  out = out.replace(/\{\{RADIUS_DESC\}\}/g, esc(buildRadiusDesc(tokensByGroup, assets.implicit.radius)));
  out = out.replace(/\{\{RADIUS_CARDS\}\}/g, buildRadiusCards(tokensByGroup, assets.implicit.radius, P));

  // ── Shadow ──
  out = out.replace(/\{\{SHADOW_DESC\}\}/g, esc(buildShadowDesc(tokensByGroup, assets.implicit.shadow)));
  out = out.replace(/\{\{SHADOW_CARDS\}\}/g, buildShadowCards(tokensByGroup, assets.implicit.shadow, vars));

  // ── Motion ──
  out = out.replace(/\{\{MOTION_DESC\}\}/g, esc(buildMotionDesc(tokensByGroup, assets.implicit.motion)));
  out = out.replace(/\{\{MOTION_CHIPS\}\}/g, buildMotionChips(tokensByGroup, assets.implicit.motion, P));

  // ── Components ──
  out = out.replace(/\{\{COMPONENT_PANELS\}\}/g, buildComponentPanels(P, T, radius, vars, assets));

  // ── Token table ──
  out = out.replace(/\{\{TOKEN_TABLE_DESC\}\}/g, esc(buildTokenTableDesc(entry, tokensByGroup)));
  out = out.replace(/\{\{TOKEN_GROUPS\}\}/g, buildTokenGroups(tokensByGroup));

  // ── Brand assets ──
  out = out.replace(/\{\{ASSET_BG_TEXTURE\}\}/g, buildBgTextureSpecimen(assets, P, accent10));
  out = out.replace(/\{\{ASSET_LOGO\}\}/g, buildLogoAsset(P, T, accent10));
  out = out.replace(/\{\{OVERLAY_DEMOS\}\}/g, buildOverlayDemos(P));

  // ── Texture system (optional, from tokens.json) ──
  const textures = tokensData.textures || [];
  if (textures.length > 0) {
    const textureCSS = extractTextureCSS(html, textures.map(t => t.cssClass));
    out = out.replace(/\{\{TEXTURE_CSS\}\}/g, textureCSS);
    out = out.replace(/\{\{TEXTURE_SECTION\}\}/g, buildTextureSection(textures, P));
  } else {
    out = out.replace(/\{\{TEXTURE_CSS\}\}/g, '');
    out = out.replace(/\{\{TEXTURE_SECTION\}\}/g, '');
  }

  // ── Cursor system (optional, from tokens.json) ──
  const cursor = tokensData.cursor || null;
  if (cursor) {
    const cursorCSS = extractCursorCSS(html);
    out = out.replace(/\{\{CURSOR_CSS\}\}/g, cursorCSS);
    out = out.replace(/\{\{CURSOR_SECTION\}\}/g, buildCursorSection(cursor, P, cursorCSS));
    out = out.replace(/\{\{MEADOW_JS\}\}/g, extractMeadowJS(html));
  } else {
    out = out.replace(/\{\{CURSOR_CSS\}\}/g, '');
    out = out.replace(/\{\{CURSOR_SECTION\}\}/g, '');
    out = out.replace(/\{\{MEADOW_JS\}\}/g, '');
  }

  // ── Decisions ──
  out = out.replace(/\{\{DECISION_ITEMS\}\}/g, buildDecisions(entry, P, T, vars, assets));

  // ── Copy blocks ──
  out = out.replace(/\{\{CSS_ROOT_BLOCK\}\}/g, esc(buildCssBlock(tokensByGroup)));
  out = out.replace(/\{\{JSON_BLOCK\}\}/g, esc(buildJsonBlock(entry, tokensByGroup)));
  out = out.replace(/\{\{AI_PROMPT_BLOCK\}\}/g, esc(buildAiBlock()));

  return out;
}

// ── Template asset extraction (background textures, pseudo-elements, heading styles) ──
function extractTemplateAssets(html, P, vars) {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return { bodyBg: 'background:var(--bg)', before: '', h1Style: '', h2Style: '',
    implicit: { spacing: { padding: [], margin: [], gap: [] }, radius: [], shadow: [], motion: [] } };

  const css = styleMatch[1];

  // Resolve var() refs in a CSS snippet against known values
  function resolveVarRefs(text) {
    return text.replace(/var\((--[\w-]+)\)/g, (_, name) => {
      if (vars[name]) return vars[name];
      // Map common template var names to P values
      const map = { '--paper': P.bg, '--ink': P.text, '--oxide': P.accent,
                    '--sun': P.accentHover, '--paper-deep': P.bgCard,
                    '--ink-soft': P.textSecondary, '--card-bg': P.bgCard,
                    '--line': P.border, '--line-soft': hexToRgba(P.text, 0.1) };
      return map[name] || name;
    });
  }

  // Extract body { ... } background
  let bodyBg = 'background:var(--bg)';
  const bodyMatch = css.match(/body\s*\{([^}]*)\}/);
  if (bodyMatch) {
    const bgMatch = bodyMatch[1].match(/background\s*:\s*([^;]+);/m);
    if (bgMatch) {
      bodyBg = 'background:' + resolveVarRefs(bgMatch[1].trim().replace(/\n\s*/g, ' '));
    }
  }

  // Extract body::before { ... }
  let before = '';
  const beforeMatch = css.match(/body::before\s*\{([^}]*)\}/);
  if (beforeMatch) {
    before = 'body::before{' + resolveVarRefs(beforeMatch[1].trim()) + '}';
  }

  // Extract h1 typography from template
  let h1Style = '';
  const h1Block = css.match(/h1\s*\{([^}]*)\}/);
  if (h1Block) {
    const b = h1Block[1];
    const fs = b.match(/font-size\s*:\s*([^;]+);/);
    const lh = b.match(/line-height\s*:\s*([^;]+);/);
    const ls = b.match(/letter-spacing\s*:\s*([^;]+);/);
    if (fs) h1Style += 'font-size:' + fs[1].trim() + ';';
    if (lh) h1Style += 'line-height:' + lh[1].trim() + ';';
    if (ls) h1Style += 'letter-spacing:' + ls[1].trim() + ';';
  }
  // Also check combined selectors for h1 font-family / font-weight
  const combiMatch = css.match(/h1,\s*h2([^{]*)\{([^}]*)\}/);
  if (combiMatch && !h1Block) {
    const b = combiMatch[2];
    const ff = b.match(/font-family\s*:\s*([^;]+);/);
    const fw = b.match(/font-weight\s*:\s*([^;]+);/);
    if (ff) h1Style += 'font-family:' + resolveVarRefs(ff[1].trim()) + ';';
    if (fw) h1Style += 'font-weight:' + fw[1].trim() + ';';
  }

  // Extract h2 / section-heading typography
  let h2Style = '';
  const sh2Match = css.match(/\.section-heading\s+h2\s*\{([^}]*)\}/);
  const h2Match = css.match(/h2\s*\{([^}]*)\}/);
  const h2Block = sh2Match || h2Match;
  if (h2Block) {
    const b = h2Block[1];
    const fs = b.match(/font-size\s*:\s*([^;]+);/);
    const lh = b.match(/line-height\s*:\s*([^;]+);/);
    const ls = b.match(/letter-spacing\s*:\s*([^;]+);/);
    if (fs) h2Style += 'font-size:' + fs[1].trim() + ';';
    if (lh) h2Style += 'line-height:' + lh[1].trim() + ';';
    if (ls) h2Style += 'letter-spacing:' + ls[1].trim() + ';';
  }

  // Scan CSS for hardcoded design values (not tokenized in :root)
  // Strip :root block first — token DEFINITIONS are not hardcoded usage
  const cssBody = css.replace(/:root\s*\{[^}]*\}/g, '');
  const rawSpacing = []; // { prop: 'padding'|'margin'|'gap', val: string }

  for (const [, val] of cssBody.matchAll(/padding\s*:\s*([^;]+);/g)) {
    const v = cleanSpacingVal(val);
    if (v && v !== '0' && !v.includes('var(--')) rawSpacing.push({ prop: 'padding', val: v });
  }
  for (const [, val] of cssBody.matchAll(/margin(?:-top|-bottom|-left|-right)?\s*:\s*([^;]+);/g)) {
    const v = cleanSpacingVal(val);
    if (v && !v.includes('var(--') && v !== '0' && v !== '0 auto') rawSpacing.push({ prop: 'margin', val: v });
  }
  for (const [, val] of cssBody.matchAll(/gap\s*:\s*([^;]+);/g)) {
    const v = cleanSpacingVal(val);
    if (v && v !== '0' && !v.includes('var(--')) rawSpacing.push({ prop: 'gap', val: v });
  }

  // Classify spacing values: deduplicate and group by property type
  function classifySpacing(raw) {
    const seen = new Set();
    const groups = { padding: [], margin: [], gap: [] };
    for (const { prop, val } of raw) {
      const key = prop + ':' + val;
      if (seen.has(key)) continue;
      seen.add(key);
      groups[prop].push(val);
    }
    // Sort each group: simple px values first, then complex
    for (const g of Object.keys(groups)) {
      groups[g].sort((a, b) => {
        const aPx = (a.match(/^[\d.]+px$/) || [''])[0];
        const bPx = (b.match(/^[\d.]+px$/) || [''])[0];
        if (aPx && bPx) return parseFloat(aPx) - parseFloat(bPx);
        if (aPx) return -1;
        if (bPx) return 1;
        return a.localeCompare(b);
      });
    }
    return groups;
  }

  const implicit = { spacing: classifySpacing(rawSpacing), radius: new Set(), shadow: new Set(), motion: new Set() };

  for (const [, val] of css.matchAll(/border-radius\s*:\s*([^;]+);/g))
    if (!val.includes('var(--')) implicit.radius.add(val.trim());

  for (const [, val] of css.matchAll(/box-shadow\s*:\s*([^;]+);/g))
    if (val.trim() !== 'none') implicit.shadow.add(resolveVarRefs(val.trim()));
  for (const [, val] of css.matchAll(/text-shadow\s*:\s*([^;]+);/g))
    if (val.trim() !== 'none') implicit.shadow.add(resolveVarRefs(val.trim()));

  for (const [, val] of css.matchAll(/transition\s*:\s*([^;]+);/g))
    if (!val.includes('var(--')) implicit.motion.add(val.trim());

  return {
    bodyBg, before, h1Style, h2Style,
    implicit: {
      spacing: implicit.spacing,
      radius: [...implicit.radius],
      shadow: [...implicit.shadow],
      motion: [...implicit.motion]
    }
  };
}

// ── Palette ──
function buildPalette(entry, vars, fb) {
  const colors = [];
  if (entry.palette) {
    entry.palette.forEach(p => colors.push({ name: p.name, hex: p.color, role: p.role || guessRole(p.name) }));
  }
  if (colors.length === 0) {
    // fallback: build from css_variables
    (entry.css_variables || []).filter(v => v.group === 'color').forEach(v => {
      colors.push({ name: v.name, hex: v.default, role: v.role || '' });
    });
  }

  // Standard name lookup first, then domain-name chain for unmigrated templates.
  // Deprecation: domain-name fallback chain will be removed once all templates
  // pass standardVars validation.
  const find = (stdKey, legacyKeys) => {
    if (vars[stdKey]) return vars[stdKey];
    for (const k of (legacyKeys || [])) { if (vars[k]) return vars[k]; }
    return '';
  };

  const bg = find(STD.color.bg, ['--paper', '--bg-color', '--color-bg', '--background']);
  const bgCard = find(STD.color.surface, ['--bg-card', '--card-bg', '--paper-deep', '--color-surface']);
  const text = find(STD.color.text, ['--ink', '--color-text', '--text-primary', '--foreground']);
  const textSecondary = find(STD.color.textSecondary, ['--text-secondary', '--ink-soft', '--color-text-secondary']);
  const _textMuted = find(null, ['--text-muted', '--text-tertiary', '--color-text-muted']);
  const textMuted = _textMuted || hexToRgba(text || fb['text-primary'], 0.4);
  const border = find(STD.color.border, ['--border', '--border-color', '--color-border', '--line-soft']);
  const accent = find(STD.color.accent, ['--oxide', '--primary', '--color-accent', '--color-primary']);
  const accentHover = find(STD.color.accentHover, ['--accent-hover', '--sun', '--primary-hover', '--color-accent-hover']);

  return {
    colors,
    bg: bg || fb['surface-bg'],
    bgCard: bgCard || fb['surface-card'],
    text: text || fb['text-primary'],
    textSecondary: textSecondary || fb['text-secondary'],
    textMuted: textMuted || fb['text-secondary'],
    border: border || fb['border-default'],
    accent: accent || fb['accent'],
    accentHover: accentHover || fb['accent-hover'],
  };
}

function findSeed(P) {
  // Prefer 'accent' role exactly, then name match
  for (const c of P.colors) {
    const role = (c.role || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    if (role === 'accent' || /oxide|brand/.test(name)) return c;
  }
  // Next: role contains 'primary' but not 'text'/'surface' (catch bare 'primary')
  for (const c of P.colors) {
    const role = (c.role || '').toLowerCase();
    if (role === 'primary') return c;
  }
  // Fallback: first non-surface, non-text color
  for (const c of P.colors) {
    const role = (c.role || '').toLowerCase();
    if (!/bg|paper|surface|background|text/.test(role)) return c;
  }
  // Last resort: construct from accent value
  return { name: 'Accent', hex: P.accent, role: '主强调色' };
}

function guessRole(name) {
  const n = name.toLowerCase();
  if (n.includes('bg') || n.includes('paper') || n.includes('background')) return 'surface-bg';
  if (n.includes('card') || n.includes('surface')) return 'surface-card';
  if (n.includes('text') || n.includes('ink') || n.includes('foreground')) return 'text-primary';
  if (n.includes('border')) return 'border-default';
  if (n.includes('accent') || n.includes('primary') || n.includes('oxide')) return 'accent';
  return '';
}

// ── Typography ──
function buildTypography(entry, vars, fb) {
  const find = (stdKey, legacyKeys) => {
    if (vars[stdKey]) return vars[stdKey];
    for (const k of (legacyKeys || [])) { if (vars[k]) return vars[k]; }
    return '';
  };
  const display = find(STD.typography.display, ['--display', '--font-serif', '--heading-font']);
  const body = find(STD.typography.body, ['--body', '--font-sans', '--text-font']);
  const mono = find(STD.typography.mono, ['--mono', '--code-font']);
  return {
    display: display || entry.displayFont || fb['display-font'],
    body: body || entry.bodyFont || fb['body-font'],
    mono: mono || fb['mono-font'],
    displayName: entry.displayFont || extractFontName(display) || 'Display Serif',
    bodyName: entry.bodyFont || extractFontName(body) || 'Body Sans',
  };
}

function extractFontName(stack) {
  if (!stack) return '';
  const m = stack.match(/^['"]?([^'",]+)/);
  return m ? m[1] : stack.split(',')[0].trim();
}

// ── tokens.json helpers (一源双端) ──

function flattenTokens(tokensData) {
  const vars = {};
  for (const tokens of Object.values(tokensData.tokens)) {
    for (const t of tokens) {
      vars[t.name] = t.value;
    }
  }
  return vars;
}

function groupTokensFromData(tokensData) {
  const catMap = { color: 'Color', typography: 'Typography', spacing: 'Spacing',
                   radius: 'Radius', shadow: 'Shadow', motion: 'Motion' };
  const groups = {};
  for (const [cat, tokens] of Object.entries(tokensData.tokens)) {
    const key = catMap[cat] || capitalize(cat);
    groups[key] = tokens.map(t => ({
      name: t.name,
      value: t.value,
      role: t.role || '',
      desc: t.description || ''
    }));
  }
  return groups;
}

// ── HTML block builders ──

function buildMoodChips(entry, P) {
  const chips = [];
  if (entry.design_style) chips.push('<span class="bk-chip mood">' + esc(styleLabel(entry.design_style)) + '</span>');
  if (entry.mood) entry.mood.forEach(m => chips.push('<span class="bk-chip mood">' + esc(m) + '</span>'));
  if (entry.scheme) chips.push('<span class="bk-chip">' + esc(schemeLabel(entry.scheme)) + '</span>');
  if (entry.density) chips.push('<span class="bk-chip">' + esc(densityLabel(entry.density)) + '</span>');
  if (entry.template_type) chips.push('<span class="bk-chip">' + esc(typeLabel(entry.template_type)) + '</span>');
  return chips.join('\n    ');
}

function buildOverview(entry) {
  const parts = [];
  if (entry.design_style) parts.push(styleLabel(entry.design_style) + ' 风格');
  if (entry.scheme) parts.push(schemeLabel(entry.scheme) + ' 配色');
  if (entry.formality) parts.push('正式度 ' + formalityLabel(entry.formality));
  if (entry.density) parts.push('信息密度 ' + densityLabel(entry.density));
  return (entry.tagline || '') + '。' + parts.join(' · ') + '。';
}

function buildDNA(entry) {
  const parts = [];
  if (entry.design_style) parts.push(styleLabel(entry.design_style));
  if (entry.template_type) parts.push(entry.template_type);
  if (entry.typography_style) parts.push(entry.typography_style);
  return parts.join(' / ') || '—';
}

function buildColorDesc(entry, P) {
  if (P.colors.length === 0) return '配色系统待补充。';
  const unique = [...new Set(P.colors.map(c => c.name))];
  return unique.length + ' 色配色。' + unique.join('、') + '。' +
    (entry.scheme ? ' ' + schemeLabel(entry.scheme) + ' 方案。' : '');
}

function buildColorPreviewCards(P) {
  // Show first 3 palette colors as preview cards
  const samples = P.colors.slice(0, 3);
  if (samples.length === 0) {
    return '<div class="prev-card"><div class="prev-title">—</div><div class="prev-body">配色数据待补充</div></div>';
  }
  return samples.map((c, i) => {
    const isDark = isDarkColor(c.hex);
    const tc = isDark ? '#fff' : '#1a1a1a';
    const btnBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
    return '<div class="prev-card"' + (i === 0 ? ' style="background:' + esc(c.hex) + ';color:' + tc + '"' : '') + '>' +
      '<div class="prev-title"' + (i === 0 ? ' style="color:' + tc + '"' : '') + '>' + esc(c.name) + '</div>' +
      '<div class="prev-body"' + (i === 0 ? ' style="color:' + tc + ';opacity:0.8"' : '') + '>' + esc(c.hex) + '</div>' +
      (c.role ? '<div class="prev-btn" style="background:' + btnBg + ';color:' + tc + '">' + esc(c.role) + '</div>' : '') +
      '</div>';
  }).join('\n      ');
}

function buildColorTokenGrid(groups) {
  const items = groups.Color || [];
  if (items.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:40px">无颜色 Token</p>';
  return items.map(t => {
    const hex = extractHex(t.value);
    const isDark = hex ? isDarkColor(hex) : false;
    const labelClass = isDark ? '' : ' light';
    const use = t.desc || t.role || '';
    return '<div class="color-token">' +
      '<div class="c-chip" style="background:' + esc(t.value) + '"><span class="c-label' + labelClass + '">' + esc(t.role || '') + '</span></div>' +
      '<div class="c-info"><div class="c-var">' + esc(t.name) + '</div><div class="c-hex">' + esc(hex || t.value) + '</div>' +
      '<div class="c-role">' + esc(t.role || '') + '</div><div class="c-use">' + esc(use) + '</div></div></div>';
  }).join('\n    ');
}

function buildTypeDesc(entry, T) {
  let d = '';
  if (T.displayName) d += '展示字体：' + T.displayName + '。';
  if (T.bodyName) d += '正文字体：' + T.bodyName + '。';
  if (entry.typography_style) d += '风格：' + entry.typography_style + '。';
  return d || '排版系统。';
}

function buildTypeSpecimens(T, P) {
  const rows = [];
  const mt = P.textMuted;

  if (T.display) {
    rows.push({
      label: 'Display', name: extractFontName(T.display) || 'Display',
      spec: fontShortName(T.display) + ' / 700 / -0.035em',
      text: '版式画廊 Layout Gallery',
      style: 'font-family:' + T.display + ';font-size:clamp(36px,5vw,56px);font-weight:700;letter-spacing:-.035em;line-height:1.08'
    });
  }
  if (T.body) {
    rows.push({
      label: 'Body', name: extractFontName(T.body) || 'Body',
      spec: fontShortName(T.body) + ' / 16px / 400 / 1.5',
      text: '版式画廊是一个模板展示平台。卡片网格 + 搜索 + 分类筛选 + modal 预览。内容第一，UI 退后。',
      style: 'font-family:' + T.body + ';font-size:16px;color:' + mt + ';max-width:480px'
    });
  }
  if (T.mono) {
    rows.push({
      label: 'Mono', name: extractFontName(T.mono) || 'Mono',
      spec: fontShortName(T.mono) + ' / 11px / 500',
      text: '--accent: ' + P.accent + '; // token names & code',
      style: 'font-family:' + T.mono + ';font-size:11px;color:' + mt
    });
  }
  return rows.map(r =>
    '<div class="type-row"><div class="type-meta"><div class="t-label">' + esc(r.label) + '</div>' +
    '<div class="t-name">' + esc(r.name) + '</div><div class="t-spec">' + esc(r.spec) + '</div></div>' +
    '<div class="type-preview"><span style="' + esc(r.style) + '">' + esc(r.text) + '</span></div></div>'
  ).join('\n    ');
}

function buildTypeScaleTable(groups, brandKit) {
  // Use brand kit type scale if available (一源双端 — tokens.json brandKit section)
  const bkItems = (brandKit && brandKit.typeScale) ? brandKit.typeScale : null;
  if (bkItems && bkItems.length > 0) {
    return bkItems.map(t => {
      const val = t.size || t.value;
      const label = (t.name || t.level || '?').replace('--brand-t-', '').replace('--sz-', '');
      const pxVal = cssValToPx(val);
      const sizeStyle = pxVal > 0 ? 'font-size:' + Math.min(pxVal, 40) + 'px;font-weight:700' : '';
      return '<tr><td>' + (sizeStyle ? '<span style="' + sizeStyle + '">' + capitalize(label) + '</span>' : capitalize(label)) +
        '</td><td class="mono">' + esc(t.name) + '</td>' +
        '<td class="mono">' + esc(val) + '</td>' +
        '<td>' + esc(t.usage || t.role || '') + '</td></tr>';
    }).join('\n    ');
  }

  const items = groups.Typography || [];
  if (items.length === 0) {
    return '<tr><td colspan="4" style="color:var(--text-muted)">排版变量待补充</td></tr>';
  }
  return items.filter(t => !t.name.includes('font')).map(t => {
    const label = t.name.replace('--', '').replace('text-', '').replace(/-/g, ' ');
    const pxVal = cssValToPx(t.value);
    const sizeStyle = pxVal > 0 ? 'font-size:' + Math.min(pxVal, 40) + 'px;font-weight:700' : '';
    const weight = t.role ? '' : guessWeight(t.value);
    return '<tr><td>' + (sizeStyle ? '<span style="' + sizeStyle + '">' + capitalize(label) + '</span>' : capitalize(label)) +
      '</td><td class="mono">' + esc(t.name) + '</td>' +
      '<td class="mono">' + esc(t.value) + (weight ? ' / ' + weight : '') + '</td>' +
      '<td>' + esc(t.desc || t.role || '') + '</td></tr>';
  }).join('\n    ');
}

function guessWeight(val) {
  if (val.includes('700') || val.includes('bold')) return '700';
  if (val.includes('600')) return '600';
  if (val.includes('500')) return '500';
  return '';
}

function buildSpacingDesc(groups, implicit, brandKit) {
  // Use brand kit spacing if available
  const bkItems = (brandKit && brandKit.spacingScale) ? brandKit.spacingScale : null;
  if (bkItems && bkItems.length > 0) {
    const total = (implicit.padding || []).length + (implicit.margin || []).length + (implicit.gap || []).length;
    const extra = total > 0 ? ' + ' + total + ' 个 CSS 硬编码值' : '';
    return bkItems.length + ' 级间距系统（Token 化）。' + extra;
  }

  const items = groups.Spacing || [];
  if (items.length === 0) {
    const total = (implicit.padding || []).length + (implicit.margin || []).length + (implicit.gap || []).length;
    return total > 0
      ? '间距未 Token 化。' + total + ' 个硬编码值分布于 padding/margin/gap。'
      : '此模板未定义间距 Token。间距通过组件内硬编码，未抽象为 CSS 变量。';
  }
  const total = (implicit.padding || []).length + (implicit.margin || []).length + (implicit.gap || []).length;
  const extra = total > 0 ? ' + ' + total + ' 个 CSS 硬编码值' : '';
  return items.length + ' 级间距系统（Token 化）。' + extra;
}

function buildSpacingBars(groups, implicit, P, brandKit) {
  // Use brand kit spacing if available
  const bkItems = (brandKit && brandKit.spacingScale) ? brandKit.spacingScale : null;
  const items = bkItems || groups.Spacing || [];
  const hasImplicit = implicit && ((implicit.padding || []).length + (implicit.margin || []).length + (implicit.gap || []).length) > 0;

  if (items.length === 0) {
    if (hasImplicit) return buildClassifiedSpacing(implicit, P);
    return '<p style="color:var(--text-soft);font-size:14px;padding:32px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">间距未 Token 化 — 此模板在组件内直接使用 px 值，未抽象为 CSS 自定义属性。</p>';
  }
  const maxPx = Math.max(...items.map(t => parseInt(t.value) || 0), 1);
  let html = items.map(t => {
    const px = parseInt(t.value) || 4;
    const w = Math.max(4, Math.round((px / maxPx) * 100));
    return '<div class="spacing-row"><div class="s-name">' + esc(t.name.replace('--', '')) + '</div>' +
      '<div class="s-bar" style="width:' + w + '%"></div>' +
      '<div class="s-desc">' + esc(t.value) + (t.role ? ' · ' + esc(t.role) : '') + '</div></div>';
  }).join('\n    ');
  if (hasImplicit) {
    html += buildClassifiedSpacing(implicit, P);
  }
  return html;
}

function buildClassifiedSpacing(implicit, P) {
  const labels = { padding: '内边距 Padding', margin: '外边距 Margin', gap: '间距 Gap' };
  let html = '<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin:28px 0 12px;padding-top:16px;border-top:1px dashed var(--line);letter-spacing:.04em;text-transform:uppercase">CSS 硬编码（未 Token 化）</div>';
  for (const [prop, vals] of Object.entries(implicit)) {
    if (!vals || vals.length === 0) continue;
    const distinct = [...new Set(vals.map(v => {
      // Extract simple px value or keep complex
      const m = v.match(/^([\d.]+(?:px|rem|em))$/);
      return m ? m[1] : v;
    }))];
    html += '<div style="margin-bottom:14px">';
    html += '<div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:6px">' + esc(labels[prop] || prop) + ' · ' + vals.length + ' 处</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">';
    for (const v of distinct.slice(0, 15)) {
      html += '<span style="padding:4px 10px;background:var(--bg);border:1px solid var(--line);border-radius:4px;font-family:var(--font-mono);font-size:11px;color:var(--text);white-space:nowrap">' + esc(v) + '</span>';
    }
    if (distinct.length > 15) html += '<span style="font-size:12px;color:var(--text-muted)">+ ' + (distinct.length - 15) + ' more</span>';
    html += '</div></div>';
  }
  return html;
}

function buildRadiusDesc(groups, implicit) {
  const items = groups.Radius || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) return '圆角未 Token 化。以下 ' + implicit.length + ' 个值从 CSS 中硬编码提取。';
    return '此模板未定义圆角 Token。';
  }
  return items.length + ' 级圆角。基于 var() 引用，全局统一。';
}

function buildRadiusCards(groups, implicit, P) {
  const items = groups.Radius || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) return buildImplicitChips(implicit, '圆角', P);
    return '<p style="color:var(--text-soft);font-size:14px;padding:32px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">圆角未 Token 化 — 此模板在各组件内直接使用 px 值。</p>';
  }
  return items.map(t => {
    const label = t.name.replace('--radius-', '').replace('--radius', 'default');
    return '<div class="radius-card"><div class="r-box" style="border-radius:' + esc(t.value) + '"></div>' +
      '<div class="r-label">' + esc(label) + '</div><div class="r-val">' + esc(t.value) + (t.role ? ' · ' + esc(t.role) : '') + '</div></div>';
  }).join('\n    ');
}

function isSolidShadow(val) {
  // Solid stamp: Xpx Ypx 0 color (blur=0, no spread/rgba)
  // Elevation: Xpx Ypx Blur>0 Spread rgba()
  const parts = val.trim().split(/\s+/);
  if (parts.length >= 3 && parts[2] === '0' && !val.includes('rgba')) return true;
  if (parts.length === 3 && /^\d+px$/.test(parts[0]) && /^\d+px$/.test(parts[1])) return true;
  return false;
}

function buildShadowDesc(groups, implicit) {
  const items = groups.Shadow || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) {
      const solidCount = implicit.filter(isSolidShadow).length;
      const elevCount = implicit.length - solidCount;
      let d = '阴影未 Token 化。' + implicit.length + ' 个硬编码值';
      if (solidCount > 0 && elevCount === 0) d += '——全部为实心偏移（blur=0），非景深阴影。';
      else if (solidCount > 0) d += '：' + solidCount + ' 实心偏移 + ' + elevCount + ' 景深阴影。';
      else d += '。';
      return d;
    }
    return '此模板未定义阴影 Token。阴影效果硬编码在 CSS 中。';
  }
  return items.length + ' 档阴影。';
}

function resolveVarRefs(value, vars) {
  if (!value || typeof value !== 'string') return value;
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (vars[name]) return vars[name];
    return name;
  });
}

function buildShadowCards(groups, implicit, vars) {
  const items = groups.Shadow || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) {
      return '<div class="token-showcase">' + implicit.map(v => {
        const solid = isSolidShadow(v);
        const resolved = resolveVarRefs(v, vars || {});
        const label = solid ? '实心偏移（非阴影）' : 'CSS 硬编码';
        return '<div class="shadow-card" style="box-shadow:' + esc(resolved) + '">' +
        '<div class="sh-name">box-shadow</div><div class="sh-val">' + esc(v) + '</div>' +
        '<div class="sh-desc">' + label + '</div></div>';
      }).join('\n    ') + '</div>';
    }
    return '<p style="color:var(--text-soft);font-size:14px;padding:32px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">阴影未 Token 化 — 此模板的阴影效果直接写入组件样式。</p>';
  }
  return items.map(t => {
    const resolved = resolveVarRefs(t.value, vars || {});
    return '<div class="shadow-card" style="box-shadow:' + esc(resolved) + '">' +
    '<div class="sh-name">' + esc(t.name) + '</div><div class="sh-val">' + esc(t.value) + '</div>' +
    '<div class="sh-desc">' + esc(t.role || t.desc || '') + '</div></div>';
  }).join('\n    ');
}

function buildMotionDesc(groups, implicit) {
  const items = groups.Motion || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) return '动效未 Token 化。以下 ' + implicit.length + ' 个值从 CSS transition 中硬编码提取。';
    return '此模板未定义动效 Token。过渡/动画直接写在 CSS 中。';
  }
  return items.length + ' 动效变量。';
}

function buildMotionChips(groups, implicit, P) {
  const items = groups.Motion || [];
  if (items.length === 0) {
    if (implicit && implicit.length > 0) {
      return '<div class="motion-demo">' + implicit.map(v => {
        const dur = v.match(/([\d.]+s|[\d.]+ms)/);
        const ease = v.match(/ease[-\w]*|linear|cubic-bezier\([^)]+\)/);
        return '<div class="motion-chip">' +
          '<div class="m-var">transition</div>' +
          '<div class="m-val">' + esc(v) + '</div>' +
          (ease ? '<div class="m-curve">' + esc(ease[0]) + '</div>' : '') +
          (dur ? '<div class="m-curve">' + esc(dur[0]) + '</div>' : '') +
          '<div class="m-bar"></div></div>';
      }).join('\n    ') + '</div>';
    }
    return '<p style="color:var(--text-soft);font-size:14px;padding:32px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">动效未 Token 化 — 此模板的 transition/animation 属性内联在组件样式中，未抽象为 --duration-* / --ease-* 变量。</p>';
  }
  return items.map(t => {
    const isEase = t.name.includes('ease');
    const isDuration = t.name.includes('duration');
    // Pass motion values as CSS custom properties so bars animate on hover
    const dur = isDuration ? t.value : '200ms';
    const ease = isEase ? t.value : 'cubic-bezier(0.4,0,0.2,1)';
    return '<div class="motion-chip" style="--m-dur:' + esc(dur) + ';--m-ease:' + esc(ease) + '">' +
      '<div class="m-var">' + esc(t.name.replace('--', '')) + '</div>' +
      '<div class="m-val">' + esc(t.value) + '</div>' +
      (isEase ? '<div class="m-curve">缓动曲线</div>' : '') +
      (isDuration ? '<div class="m-curve">过渡时长</div>' : '') +
      '<div class="m-bar"></div></div>';
  }).join('\n    ');
}

function buildImplicitChips(values, label, P) {
  return '<div style="padding:28px;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">' +
    '<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:14px;letter-spacing:.04em;text-transform:uppercase">CSS 硬编码（未 Token 化）</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
    values.map(v => '<div style="padding:12px 20px;background:var(--bg);border:1px dashed var(--line);border-radius:6px;font-family:var(--font-mono);font-size:13px;color:var(--text)">' + esc(v) + '</div>').join('') +
    '</div></div>';
}

function buildComponentPanels(P, T, radius, vars, assets) {
  const R = radius;
  const out = [];

  // Detect brutalist solid-shadow pattern
  const solidShadow = (assets.implicit.shadow || []).find(s => /^\d+px\s+\d+px\s+0\s/.test(s));
  const isBrutalist = !!solidShadow;

  // Reverse-map hex values → CSS var names
  const vn = {};
  for (const [k, v] of Object.entries(vars)) { vn[v] = k; }
  function varRef(val) { return vn[val] ? '<span>' + esc(vn[val]) + '</span>' : '<span>' + esc(val) + '</span>'; }
  // Map a hex value to var(--token) if known, otherwise return value as-is
  function varStyle(val) { return vn[val] ? 'var(' + vn[val] + ')' : val; }
  function varBgc(val) { return vn[val] ? 'background-color:var(' + vn[val] + ')' : 'background:' + val; }

  // ── Buttons ──
  const btnRadiusVal = isBrutalist ? 'var(--radius)' : 'var(--radius-pill,9999px)';
  const btnShadow = solidShadow ? 'box-shadow:var(--shadow-solid,' + esc(solidShadow) + ');' : '';
  out.push(
    '<div class="comp-panel"><h4>按钮</h4>' +
    '<div class="comp-row" style="gap:var(--space-xs)">' +
    '<button style="' + varBgc(P.accent) + ';color:#fff;border:none;border-radius:' + btnRadiusVal + ';' + btnShadow + 'padding:var(--space-sm) var(--space-lg);font-size:14px;font-weight:500;cursor:default">主要按钮</button>' +
    '<button style="background:transparent;color:' + varStyle(P.text) + ';border:var(--hairline,1px) solid ' + varStyle(P.border) + ';border-radius:' + btnRadiusVal + ';' + btnShadow + 'padding:var(--space-sm) var(--space-lg);font-size:14px;cursor:default">次要按钮</button>' +
    '</div>' +
    '<div class="token-note">使用 Token：' + varRef(P.accent) + ' ' + varRef(P.border) + ' <span>--radius</span></div></div>'
  );

  // ── Card ──
  const cardShadow = solidShadow ? 'box-shadow:var(--shadow-solid,' + esc(solidShadow) + ');' : 'box-shadow:var(--shadow-md)';
  out.push(
    '<div class="comp-panel"><h4>卡片</h4><div class="comp-row">' +
    '<div style="width:220px;' + varBgc(P.bgCard) + ';border:var(--hairline,1px) solid ' + varStyle(P.border) + ';border-radius:var(--radius);overflow:hidden;' + cardShadow + '">' +
    '<div style="height:100px;background:linear-gradient(135deg,' + varStyle(P.bg) + ',' + varStyle(P.border) + ');display:flex;align-items:center;justify-content:center;font-size:24px;color:' + varStyle(P.textMuted) + '">&#x25A1;</div>' +
    '<div style="padding:var(--space-sm) var(--space-md)"><div style="font-size:var(--text-base,15px);font-weight:700;margin-bottom:var(--space-2xs)">Template Name</div>' +
    '<div style="font-size:var(--text-sm,13px);color:' + varStyle(P.textSecondary) + ';line-height:1.4">Tagline description here.</div></div></div></div>' +
    '<div class="token-note">使用 Token：' + varRef(P.bgCard) + ' ' + varRef(P.border) + ' <span>--radius</span> ' + varRef(P.textSecondary) + '</div></div>'
  );

  // ── Input ──
  const inputRadiusVal = isBrutalist ? 'var(--radius)' : 'var(--radius-sm,10px)';
  out.push(
    '<div class="comp-panel"><h4>输入框</h4><div class="comp-row">' +
    '<div style="display:flex;align-items:center;' + varBgc(P.bgCard) + ';border:var(--hairline,1px) solid ' + varStyle(P.border) + ';border-radius:' + inputRadiusVal + ';overflow:hidden">' +
    '<input style="border:none;outline:none;font-size:var(--text-base,15px);font-family:inherit;color:' + varStyle(P.text) + ';padding:var(--space-sm) var(--space-md);width:160px;background:transparent" placeholder="搜索...">' +
    '<button style="padding:var(--space-sm) var(--space-md);border:none;' + varBgc(P.bg) + ';border-left:var(--hairline,1px) solid ' + varStyle(P.border) + ';font-size:16px;cursor:default;font-family:inherit;color:' + varStyle(P.textSecondary) + '">&#x2315;</button>' +
    '</div></div>' +
    '<div class="token-note">使用 Token：' + varRef(P.bgCard) + ' ' + varRef(P.border) + ' ' + varRef(P.text) + '</div></div>'
  );

  return out.join('\n    ');
}

function entrySvg(i) { return ''; }
function htmlIcon(s) { return '&#x25A1;'; }

function buildTokenTableDesc(entry, groups) {
  const total = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
  return '「' + esc(entry.name) + '」的完整 CSS 自定义属性清单。' +
    Object.keys(groups).length + ' 类共 ' + total + ' 个变量。';
}

function buildTokenGroups(groups) {
  const order = ['Color', 'Typography', 'Spacing', 'Radius', 'Shadow', 'Motion', 'Other'];
  const labels = { Color: '颜色', Typography: '排版', Spacing: '间距', Radius: '圆角', Shadow: '阴影', Motion: '动效', Other: '其他' };
  let html = '';
  for (const cat of order) {
    const items = groups[cat];
    html += '<div class="token-group"><h3>' + esc(labels[cat] || cat) + ' · ' + esc(cat) + '</h3>';
    if (!items || items.length === 0) {
      html += '<div class="tg-desc">未 Token 化</div>';
      html += '<p style="color:var(--text-muted);font-size:13px;padding:16px 0">此模板未定义 ' + esc(labels[cat] || cat) + ' 相关 CSS 变量。' + (cat === 'Other' ? '' : '相应设计值在 CSS 中硬编码。') + '</p>';
    } else {
      html += '<div class="tg-desc">' + items.length + ' tokens</div>' +
        '<table class="token-table"><tr><th>变量</th><th>值</th><th>角色</th><th>说明</th></tr>';
      for (const t of items) {
        const hex = extractHex(t.value);
        const swatch = hex && cat === 'Color'
          ? '<span class="swatch" style="background:' + esc(t.value) + '"></span>' : '';
        html += '<tr><td class="name">' + swatch + esc(t.name) + '</td>' +
          '<td class="value">' + esc(t.value) + '</td>' +
          '<td class="role">' + esc(t.role || '') + '</td>' +
          '<td class="note">' + esc(t.desc || '') + '</td></tr>';
      }
      html += '</table>';
    }
    html += '</div>';
  }
  return html;
}

function buildBgTextureSpecimen(assets, P, accent10) {
  if (!assets.bodyBg || assets.bodyBg === 'background:var(--bg)') {
    return '<p style="color:var(--text-soft);font-size:14px;padding:32px;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius)">此模板未定义特殊背景纹理。使用纯色 var(--bg) 作为背景。</p>';
  }

  const bodyBgCss = assets.bodyBg; // "background:radial-gradient(...), linear-gradient(...), #f4efe7"

  // Parse body::before into sanitized display props (no position/z-index/inset/pointer-events/content)
  let dotOverlay = '';
  if (assets.before) {
    const raw = assets.before.replace('body::before{', '').replace('}', '');
    // Extract only visual properties
    const opacity = (raw.match(/opacity\s*:\s*([^;]+);/) || [])[1] || '';
    const bgImage = (raw.match(/background-image\s*:\s*([^;]+);/) || [])[1] || '';
    const bgSize = (raw.match(/background-size\s*:\s*([^;]+);/) || [])[1] || '';
    const blend = (raw.match(/mix-blend-mode\s*:\s*([^;]+);/) || [])[1] || '';
    if (bgImage) {
      dotOverlay = 'opacity:' + (opacity || '1') + ';' +
        'background-image:' + bgImage + ';' +
        'background-size:' + (bgSize || 'auto') + ';' +
        (blend ? 'mix-blend-mode:' + blend + ';' : '');
    }
  }

  let html = '';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';

  // Left: body background only
  html += '<div>';
  html += '<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:8px">body 背景层</div>';
  html += '<div style="height:140px;border-radius:2px;border:1px solid var(--line);' + bodyBgCss + '"></div>';
  html += '</div>';

  // Right: combined (body bg + ::before overlay)
  if (dotOverlay) {
    html += '<div>';
    html += '<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:8px">+ body::before 纹理（完整效果）</div>';
    html += '<div style="height:140px;border-radius:2px;border:1px solid var(--line);position:relative;overflow:hidden">';
    html += '<div style="position:absolute;inset:0;' + bodyBgCss + '"></div>';
    html += '<div style="position:absolute;inset:0;' + dotOverlay + '"></div>';
    html += '</div>';
    html += '</div>';
  } else {
    html += '<div>';
    html += '<div style="font-size:11px;font-family:var(--font-mono);color:var(--text-muted);margin-bottom:8px">纹理层</div>';
    html += '<div style="height:140px;border-radius:2px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:13px;background:var(--surface)">无 ::before 伪元素</div>';
    html += '</div>';
  }
  html += '</div>';

  // CSS snippet
  html += '<pre style="background:var(--text);color:var(--bg);padding:20px;border-radius:var(--radius);font-family:var(--font-mono);font-size:11px;line-height:1.7;overflow-x:auto;margin:0;max-height:200px;overflow-y:auto">';
  // Strip "background:" prefix for cleaner display
  const bgVal = bodyBgCss.replace(/^background:/, '');
  html += esc('body {\n  background: ' + bgVal + ';\n}');
  if (assets.before) {
    html += esc('\n\n' + assets.before);
  }
  html += '</pre>';

  html += '<p style="font-size:13px;color:var(--accent);margin-top:12px;padding:12px 16px;background:' + accent10 + ';border-radius:6px;line-height:1.6">';
  html += '消费 Token：--bg（纸色底色）· --text（点阵 22% 透明度 + 中线 2.5% 透明度）· --accent-hover（径向渐变暖光 18% 透明度）';
  html += '</p>';

  return html;
}

function buildLogoAsset(P, T, accent10) {
  let html = '';
  html += '<div style="display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:start">';
  html += '<div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:32px;display:flex;align-items:center;justify-content:center;min-width:120px">';
  html += '<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  html += '<rect width="64" height="64" rx="14" fill="' + esc(P.text) + '"/>';
  html += '<rect x="7" y="14" width="22" height="28" rx="3" fill="' + esc(P.accent) + '"/>';
  html += '<rect x="32" y="20" width="24" height="18" rx="3" fill="' + esc(P.bgCard) + '"/>';
  html += '<rect x="36" y="26" width="16" height="18" rx="3" fill="' + esc(P.accentHover) + '"/>';
  html += '</svg></div>';
  html += '<pre style="background:var(--text);color:var(--bg);padding:20px;border-radius:var(--radius);font-family:var(--font-mono);font-size:11px;line-height:1.7;overflow-x:auto;margin:0;max-height:220px;overflow-y:auto">';
  html += esc('<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n  <rect width="64" height="64" rx="14" fill="' + P.text + '"/>\n  <rect x="7" y="14" width="22" height="28" rx="3" fill="' + P.accent + '"/>\n  <rect x="32" y="20" width="24" height="18" rx="3" fill="' + P.bgCard + '"/>\n  <rect x="36" y="26" width="16" height="18" rx="3" fill="' + P.accentHover + '"/>\n</svg>');
  html += '</pre></div>';

  html += '<p style="font-size:13px;color:var(--accent);margin-top:12px;padding:12px 16px;background:' + accent10 + ';border-radius:6px;line-height:1.6">';
  html += '消费 Token：--text（Logo 底色）· --accent（主色块）· --bg-card（辅色块）· --accent-hover（点缀色块）';
  html += '</p>';

  return html;
}

function buildOverlayDemos(P) {
  const hoverOverlay = hexToRgba(P.text, 0.16);
  const modalOverlay = hexToRgba(P.text, 0.4);
  const glassBg = hexToRgba(P.bg, 0.7);

  let html = '';

  // Hover card demo
  html += '<h4 style="font-size:16px;font-weight:600;margin-bottom:12px;color:var(--text)">卡片 Hover · 半透明叠加</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:12px">';
  html += '<div class="asset-hover-card" style="padding:20px 24px;text-align:center">';
  html += '<div style="font-size:14px;font-weight:500;margin-bottom:4px">Template Card</div>';
  html += '<div style="font-size:12px;color:var(--text-soft)">悬停查看效果</div>';
  html += '<div class="hover-overlay" style="background:' + esc(hoverOverlay) + ';display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff">' + esc(hoverOverlay) + '</div></div>';
  html += '<div style="font-size:13px;color:var(--text-soft);line-height:1.6;padding:8px 0">';
  html += '消费 Token：<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">--text</span> → ' + esc(hoverOverlay) + '<br>';
  html += '保持预览可见的同时传达"可点击"。比 modal 遮罩浅 2.5 倍。';
  html += '</div></div>';

  // Modal overlay demo
  html += '<h4 style="font-size:16px;font-weight:600;margin:28px 0 12px;color:var(--text)">弹窗 Overlay · 聚焦遮罩</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">';
  html += '<div class="asset-modal-demo" style="height:160px">';
  html += '<div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px">';
  for (let i = 0; i < 3; i++) html += '<div style="background:var(--bg);border:1px solid var(--line);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted)">card</div>';
  html += '</div>';
  html += '<div class="modal-backdrop" style="background:' + esc(modalOverlay) + '">';
  html += '<div class="modal-dialog" style="background:var(--surface);border:1px solid var(--line)">';
  html += '<div style="font-size:14px;font-weight:600;margin-bottom:4px">Modal Title</div>';
  html += '<div style="font-size:12px;color:var(--text-soft)">' + esc(modalOverlay) + '</div></div></div></div>';
  html += '<div style="font-size:13px;color:var(--text-soft);line-height:1.6;padding:8px 0">';
  html += '消费 Token：<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">--text</span> → ' + esc(modalOverlay) + '<br>';
  html += '比 hover 深 2.5 倍，区分"浏览"和"聚焦"两个信息层级。';
  html += '</div></div>';

  // Glass button demo
  html += '<h4 style="font-size:16px;font-weight:600;margin:28px 0 12px;color:var(--text)">毛玻璃按钮 · Glassmorphism</h4>';
  html += '<div style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin-bottom:12px">';
  html += '<div style="position:relative;height:90px;border-radius:var(--radius);overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,' + esc(P.accent) + ',' + esc(P.accentHover) + ')">';
  html += '<div style="position:absolute;top:12px;right:16px;width:40px;height:40px;border-radius:50%;background:' + esc(P.bg) + ';opacity:.3"></div>';
  html += '<div style="position:absolute;bottom:8px;left:20px;width:60px;height:60px;border-radius:50%;background:' + esc(P.accentHover) + ';opacity:.4"></div>';
  html += '<button class="asset-glass-btn" style="background:' + esc(glassBg) + ';color:' + esc(P.text) + '">查看详情</button>';
  html += '</div>';
  html += '<div style="font-size:13px;color:var(--text-soft);line-height:1.6">';
  html += '消费 Token：<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">--bg</span> → ' + esc(glassBg) + '<br>';
  html += '<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">backdrop-filter: blur(8px)</span><br>';
  html += '按钮可读，不遮挡预览内容。依赖背景层提供视觉深度线索。';
  html += '</div></div>';

  return html;
}

function findTokenName(vars, hex, preferred) {
  if (preferred && vars[preferred]) return preferred;
  for (const [k, v] of Object.entries(vars)) {
    if (v === hex && k.startsWith('--') && !k.startsWith('--font-') && !k.startsWith('--shadow-') && !k.startsWith('--radius') && !k.startsWith('--ease-')) return k;
  }
  return '';
}

function buildDecisions(entry, P, T, vars, assets) {
  const items = [];
  const solidShadow = (assets.implicit.shadow || []).find(s => /^\d+px\s+\d+px\s+0\s/.test(s));
  const implicit = assets.implicit;

  // 1. Typography
  const h1FontSize = (assets.h1Style || '').match(/font-size:([^;]+);/);
  const h1LetterSpacing = (assets.h1Style || '').match(/letter-spacing:([^;]+);/);
  const h1LineHeight = (assets.h1Style || '').match(/line-height:([^;]+);/);

  if (T.display && T.body) {
    const h1Clamp = h1FontSize ? h1FontSize[1].trim() : '';
    const h1LS = h1LetterSpacing ? h1LetterSpacing[1].trim() : '';
    const h1LH = h1LineHeight ? h1LineHeight[1].trim() : '';
    let typeA = '展示字体 <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">--display</span> 选用 ' + T.displayName + '，正文 <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">--body</span> 选用 ' + T.bodyName + '。';
    if (h1Clamp) typeA += ' h1 字号 ' + h1Clamp;
    if (h1LH) typeA += '，行高 ' + h1LH;
    if (h1LS) typeA += '，字间距 ' + h1LS;
    typeA += '。衬线标题+无衬线正文的强对比策略：标题负责"宣言式视觉冲击"（极大字号+极窄字距），正文负责"可读的信息传递"。';
    if (h1Clamp && h1Clamp.includes('clamp')) {
      typeA += ' clamp() 确保从手机到宽屏标题始终占满视口黄金比例——不靠 breakpoint 分段，靠流体缩放。';
    }
    items.push({ q: '为什么标题用 ' + T.displayName + ' + 正文用 ' + T.bodyName + '？', a: typeA, tag: 'typography' });
  }

  // 2. Color: dynamic from actual tokens
  if (P.colors.length > 0) {
    const accentName = findTokenName(vars, P.accent, '--accent');
    const bgName = findTokenName(vars, P.bg, '--bg');
    const accentHex = P.accent;
    const bgHex = P.bg;
    let colorA = '';
    if (accentName && bgName) {
      colorA = '主强调色 <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">' + esc(accentName) + '</span> ' + accentHex + ' 与底色 <span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">' + esc(bgName) + '</span> ' + bgHex + ' 构成本模板的色彩基调。';
      if (assets.bodyBg && assets.bodyBg.includes('radial-gradient')) {
        colorA += ' 背景层叠加 radial-gradient 和点阵纹理模拟纸张纤维质感。';
      }
    } else {
      colorA = P.colors.length + ' 色系统。' + schemeLabel(entry.scheme) + ' 方案。';
    }
    items.push({ q: '为什么 ' + esc(accentName || 'Accent') + ' + ' + esc(bgName || 'Background') + '？', a: colorA, tag: 'color' });
  }

  // 3. Spacing: why these specific values
  const spacingItems = (vars['--page-w'] || vars['--gutter']) ? true : false;
  const padVals = (implicit.spacing.padding || []).length;
  const marginVals = (implicit.spacing.margin || []).length;
  if (spacingItems || padVals + marginVals > 0) {
    let spA = '';
    if (vars['--page-w']) spA += '--page-w: ' + vars['--page-w'] + ' 定义内容最大宽度——单栏宣言不需要多列网格，一行文字太长会丢失阅读节奏，太窄则浪费 screen real estate。';
    if (vars['--gutter']) spA += ' --gutter: ' + vars['--gutter'] + ' 作为全局间距基准。';
    if (!spacingItems && padVals + marginVals > 0) {
      spA += '间距未 Token 化，通过 ' + padVals + ' 处内边距 + ' + marginVals + ' 处外边距硬编码实现。低密度宣言式版面天然需要大量留白——硬编码的 clamp 大间距（如 clamp(68px, 10vw, 132px)）确保 section 之间呼吸感随视口缩放。';
    }
    items.push({ q: '间距策略：为什么是这些值？', a: spA, tag: 'spacing' });
  }

  // 4. Shadow: solid stamp rationale
  if (solidShadow) {
    const s = solidShadow;
    items.push({
      q: '为什么用实心偏移而非模糊阴影？',
      a: 'box-shadow: ' + esc(s) + ' 是粗野主义"印章式"偏移——blur=0、spread=0、纯色不透明。不是 elevation shadow（那暗示 Z 轴层级），是 x/y 平面上的"复制粘贴偏移"——像印章盖歪了、像丝网印刷套色不准。这比任何 drop-shadow 都更有"手工印刷品"的质感。',
      tag: 'shadow'
    });
  }

  // 5. Radius: flat/brutalist intent
  if ((implicit.radius || []).length === 0 && !vars['--radius']) {
    items.push({
      q: '为什么没有圆角？',
      a: '粗野主义 = 拒绝装饰性圆角。所有元素 border-radius 保持 0 或极微小值——版面应像"从印刷机上切下来的"，不是"从手机屏幕里弹出来的"。圆角暗示柔软和 digital-native，直角暗示坚硬和 print-native。',
      tag: 'radius'
    });
  }

  // 6. Layout density rationale from actual page width
  if (entry.density && vars['--page-w']) {
    const w = parseInt(vars['--page-w']);
    const dlabel = { low: '低密度', medium: '中密度', 'medium-high': '中高密度', high: '高密度' }[entry.density] || entry.density;
    items.push({
      q: '为什么「' + dlabel + '」排版？',
      a: '--page-w: ' + vars['--page-w'] + '（内容区宽度）。' + (w && w >= 1100 ? '宽内容区+' + dlabel + '密度 = 宣言式留白——每屏信息量有节制，视觉焦点始终在标题和主行动号召上。' : '内容区宽度与' + dlabel + '密度配合，控制每屏信息量。') + (entry.template_type === 'single-page' ? ' 单页设计天然需要更大的 section 间距来区分内容区块。' : ''),
      tag: 'layout'
    });
  }

  if (items.length === 0) {
    items.push({ q: '设计决策', a: '设计决策记录待补充。', tag: 'general' });
  }
  return items.map(d =>
    '<div class="decision-item"><div class="d-q">' + esc(d.q) + '</div>' +
    '<div class="d-a">' + d.a + '</div>' +
    '<span class="d-tag">' + esc(d.tag) + '</span></div>'
  ).join('\n    ');
}

// ── Copy blocks ──

function buildCssBlock(groups) {
  const order = ['Color', 'Typography', 'Spacing', 'Radius', 'Shadow', 'Motion', 'Other'];
  let css = ':root {\n';
  for (const cat of order) {
    const items = groups[cat];
    if (!items || items.length === 0) continue;
    css += '  /* ' + cat + ' */\n';
    for (const t of items) {
      css += '  ' + t.name + ': ' + t.value + ';\n';
    }
    css += '\n';
  }
  css += '}';
  return css;
}

function buildJsonBlock(entry, groups) {
  const obj = {
    template: entry.slug,
    name: entry.name,
    style: [entry.design_style, entry.template_type].filter(Boolean),
    design_philosophy: (entry.tagline || '') + '. ' + styleLabel(entry.design_style) + '. ' + schemeLabel(entry.scheme) + '.',
    tokens: {}
  };
  for (const [cat, items] of Object.entries(groups)) {
    obj.tokens[cat.toLowerCase()] = {};
    for (const t of items) {
      const key = (t.role || t.name.replace('--', '').replace(/-/g, '_'));
      obj.tokens[cat.toLowerCase()][key] = { var: t.name, value: t.value };
    }
  }
  return JSON.stringify(obj, null, 2);
}

function buildAiBlock() {
  const promptPath = path.join(__dirname, '..', 'meta', 'ai-system-prompt.md');
  try {
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (e) {
    return '# 版式画廊 · 模板生成规范\n\n(ai-system-prompt.md 未找到)';
  }
}

// ── Helpers ──

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(s) { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }

function cleanSpacingVal(val) {
  // Strip trailing } (captured from CSS rule ending without semicolon)
  // and skip values that look like CSS fragments
  let v = val.trim();
  v = v.replace(/}$/, '').trim();
  if (!v || v.includes('{') || v.includes('\n')) return '';
  // Skip clamp() — responsive design formulas, not hardcoded spacings
  if (v.startsWith('clamp(')) return '';
  // Skip zero values and multi-value shorthands starting with 0
  if (v === '0' || /^0\s/.test(v)) return '';
  return v;
}

function styleLabel(s) {
  const map = { 'minimalist': '极简', 'editorial': '杂志编辑', 'swiss': '瑞士国际', 'corporate': '企业商务',
    'brutalist': '粗野主义', 'modern': '现代科技', 'retro': '复古经典', 'organic': '自然柔和', 'luxury': '奢华暗色', 'playful': '活泼创意' };
  return map[s] || s || '';
}

function schemeLabel(s) {
  const map = { light: '亮色', dark: '暗色', mixed: '混合' };
  return map[s] || s || '';
}

function densityLabel(s) {
  const map = { high: '高密度', 'medium-high': '中高密度', medium: '中密度', low: '低密度' };
  return map[s] || s || '';
}

function formalityLabel(s) {
  const map = { high: '权威', 'medium-high': '正式', medium: '适中', 'medium-low': '半正式', low: '休闲' };
  return map[s] || s || '';
}

function typeLabel(s) {
  const map = { 'single-page': '单页', 'slide-deck': '幻灯片', report: '报告', infographic: '信息图', 'social-card': '社交卡片', poster: '海报' };
  return map[s] || s || '';
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return 'rgba(37,99,235,' + alpha + ')';
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) { alpha = parseInt(h.substring(6, 8), 16) / 255; h = h.substring(0, 6); }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function extractHex(val) {
  if (!val) return '';
  const m = val.match(/#[0-9a-fA-F]{3,8}/);
  return m ? m[0] : '';
}

function isDarkColor(hex) {
  if (!hex || !hex.match(/^#[0-9a-fA-F]{3,8}$/)) return false;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.substring(0, 6);
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

function cssValToPx(val) {
  if (!val) return 0;
  var num = parseFloat(val);
  if (isNaN(num)) return 0;
  if (val.indexOf('rem') !== -1) num = num * 16;
  return Math.round(num);
}

function fontShortName(stack) {
  if (!stack) return '';
  const first = stack.split(',')[0].trim().replace(/['"]/g, '');
  return first.length > 20 ? first.substring(0, 18) + '...' : first;
}

// ── Texture CSS extraction ──
function extractTextureCSS(html, classNames) {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return '';
  const css = styleMatch[1];

  // Try comment-marker extraction first
  const texStart = css.search(/\/\*\s*─{1,3}\s*Texture system/i);
  if (texStart >= 0) {
    const afterTex = css.substring(texStart);
    const nextSection = afterTex.search(/\/\*\s*─{1,3}\s*(?:Cursor|Meadow|Responsive|[A-Z])/i);
    if (nextSection > 0) return afterTex.substring(0, nextSection).trim();
    return afterTex.trim();
  }

  // Fallback: extract by class name
  const escaped = classNames.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const clsRegex = new RegExp(escaped.map(c => '\\.' + c).join('|'), 'i');
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
  const out = [];
  let match;
  while ((match = ruleRegex.exec(css)) !== null) {
    if (clsRegex.test(match[1])) {
      out.push(match[1].trim() + ' { ' + match[2].trim() + ' }');
    }
  }
  return out.join('\n');
}

// ── Cursor CSS extraction ──
function extractCursorCSS(html) {
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return '';
  const css = styleMatch[1];

  // Extract cursor section by comment marker.
  // Template has cursor inside main body block: body { ... cursor ... }
  // We extract the 3 cursor rules and reconstruct with proper selectors.
  const cursorCommentStart = css.search(/\/\*\s*─{1,3}\s*Custom cursor/i);
  if (cursorCommentStart < 0) return '';

  // Find all 3 cursor: url(...) blocks in order
  const cursorRe = /(?:([^{}]*?)\s*\{\s*)?cursor:\s*url\("([^"]+)"\)\s+(\d+)\s+(\d+)\s*,\s*auto\s*;?\s*\}/g;
  let m;
  const rules = [];
  while ((m = cursorRe.exec(css)) !== null) {
    if (m.index + m[0].length <= cursorCommentStart) continue;
    rules.push({ selector: (m[1] || '').trim(), data: m[2], x: m[3], y: m[4] });
  }
  if (rules.length < 3) return '';

  return [
    'body {\n  cursor: url("' + rules[0].data + '") ' + rules[0].x + ' ' + rules[0].y + ', auto;\n}',
    '',
    (rules[1].selector || 'a:hover, button:hover, [role="button"]:hover, nav a:hover, .tx-card:hover, .hamburger:hover') + ' {\n  cursor: url("' + rules[1].data + '") ' + rules[1].x + ' ' + rules[1].y + ', auto;\n}',
    '',
    'body:active {\n  cursor: url("' + rules[2].data + '") ' + rules[2].x + ' ' + rules[2].y + ', auto;\n}'
  ].join('\n');
}

// ── Meadow JS extraction ──
function extractMeadowJS(html) {
  // Find script containing meadow-plant
  const match = html.match(/<script>([\s\S]*?meadow-plant[\s\S]*?)<\/script>/i);
  if (!match) {
    // Try click-to-plant
    const m2 = html.match(/<script>([\s\S]*?click.to.plant[\s\S]*?)<\/script>/i);
    return m2 ? m2[1].trim() : '';
  }
  return match[1].trim();
}

// ── Texture section builder ──
function buildTextureSection(textures, P) {
  let html = '<h3 class="bk-asset-subhead">结构纹理</h3>';
  html += '<p class="bk-asset-subdesc">六种纯 CSS 结构纹理——白底 + 渐变过渡，无背景图、无 WebGL。纹理密度、角度、透明度均可调。"结构即纹理"——1px 边框、网格间隙、渐变线即是装饰。</p>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden">';
  for (const tx of textures) {
    const cls = tx.cssClass;
    let previewHTML = '';
    if (cls === 'tx-grid-fade') {
      previewHTML = '<div class="' + cls + '" style="height:100px;border-radius:var(--radius-sm);overflow:hidden;margin-bottom:16px">' +
        Array(32).fill('<span></span>').join('') + '</div>';
    } else {
      previewHTML = '<div class="' + cls + '" style="height:100px;border-radius:var(--radius-sm);margin-bottom:16px;' +
        (cls === 'tx-noise-fade' ? 'position:relative;overflow:hidden;' : '') + '"></div>';
    }
    html += '<div style="background:var(--surface);padding:28px 24px">';
    html += previewHTML;
    html += '<div style="font-size:var(--brand-t-xl);font-weight:600;margin-bottom:6px;color:var(--text)">' + esc(tx.name) + '</div>';
    html += '<div style="font-family:var(--font-mono);font-size:var(--brand-t-2xs);color:var(--accent);margin-bottom:12px">.' + esc(cls) + '</div>';
    html += '<div style="font-size:var(--brand-t-sm);color:var(--text-soft);line-height:1.6;margin-bottom:10px">' + esc(tx.usage) + '</div>';
    html += '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);line-height:1.6;background:var(--bg);padding:10px 12px;border-radius:4px;white-space:pre-wrap">' + esc(tx.technique) + '</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ── Cursor section builder ──
function buildCursorSection(cursor, P, cursorCSS) {
  let html = '<h3 class="bk-asset-subhead">自定义光标</h3>';
  html += '<p class="bk-asset-subdesc">SVG 光标系统——草为杆、花为指。三态光标（默认/悬停/按下）全部由纯 SVG + CSS cursor 实现，不依赖图片资源。</p>';

  // Parse SVG data URIs from cursorCSS
  const svgDataURIs = [];
  if (cursorCSS) {
    const uriRe = /url\("([^"]+)"\)/g;
    let m;
    while ((m = uriRe.exec(cursorCSS)) !== null) {
      const uri = m[1];
      if (uri.startsWith('data:image/svg+xml;base64,')) {
        svgDataURIs.push(uri.replace('data:image/svg+xml;base64,', ''));
      }
    }
  }
  // Decode base64 to SVG markup
  const svgMarkups = svgDataURIs.map(b64 => Buffer.from(b64, 'base64').toString('utf-8'));

  // Cursor state cards with rendered SVG previews
  const states = cursor.states || [];
  if (states.length > 0) {
    html += '<div style="display:grid;grid-template-columns:repeat(' + states.length + ',1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;margin-bottom:24px">';
    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      const svg = svgMarkups[i] || '';
      html += '<div style="background:var(--surface);padding:28px 24px;text-align:center">';
      html += '<div style="display:flex;justify-content:center;align-items:center;height:80px;margin-bottom:16px">';
      html += svg;
      html += '</div>';
      html += '<div style="font-size:var(--brand-t-xl);font-weight:600;margin-bottom:4px;color:var(--text)">' + esc(s.name) + '</div>';
      html += '<div style="font-family:var(--font-mono);font-size:var(--brand-t-2xs);color:var(--text-muted);margin-bottom:10px">hotspot: ' + esc(s.hotspot) + '</div>';
      html += '<div style="font-size:var(--brand-t-sm);color:var(--text-soft);line-height:1.6">' + esc(s.description) + '</div>';
      html += '</div>';
    }
    html += '</div>';
  }

  // Meadow note
  if (cursor.meadow && cursor.meadow.enabled) {
    html += '<div style="display:flex;gap:20px;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:28px">';
    html += '<div style="flex-shrink:0;width:56px;height:56px">' + (svgMarkups[0] || '') + '</div>';
    html += '<div>';
    html += '<h4 style="font-size:var(--brand-t-xl);font-weight:600;margin-bottom:8px;color:var(--text)">点击种草地</h4>';
    html += '<p style="font-size:var(--brand-t-base);color:var(--text-soft);line-height:1.7">' + esc(cursor.meadow.description) + '</p>';
    html += '<div style="display:flex;gap:16px;margin-top:12px;font-family:var(--font-mono);font-size:var(--brand-t-xs);color:var(--text-muted)">';
    html += '<span>最多: ' + esc(String(cursor.meadow.maxPlants)) + ' 株</span>';
    html += '<span>寿命: ' + esc(String(cursor.meadow.lifetimeMs)) + 'ms</span>';
    html += '</div></div></div>';
  }

  return html;
}

module.exports = { renderBrandKit };

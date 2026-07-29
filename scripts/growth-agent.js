// growth-agent.js — 生长 Agent 核心管线
// URL → tokens.json → :root → 三文件交付
//
// 步骤: 1.验证URL 2.抓取样式(3层回退) 3.Gemini视觉提取(AIGO) 4.DeepSeek结构化
//       5.schema校验 6.sync-roots.js 7.审核门
//
// Usage: const { runPipeline } = require('./scripts/growth-agent');
//        await runPipeline(url, { onProgress(step, data) {...} });

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

const PROJECT_DIR = path.resolve(__dirname, '..');

// ── Config ─────────────────────────────────────────────────────

const AIGO_BASE = process.env.AIGO_BASE_URL || 'https://aigoapi.com';
const AIGO_KEY = process.env.AIGOAPI_API_KEY || process.env.AIGOAPI_KEY || process.env.AIGO_API_KEY || '';
const AIGO_MODEL = process.env.AIGO_MODEL || 'gemini-3.1-flash-image';

const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_MODEL = 'deepseek-chat';

// ── Step 1: URL validation ─────────────────────────────────────

function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { ok: false, error: 'URL 为空' };
  }
  // Ensure protocol
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, error: '仅支持 http/https 协议' };
    }
    return {
      ok: true,
      url: normalized,
      hostname: parsed.hostname,
      slug: hostnameToSlug(parsed.hostname),
    };
  } catch (e) {
    return { ok: false, error: '无效 URL: ' + e.message };
  }
}

function hostnameToSlug(hostname) {
  return hostname
    .replace(/^www\./, '')
    .replace(/\.(com|cn|org|net|io|dev|co|ai|app|site|design)$/, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40);
}

// ── Step 2: 3-tier CSS fetch ───────────────────────────────────

async function fetchSiteStyles(url, hostname) {
  // Tier 1: server-side fetch
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
      responseType: 'text',
    });

    const html = response.data;
    const cssVars = extractCssVariables(html);
    const fontStacks = extractFontStacks(html);
    const hardcodedStyles = extractHardcodedStyles(html);

    if (cssVars.length > 0 || hardcodedStyles.colors.length > 0) {
      return {
        tier: 1,
        method: 'server-fetch',
        hostname,
        cssVars,
        fontStacks,
        hardcoded: hardcodedStyles,
        htmlLength: html.length,
      };
    }

    // Tier 1 got HTML but no CSS variables — try fetching linked stylesheets
    const cssResults = await fetchLinkedStylesheets(html, url);
    if (cssResults.vars.length > 0) {
      return {
        tier: 1,
        method: 'linked-stylesheets',
        hostname,
        cssVars: cssResults.vars,
        fontStacks,
        hardcoded: hardcodedStyles,
        htmlLength: html.length,
      };
    }

    return {
      tier: 1,
      method: 'server-fetch',
      hostname,
      cssVars: [],
      fontStacks,
      hardcoded: hardcodedStyles,
      htmlLength: html.length,
      warning: 'no :root or CSS variables found in HTML or linked stylesheets',
    };
  } catch (e) {
    // Tier 1 failed
    return {
      tier: 1,
      method: 'server-fetch',
      hostname,
      error: e.message,
      cssVars: [],
      fontStacks: [],
      hardcoded: { colors: [], spacing: [], shadows: [], radii: [], transitions: [] },
    };
  }
}

async function fetchLinkedStylesheets(html, baseUrl) {
  const linkRe = /<link[^>]*rel=["']?stylesheet["']?[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const vars = [];
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    try {
      const cssUrl = new URL(m[1], baseUrl).href;
      const resp = await axios.get(cssUrl, { timeout: 10000, responseType: 'text' });
      const cssVars = extractCssVariablesFromCss(resp.data);
      vars.push(...cssVars);
    } catch (_) { /* skip failed stylesheets */ }
  }
  return { vars };
}

function extractCssVariables(html) {
  const vars = [];
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatch) {
    for (const s of styleMatch) {
      const css = s.replace(/<style[^>]*>([\s\S]*?)<\/style>/i, '$1');
      vars.push(...extractCssVariablesFromCss(css));
    }
  }
  return vars;
}

function extractCssVariablesFromCss(css) {
  const vars = [];
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/s);
  if (rootMatch) {
    const re = /--([\w-]+)\s*:\s*([^;]+);/g;
    let m;
    while ((m = re.exec(rootMatch[1])) !== null) {
      vars.push({ name: '--' + m[1], value: m[2].trim() });
    }
  }
  return vars;
}

function extractFontStacks(html) {
  const stacks = [];
  const ffRe = /font-family\s*:\s*([^;};]+)/gi;
  let m;
  while ((m = ffRe.exec(html)) !== null) {
    const val = m[1].trim().replace(/\n/g, ' ');
    if (val && !stacks.includes(val) && val.length > 3) {
      stacks.push(val);
    }
  }
  // Deduplicate and take top 10
  return [...new Set(stacks)].slice(0, 10);
}

function extractHardcodedStyles(html) {
  const cssBlocks = [];
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatch) {
    for (const s of styleMatch) {
      cssBlocks.push(s.replace(/<style[^>]*>([\s\S]*?)<\/style>/i, '$1'));
    }
  }
  // Also check inline styles
  const inlineStyles = html.match(/style="([^"]+)"/gi) || [];
  for (const s of inlineStyles) {
    cssBlocks.push(s.replace(/style="([^"]+)"/i, '$1'));
  }

  const allCss = cssBlocks.join('\n');

  const colors = [];
  const hexRe = /#[0-9a-fA-F]{3,8}/g;
  let m;
  while ((m = hexRe.exec(allCss)) !== null) {
    const hex = m[0];
    if (hex.length === 4 || hex.length === 7 || hex.length === 9) {
      if (!colors.includes(hex)) colors.push(hex);
    }
  }

  const shadows = [];
  const shadowRe = /box-shadow\s*:\s*([^;};]+)/gi;
  while ((m = shadowRe.exec(allCss)) !== null) {
    const s = m[1].trim();
    if (s !== 'none' && !shadows.includes(s)) shadows.push(s);
  }

  const radii = [];
  const radiusRe = /border-radius\s*:\s*([^;};]+)/gi;
  while ((m = radiusRe.exec(allCss)) !== null) {
    const r = m[1].trim();
    if (!radii.includes(r)) radii.push(r);
  }

  const transitions = [];
  const transRe = /transition\s*:\s*([^;};]+)/gi;
  while ((m = transRe.exec(allCss)) !== null) {
    const t = m[1].trim();
    if (!transitions.includes(t)) transitions.push(t);
  }

  const spacing = [];
  const padRe = /padding(?:-top|-bottom|-left|-right)?\s*:\s*([^;};]+)/gi;
  while ((m = padRe.exec(allCss)) !== null) {
    const s = m[1].trim();
    if (!s.includes('var(--') && !spacing.some(x => x.val === s)) {
      spacing.push({ prop: 'padding', val: s });
    }
  }

  return { colors, shadows, radii, transitions, spacing };
}

// ── Step 3: Gemini vision extraction (AIGO) ─────────────────────

async function extractVisual(siteData) {
  // Build prompt with all available CSS data
  const prompt = buildExtractionPrompt(siteData);
  const screenshotBase64 = siteData.screenshot || null;

  const messages = [];
  const content = [{ type: 'text', text: prompt }];
  if (screenshotBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: 'data:image/png;base64,' + screenshotBase64 }
    });
  }

  messages.push({ role: 'user', content });

  const response = await axios.post(AIGO_BASE + '/v1/chat/completions', {
    model: AIGO_MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0.3,
  }, {
    headers: {
      'Authorization': 'Bearer ' + AIGO_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });

  const text = response.data.choices[0].message.content;
  return parseVisualExtraction(text);
}

function buildExtractionPrompt(siteData) {
  let p = `You are a design token extractor. Analyze the following website's design system data and extract structured design tokens.

## CSS Custom Properties (:root variables)
${JSON.stringify(siteData.cssVars || [], null, 2)}

## Font stacks detected
${JSON.stringify(siteData.fontStacks || [], null, 2)}

## Hardcoded design values (from CSS)
Colors: ${JSON.stringify(siteData.hardcoded?.colors || [])}
Shadows: ${JSON.stringify(siteData.hardcoded?.shadows || [])}
Border radii: ${JSON.stringify(siteData.hardcoded?.radii || [])}
Transitions: ${JSON.stringify(siteData.hardcoded?.transitions || [])}
Spacing values: ${JSON.stringify(siteData.hardcoded?.spacing || [])}

${siteData.screenshot ? '(A screenshot of the website is also provided for visual reference.)' : ''}

## Output format — respond ONLY with valid JSON, no markdown:
{
  "colors": [
    {"name": "--bg", "value": "#hex", "role": "surface-bg", "description": "页面底色"},
    ...
  ],
  "typography": [
    {"name": "--font-sans", "value": "'Font Name',sans-serif", "role": "body-font", "description": "正文字体"},
    {"name": "--text-3xl", "value": "32px", "role": "display-size", "description": "主标题"},
    ...
  ],
  "spacing": [
    {"name": "--space-3xl", "value": "48px", "role": "hero-spacing", "description": "顶部留白"},
    ...
  ],
  "radius": [
    {"name": "--radius-lg", "value": "16px", "role": "card", "description": "大圆角"},
    ...
  ],
  "shadow": [
    {"name": "--shadow-sm", "value": "0 1px 3px rgba(0,0,0,0.04)", "role": "default", "description": "默认阴影"},
    ...
  ],
  "motion": [
    {"name": "--ease-default", "value": "cubic-bezier(0.4,0,0.2,1)", "role": "standard-easing", "description": "标准缓动"},
    ...
  ],
  "style_signals": {
    "design_style": "editorial|swiss-minimal|warm-humanist|tech-cyberpunk|experimental|institutional|eastern-zen",
    "scheme": "light|dark|mixed",
    "density": "high|medium-high|medium|low",
    "formality": "high|medium-high|medium|medium-low|low"
  }
}

Rules:
1. Every token MUST have name (--prefix), value, role, description — all 4 fields
2. Use the ACTUAL hex colors, font names, and values from the data — do not make up values
3. If a category has no data, return empty array []
4. Group sizes logically: 3-5 spacing levels, 4-6 radius levels, 1-2 shadows, 2-3 motion durations
5. font stacks: use the EXACT font-family values from the data
6. color values: use the EXACT hex values from the data
7. Use standard role names: surface-bg, surface-card, text-primary, text-secondary, border-default, accent, accent-hover, body-font, mono-font, display-size, body-size, hero-spacing, section-spacing, page-padding, card-padding, element-gap, tight-gap, card, subtle, sharp, default, card-hover, standard-easing, duration-fast, duration-base
`;
  return p;
}

function parseVisualExtraction(text) {
  // Strip markdown code fences
  let json = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  // Find first { and last }
  const start = json.indexOf('{');
  const end = json.lastIndexOf('}');
  if (start >= 0 && end > start) {
    json = json.slice(start, end + 1);
  }
  try {
    return { ok: true, data: JSON.parse(json) };
  } catch (e) {
    return { ok: false, error: 'Gemini 输出非 JSON: ' + e.message, raw: text.slice(0, 500) };
  }
}

// ── Step 4: DeepSeek structuring ───────────────────────────────

async function structureTokens(rawExtraction, hostname) {
  const prompt = `You are a design token formatter. Convert the extracted design data into a valid tokens.json file.

## Raw extraction from Gemini:
${JSON.stringify(rawExtraction, null, 2)}

## Target schema:
{
  "slug": "${hostnameToSlug(hostname)}",
  "version": 1,
  "source": "生长 Agent · URL → tokens.json 自动提取",
  "categories": ["color", "typography", "spacing", "radius", "shadow", "motion"],
  "tokens": {
    "color": [{"name": "--var", "value": "val", "role": "role", "description": "desc"}],
    "typography": [...],
    "spacing": [...],
    "radius": [...],
    "shadow": [...],
    "motion": [...]
  }
}

## Token contract (required roles per category):
- color: surface-bg, surface-card, text-primary, text-secondary, border-default, accent, accent-hover
- typography: body-font, mono-font, display-size, h2-size, h3-size, body-size, small-size
- spacing: hero-spacing, section-spacing, page-padding, card-padding, element-gap, tight-gap
- radius: card (at least 3 levels), subtle, sharp
- shadow: default, card-hover
- motion: standard-easing, duration-fast, duration-base

## Rules:
1. Output ONLY valid JSON, no markdown fences, no explanation
2. Ensure every token has all 4 required fields: name, value, role, description
3. If the raw extraction is missing a required role, add it with a reasonable default value
4. Sort tokens from largest to smallest (spacing, radius, font sizes)
5. Use Chinese descriptions
6. The "source" field must be: "生长 Agent · URL → tokens.json 自动提取"
7. Slug: "${hostnameToSlug(hostname)}"

## Additional style signals from extraction:
${JSON.stringify(rawExtraction.style_signals || {}, null, 2)}

Based on the style_signals, make appropriate design decisions for default values of missing roles.`;

  const response = await axios.post(DEEPSEEK_BASE + '/v1/chat/completions', {
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
    temperature: 0.2,
  }, {
    headers: {
      'Authorization': 'Bearer ' + DEEPSEEK_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });

  const text = response.data.choices[0].message.content;
  let json = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = json.indexOf('{');
  const end = json.lastIndexOf('}');
  if (start >= 0 && end > start) json = json.slice(start, end + 1);

  try {
    const data = JSON.parse(json);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: 'DeepSeek 输出非 JSON: ' + e.message, raw: text.slice(0, 500) };
  }
}

// ── Step 5: Validation ─────────────────────────────────────────

function validateTokens(tokensData) {
  const errors = [];
  const requiredCategories = ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'];
  const requiredRoles = {
    color: ['surface-bg', 'surface-card', 'text-primary', 'text-secondary', 'border-default', 'accent'],
    typography: ['body-font', 'body-size'],
    spacing: ['page-padding', 'card-padding', 'element-gap'],
    radius: ['card'],
    shadow: ['default'],
    motion: ['standard-easing', 'duration-base'],
  };

  if (!tokensData.tokens) {
    return { ok: false, errors: ['缺少 tokens 字段'] };
  }

  for (const cat of requiredCategories) {
    if (!tokensData.tokens[cat]) {
      errors.push('缺少分类: ' + cat);
      continue;
    }
    const tokens = tokensData.tokens[cat];
    if (!Array.isArray(tokens) || tokens.length === 0) {
      errors.push('分类 ' + cat + ' 为空');
      continue;
    }

    // Check required roles
    const roles = new Set(tokens.map(t => t.role).filter(Boolean));
    for (const role of (requiredRoles[cat] || [])) {
      if (!roles.has(role)) {
        errors.push(cat + ' 缺少角色: ' + role);
      }
    }

    // Check each token has all 4 fields
    for (const t of tokens) {
      if (!t.name) errors.push(cat + ': token 缺 name');
      if (!t.value) errors.push(cat + ': ' + (t.name || '?') + ' 缺 value');
      if (t.role === undefined) errors.push(cat + ': ' + (t.name || '?') + ' 缺 role');
      if (t.description === undefined) errors.push(cat + ': ' + (t.name || '?') + ' 缺 description');
    }
  }

  return { ok: errors.length === 0, errors };
}

// ── Step 6: Write & sync ───────────────────────────────────────

function writeAndSync(tokensData, slug) {
  const tmplDir = findTemplateDir(slug) || path.join(PROJECT_DIR, 'templates', '_growth', slug);
  if (!fs.existsSync(tmplDir)) fs.mkdirSync(tmplDir, { recursive: true });

  // Write tokens.json
  const tokensPath = path.join(tmplDir, 'tokens.json');
  fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2), 'utf-8');

  // Ensure template.html exists (create minimal if needed)
  const tmplPath = path.join(tmplDir, 'template.html');
  if (!fs.existsSync(tmplPath)) {
    const minimalHtml = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<style>\n:root{\n}\n</style>\n</head>\n<body></body>\n</html>\n`;
    fs.writeFileSync(tmplPath, minimalHtml, 'utf-8');
  }

  // Run sync-roots.js to generate :root
  try {
    execSync('node "' + path.join(PROJECT_DIR, 'scripts', 'sync-roots.js') + '" --dir=' + path.relative(PROJECT_DIR, tmplDir), {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
      timeout: 10000,
    });
  } catch (e) {
    return { ok: false, error: 'sync-roots.js 执行失败: ' + (e.stderr || e.message) };
  }

  // Verify :root was written
  const html = fs.readFileSync(tmplPath, 'utf-8');
  if (!html.includes(':root{') || !html.includes('--bg')) {
    return { ok: false, error: ':root 生成验证失败 — template.html 未包含 :root 块' };
  }

  return { ok: true, dir: tmplDir, tokensPath, tmplPath };
}

function findTemplateDir(slug) {
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      if (e.name === slug) return full;
      const found = walk(full);
      if (found) return found;
    }
    return null;
  }
  return walk(path.join(PROJECT_DIR, 'templates'));
}

// ── Pipeline orchestrator ──────────────────────────────────────

async function runPipeline(inputUrl, callbacks = {}) {
  const { onProgress = () => {}, onError = () => {} } = callbacks;

  const emit = (step, status, data = {}) => {
    onProgress({ step, status, ...data, timestamp: Date.now() });
  };

  try {
    // Step 1: Validate
    emit(1, 'running', { message: '验证 URL...' });
    const validated = validateUrl(inputUrl);
    if (!validated.ok) {
      emit(1, 'error', { error: validated.error });
      return { ok: false, step: 1, error: validated.error };
    }
    emit(1, 'done', { url: validated.url, slug: validated.slug, hostname: validated.hostname });

    // Step 2: Fetch styles
    emit(2, 'running', { message: '抓取网站样式...' });
    const siteData = await fetchSiteStyles(validated.url, validated.hostname);
    if (siteData.error && !siteData.hardcoded?.colors?.length) {
      emit(2, 'error', { error: siteData.error, hint: '网站可能屏蔽了服务器访问，请提供截图' });
      return {
        ok: false,
        step: 2,
        error: '无法抓取网站样式',
        needsScreenshot: true,
        validated,
      };
    }
    emit(2, 'done', {
      tier: siteData.tier,
      method: siteData.method,
      cssVarCount: (siteData.cssVars || []).length,
      colorCount: (siteData.hardcoded?.colors || []).length,
      fontCount: (siteData.fontStacks || []).length,
      warning: siteData.warning,
    });

    // Step 3: Extract via Gemini
    emit(3, 'running', { message: 'Gemini 3.1 Flash 视觉提取...' });
    if (!AIGO_KEY) {
      emit(3, 'error', { error: 'AIGOAPI_API_KEY / AIGO_API_KEY 未配置' });
      return { ok: false, step: 3, error: 'AIGOAPI_API_KEY / AIGO_API_KEY 未配置。请设置环境变量 AIGOAPI_API_KEY 或 AIGO_API_KEY。' };
    }
    const extraction = await extractVisual(siteData);
    if (!extraction.ok) {
      emit(3, 'error', { error: extraction.error });
      return { ok: false, step: 3, error: extraction.error, raw: extraction.raw };
    }
    emit(3, 'done', {
      colorCount: (extraction.data.colors || []).length,
      fontCount: (extraction.data.typography || []).filter(t => t.name.includes('font')).length,
      styleSignals: extraction.data.style_signals,
    });

    // Step 4: Structure via DeepSeek
    emit(4, 'running', { message: 'DeepSeek 结构化 tokens.json...' });
    if (!DEEPSEEK_KEY) {
      emit(4, 'error', { error: 'DEEPSEEK_API_KEY 未配置' });
      return { ok: false, step: 4, error: 'DEEPSEEK_API_KEY 未配置。' };
    }
    const structured = await structureTokens(extraction.data, validated.hostname);
    if (!structured.ok) {
      emit(4, 'error', { error: structured.error });
      return { ok: false, step: 4, error: structured.error, raw: structured.raw };
    }
    emit(4, 'done', { categories: Object.keys(structured.data.tokens || {}).length });

    // Step 5: Validate schema
    emit(5, 'running', { message: '校验 tokens.json schema...' });
    const validation = validateTokens(structured.data);
    if (!validation.ok) {
      emit(5, 'error', { errors: validation.errors });
      return { ok: false, step: 5, error: 'Schema 校验失败', errors: validation.errors };
    }
    emit(5, 'done', { valid: true });

    // Step 6: Write + sync
    emit(6, 'running', { message: '写入文件 + sync-roots.js :root 生成...' });
    const written = writeAndSync(structured.data, validated.slug);
    if (!written.ok) {
      emit(6, 'error', { error: written.error });
      return { ok: false, step: 6, error: written.error };
    }
    emit(6, 'done', {
      dir: path.relative(PROJECT_DIR, written.dir),
      tokensPath: path.relative(PROJECT_DIR, written.tokensPath),
      tmplPath: path.relative(PROJECT_DIR, written.tmplPath),
    });

    // Done
    emit('complete', 'done', {
      slug: validated.slug,
      brandUrl: '/brand/' + validated.slug,
      dir: path.relative(PROJECT_DIR, written.dir),
    });

    return {
      ok: true,
      slug: validated.slug,
      tokensData: structured.data,
      dir: written.dir,
      brandUrl: '/brand/' + validated.slug,
    };
  } catch (e) {
    onError(e);
    return { ok: false, error: '管线异常: ' + e.message };
  }
}

// ── Exports ────────────────────────────────────────────────────

module.exports = {
  runPipeline,
  validateUrl,
  fetchSiteStyles,
  extractVisual,
  structureTokens,
  validateTokens,
  writeAndSync,
};

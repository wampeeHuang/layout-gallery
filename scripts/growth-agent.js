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
const DEEPSEEK_MODEL = 'deepseek-v4-flash'; // deepseek-chat retired 2026-07-24; v4-flash with thinking:disabled = non-reasoning mode

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
        textContent: extractTextContent(html),
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
        textContent: extractTextContent(html),
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
      textContent: extractTextContent(html),
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
      textContent: '',
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

// ── Text content extraction from HTML ─────────────────────────────

function extractTextContent(html) {
  if (!html || typeof html !== 'string') return '';
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
  return text;
}

// ── Step 3: Script preprocessing — categorize CSS vars into semantic buckets ──

function categorizeCandidates(cssVars, hardcoded) {
  // Group raw CSS vars into semantic buckets for AI selection.
  // AI only picks from these candidates — no JSON formatting burden.

  const COLOR_VALUE = /(^#[0-9a-fA-F]{3,8}$|^rgba?\(|^hsla?\(|^color-mix|^linear-gradient|^transparent$)/;
  const SIZE_VALUE = /(px|rem|em|%|vh|vw)$/;
  const FONT_VALUE = /^['"]|sans-serif|serif|monospace/i;

  // ── Color candidates ──
  const semaColors = cssVars.filter(v =>
    /^--sema-color-(icon|text|background|border|dataviz)/.test(v.name) &&
    /^#[0-9a-fA-F]{3,8}$/.test(v.value)  // only solid hex, no var() refs
  );

  const hardcodedHexColors = (hardcoded?.colors || [])
    .filter(c => /^#[0-9a-fA-F]{3,8}$/.test(c.val))
    .map(c => ({ name: 'hardcoded', value: c.val, context: c.prop }));

  // Extract pure hex colors from base-color palette
  const baseColors = cssVars.filter(v =>
    /^--base-color-/.test(v.name) && /^#[0-9a-fA-F]{3,8}$/.test(v.value)
  );

  // Group by likely role based on name patterns
  const candidates = {
    accent: [],
    backgrounds: [],
    texts: [],
    borders: [],
  };

  for (const v of semaColors) {
    const val = v.value;
    const isBgVar = /background/.test(v.name);
    const isAccentLike = /performance-plus/.test(v.name) || /primary/.test(v.name);

    // Accent: performance/primary colors + dataviz colors, but NOT background vars
    if (isAccentLike && !isBgVar) {
      candidates.accent.push({ name: v.name, value: val, hint: 'accent-primary' });
    } else if (/dataviz/.test(v.name)) {
      candidates.accent.push({ name: v.name, value: val, hint: 'accent-alt-candidate' });
    } else if (isBgVar && /default/.test(v.name) && !/wash|scrim|gradient/.test(v.name)) {
      candidates.backgrounds.push({ name: v.name, value: val });
    } else if (isBgVar && /secondary/.test(v.name)) {
      candidates.backgrounds.push({ name: v.name, value: val });
    } else if (/text/.test(v.name) && /default/.test(v.name) && !isBgVar) {
      candidates.texts.push({ name: v.name, value: val });
    } else if (/text/.test(v.name) && /subtle/.test(v.name) && !isBgVar) {
      candidates.texts.push({ name: v.name, value: val, role: 'secondary' });
    } else if (/border/.test(v.name) && /default/.test(v.name)) {
      candidates.borders.push({ name: v.name, value: val });
    }
  }

  // Resolve var() indirection: many sema vars reference base-color via var()
  // Add base grayscale palette directly: lights → bg candidates, mids → text-soft candidates
  const grayscaleLights = baseColors
    .filter(v => /grayscale-(0|25|50)$/.test(v.name))
    .map(v => ({ name: v.name, value: v.value, hint: 'light bg' }));
  candidates.backgrounds.push(...grayscaleLights);

  const grayscaleMids = baseColors
    .filter(v => /grayscale-(200|250|300|350)/.test(v.name) && !/pressed|hover/.test(v.name))
    .map(v => ({ name: v.name, value: v.value, hint: 'text-soft candidate' }));
  candidates.texts.push(...grayscaleMids);

  // Deduplicate by value within each bucket
  for (const key of Object.keys(candidates)) {
    const seen = new Set();
    candidates[key] = candidates[key].filter(c => {
      if (seen.has(c.value)) return false;
      seen.add(c.value);
      return true;
    }).slice(0, 10);
  }

  // Add hardcoded bg colors as fallback
  if (candidates.backgrounds.length === 0) {
    const bgColors = hardcodedHexColors.filter(c =>
      /background|bg/i.test(c.context)
    );
    candidates.backgrounds = bgColors.slice(0, 5);
  }
  if (candidates.texts.length === 0) {
    const textColors = hardcodedHexColors.filter(c =>
      /color/i.test(c.context) && !/background|bg/i.test(c.context)
    );
    candidates.texts = textColors.slice(0, 5);
  }

  // ── Font candidates ──
  const fontVars = cssVars.filter(v =>
    /font.*family|font.*stack/i.test(v.name) || FONT_VALUE.test(v.value)
  );
  // Also check font stacks from siteData
  const fontStacks = [];
  for (const v of fontVars) {
    if (/sans-serif|serif|monospace/i.test(v.value) && !fontStacks.some(f => f.value === v.value)) {
      fontStacks.push({ name: v.name, value: v.value });
    }
  }

  // ── Size candidates (font sizes, spacing, radii) ──
  const sizeVars = cssVars.filter(v => SIZE_VALUE.test(v.value));

  const fontSizes = sizeVars.filter(v =>
    /font.*size|text.*size|fontSize/i.test(v.name) || /^--sema-font-size/.test(v.name)
  );
  const spaceVals = sizeVars.filter(v =>
    /^--sema-space-/.test(v.name) || /space|gap|pad|gutter/i.test(v.name)
  ).filter(v => parseFloat(v.value) >= 4); // exclude border-width territory (1px, 2px)
  const radiusVals = sizeVars.filter(v =>
    /^--sema-rounding-/.test(v.name) || /rounding|radius/i.test(v.name)
  );

  // ── Shadow candidates ──
  const shadowVals = cssVars.filter(v =>
    /shadow|elevation/.test(v.name) && /rgba|rgba\(|box-shadow/.test(v.value)
  );

  // ── Motion candidates ──
  const easingVals = cssVars.filter(v =>
    /ease|bezier|cubic-bezier/i.test(v.value) || /easing/i.test(v.name)
  );
  const durationVals = cssVars.filter(v =>
    /ms$|duration/.test(v.value) || /duration/i.test(v.name)
  );

  return {
    accent: candidates.accent,
    backgrounds: candidates.backgrounds,
    texts: candidates.texts,
    borders: candidates.borders,
    baseColors: baseColors.slice(0, 20),
    fontStacks: fontStacks.slice(0, 5),
    fontSizes: fontSizes.slice(0, 15),
    spaceVals: spaceVals.slice(0, 20),
    radiusVals: radiusVals.slice(0, 10),
    shadowVals: shadowVals.slice(0, 6),
    easingVals: easingVals.slice(0, 6),
    durationVals: durationVals.slice(0, 6),
    hardcodedHexColors,
  };
}

// ── Step 3b: AI mapping prompt — principles only, no data formatting ──

function buildMappingPrompt(candidates, hostname) {
  const slug = hostnameToSlug(hostname);

  // Condense candidates to minimal info: name + value
  const fmt = (arr) => (arr || []).map(c =>
    `${c.name}: ${c.value}` +
    (c.hint ? ` [${c.hint}]` : '') +
    (c.context ? ` (${c.context})` : '')
  ).join('\n    ');

  return `你是设计 token 映射器。根据候选变量，为每个标准角色选择最佳值。

## 选择原则
- accent: 选品牌主色调（performance/primary 优先于 dataviz）
- accent-hover: accent 加深版——在候选里找同色系更深的，或手动降低 accent 的 HSL 亮度 ~15%
- accent-alt: 选第二个品牌色——优先从 accent-alt-candidate 候选里选，必须与 accent 不同（不同 hex）。如无合适候选，从 dataviz 色里选一个与 accent 色相不同的颜色
- bg: 选页面底色——优先最浅的候选（#fff > #fbfbf9 > #f6f6f3）。grayscale-0 通常就是页面白底
- surface: 选卡片背景——比 bg 稍暗一级（grayscale-25 或 secondary background）
- text: 选正文色——default text > 最深的 neutral。纯黑 #000000 可接受当 text
- text-soft: 选次级文字——必须从 text-soft 候选里选（grayscale 200-350 中等灰度），不选最浅的背景色
- line: 选边框色——default border > grayscale-100 附近的中灰色
- font-display: 选标题字体，取完整的系统字体栈（含 fallback）
- font-body: 选正文字体，同 display 或取无衬线栈
- font-mono: 选等宽字体——优先 SF Mono/Consolas，无则系统默认
- radius: 选最常用圆角——8px 附近优先
- shadow-sm/shadow-md: 区分层级——blur 小的 → sm，blur 大的 → md
- ease-default: 选标准缓动——ease-in-out > ease-out
- duration-base: 选常用时长——150ms-300ms 范围
- page-wmax: 选内容最大宽度——≥1200px 的 container/resolution 值
- page-pad: 选页面内边距——16-48px 范围的中等值
- gap: 选元素间距——16-32px 范围
- gutter: 选列间距——同 gap 或略小

## 颜色候选
accent 主色 (hint=accent-primary): ${fmt(candidates.accent.filter(c => c.hint === 'accent-primary'))}
accent-alt 候选 (hint=accent-alt-candidate): ${fmt(candidates.accent.filter(c => c.hint === 'accent-alt-candidate'))}
background: ${fmt(candidates.backgrounds)}
text primary (hint=无或text-soft): ${fmt(candidates.texts.filter(c => !c.hint))}
text-soft 候选 (hint=text-soft candidate): ${fmt(candidates.texts.filter(c => c.hint === 'text-soft candidate'))}
border: ${fmt(candidates.borders)}

## 字体候选
${fmt(candidates.fontStacks)}

## 字号候选
${fmt(candidates.fontSizes.slice(0, 10))}

## 间距候选
${fmt(candidates.spaceVals.slice(0, 12))}

## 圆角候选
${fmt(candidates.radiusVals.slice(0, 8))}

## 阴影候选
${fmt(candidates.shadowVals)}

## 动效候选
easing: ${fmt(candidates.easingVals)}
duration: ${fmt(candidates.durationVals)}

## 硬编码颜色（从 CSS 属性提取）
${fmt(candidates.hardcodedHexColors.slice(0, 10))}

## 输出格式
输出一个平铺 JSON 对象，key 是标准变量名，value 是选中的值（纯值，不要箭头/变量名）：

{
  "--slug": "${slug}",
  "--accent": "#hex",
  "--accent-hover": "#hex",
  "--accent-alt": "#hex",
  "--bg": "#hex",
  "--surface": "#hex",
  "--text": "#hex",
  "--text-soft": "#hex",
  "--line": "#hex",
  "--line-soft": "rgba(...)",
  "--font-display": "'Font',sans-serif",
  "--font-body": "'Font',sans-serif",
  "--font-mono": "'Font',monospace",
  "--page-wmax": "1200px",
  "--page-pad": "32px",
  "--gap": "24px",
  "--gutter": "24px",
  "--radius": "8px",
  "--shadow-sm": "0 1px 3px rgba(0,0,0,0.06)",
  "--shadow-md": "0 8px 30px rgba(0,0,0,0.12)",
  "--ease-default": "0.18s ease",
  "--duration-base": "150ms"
}

规则：
1. 只输出 JSON，不加 markdown 标记，不加解释
2. accent-hover: accent 的 hover 态——比 accent 略深（HSL 降低 L 值 10-15%）或在候选里找 hover/pressed 变体
3. accent-alt: 辅强调色——从候选里选第二个与 accent 不同的品牌色或 dataviz 色
4. line-soft: line 的 rgba 半透明版（opacity ~0.5）
5. 值必须来自候选列表或从候选推理。不确定时取候选中最合理的
6. font-display 和 font-body 可以相同
7. shadow-sm 和 shadow-md 从候选区分层级，sm < md`;
}

// ── Step 3c: Script assembly — AI mapping → full tokens.json ──

function assembleTokens(mapping, siteData, slug) {
  // Build tokens.color section
  const colorTokens = [
    { name: '--accent', value: mapping['--accent'], role: 'accent', description: '主强调色' },
    { name: '--accent-hover', value: mapping['--accent-hover'], role: 'accent', description: '强调色悬停态' },
    { name: '--accent-alt', value: mapping['--accent-alt'], role: 'accent', description: '辅强调色' },
    { name: '--bg', value: mapping['--bg'], role: 'surface-bg', description: '页面背景色' },
    { name: '--surface', value: mapping['--surface'], role: 'surface-card', description: '卡片/面板背景' },
    { name: '--text', value: mapping['--text'], role: 'text-primary', description: '主文字色' },
    { name: '--text-soft', value: mapping['--text-soft'], role: 'text-secondary', description: '次级文字色' },
    { name: '--line', value: mapping['--line'], role: 'border-default', description: '边框色' },
    { name: '--line-soft', value: mapping['--line-soft'], role: 'border', description: '浅边框色' },
  ].filter(t => t.value);

  const typographyTokens = [
    { name: '--font-display', value: mapping['--font-display'], role: 'display-font', description: '标题字体栈' },
    { name: '--font-body', value: mapping['--font-body'], role: 'body-font', description: '正文字体栈' },
    { name: '--font-mono', value: mapping['--font-mono'], role: 'mono-font', description: '等宽字体栈' },
  ].filter(t => t.value);

  const spacingTokens = [
    { name: '--page-wmax', value: mapping['--page-wmax'], role: 'content-max-width', description: '内容最大宽度' },
    { name: '--page-pad', value: mapping['--page-pad'], role: 'page-padding', description: '页面水平内边距' },
    { name: '--gap', value: mapping['--gap'], role: 'element-gap', description: '元素/网格间距' },
    { name: '--gutter', value: mapping['--gutter'], role: 'column-gutter', description: '列间距/留白基准' },
  ].filter(t => t.value);

  const radiusTokens = [
    { name: '--radius', value: mapping['--radius'], role: 'radius', description: '圆角基准值' },
  ].filter(t => t.value);

  const shadowTokens = [
    { name: '--shadow-sm', value: mapping['--shadow-sm'], role: 'shadow', description: '轻阴影' },
    { name: '--shadow-md', value: mapping['--shadow-md'], role: 'shadow', description: '中阴影' },
  ].filter(t => t.value);

  const motionTokens = [
    { name: '--ease-default', value: mapping['--ease-default'], role: 'easing', description: '标准缓动曲线' },
    { name: '--duration-base', value: mapping['--duration-base'], role: 'duration', description: '基础过渡时长' },
  ].filter(t => t.value);

  // ── Infer typeScale from font-size candidates ──
  const sizes = (siteData.hardcoded?.spacing || [])
    .concat(siteData.cssVars?.filter(v => /font.*size|^--sema-font-size/i.test(v.name)) || [])
    .map(s => s.val || s.value)
    .filter(v => v && /px|rem|em/.test(v))
    .map(v => parseFloat(v))
    .filter(n => n > 0 && n < 500)
    .sort((a, b) => b - a);

  const uniqueSizes = [...new Set(sizes)].slice(0, 12);
  const defaultTypeScale = [
    { name: '--sz-display', value: 'clamp(40px,7vw,64px)', usage: 'display 级字号' },
    { name: '--sz-h1', value: '36px', usage: 'h1 级字号' },
    { name: '--sz-h2', value: '28px', usage: 'h2 级字号' },
    { name: '--sz-h3', value: '22px', usage: 'h3 级字号' },
    { name: '--sz-lead', value: '18px', usage: 'lead 级字号（导语/引言）' },
    { name: '--sz-body', value: '16px', usage: 'body 级字号' },
    { name: '--sz-caption', value: '13px', usage: 'caption 级字号' },
    { name: '--sz-label', value: '11px', usage: 'label 级字号' },
  ];

  let typeScale = defaultTypeScale;
  if (uniqueSizes.length >= 5) {
    // Map extracted sizes to 8 levels
    const levels = ['--sz-display', '--sz-h1', '--sz-h2', '--sz-h3', '--sz-lead', '--sz-body', '--sz-caption', '--sz-label'];
    typeScale = levels.map((name, i) => {
      const idx = i < uniqueSizes.length ? i : uniqueSizes.length - 1;
      return { name, value: uniqueSizes[idx] + 'px', usage: name.replace('--sz-', '') + ' 级字号' };
    });
  }

  // ── Infer spacingScale ──
  const gaps = (siteData.hardcoded?.spacing || [])
    .concat(siteData.cssVars?.filter(v => /^--sema-space-/.test(v.name)) || [])
    .map(s => s.val || s.value)
    .filter(v => v && /px|rem/.test(v))
    .map(v => parseFloat(v))
    .filter(n => n >= 4 && n < 300)  // exclude border-width territory (1px, 2px)
    .sort((a, b) => b - a);

  const uniqueGaps = [...new Set(gaps)];
  const spacingScale = [
    { name: '--gap-lg', value: (uniqueGaps[0] || 48) + 'px', usage: 'lg 级间距' },
    { name: '--gap-md', value: (uniqueGaps[Math.floor(uniqueGaps.length / 2)] || 24) + 'px', usage: 'md 级间距' },
    { name: '--gap-sm', value: (uniqueGaps[uniqueGaps.length - 1] || 8) + 'px', usage: 'sm 级间距' },
  ];

  // ── Build colorRoles ──
  const colorRoles = {
    primary: mapping['--accent'] || '',
    secondary: mapping['--accent-alt'] || mapping['--accent'] || '',
    background: mapping['--bg'] || '',
    text: mapping['--text'] || '',
    textSecondary: mapping['--text-soft'] || '',
    border: mapping['--line'] || '',
    surface: mapping['--surface'] || '',
  };

  return {
    slug,
    version: 1,
    source: '生长 Agent · URL → tokens.json 自动提取',
    categories: ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'],
    tokens: {
      color: colorTokens,
      typography: typographyTokens,
      spacing: spacingTokens,
      radius: radiusTokens,
      shadow: shadowTokens,
      motion: motionTokens,
    },
    brandKit: { typeScale, spacingScale, colorRoles },
  };
}

// ── Step 3 orchestration: categorize → AI map → assemble ──

async function structureTokensFromCSS(siteData, hostname) {
  const candidates = categorizeCandidates(siteData.cssVars || [], siteData.hardcoded);
  const prompt = buildMappingPrompt(candidates, hostname);

  const stats = {
    accent: candidates.accent.length,
    bg: candidates.backgrounds.length,
    text: candidates.texts.length,
    border: candidates.borders.length,
    font: candidates.fontStacks.length,
    shadow: candidates.shadowVals.length,
  };
  console.log('[growth] Candidates:', JSON.stringify(stats), '→ prompt:', prompt.length, 'chars');

  const response = await axios.post(DEEPSEEK_BASE + '/v1/chat/completions', {
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
    temperature: 0.1,
    thinking: { type: 'disabled' },
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

  let mapping;
  try {
    mapping = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: 'AI 映射 JSON 解析失败: ' + e.message, raw: text.slice(0, 500) };
  }

  // Validate: check we got at least the core keys
  const requiredKeys = ['--accent', '--bg', '--text', '--line'];
  const missing = requiredKeys.filter(k => !mapping[k]);
  if (missing.length > 0) {
    return { ok: false, error: 'AI 映射缺少关键 token: ' + missing.join(', '), raw: text.slice(0, 500) };
  }

  const slug = hostnameToSlug(hostname);
  const data = assembleTokens(mapping, siteData, slug);
  console.log('[growth] Assembled tokens:', data.tokens.color.length, 'colors,', data.tokens.typography.length, 'fonts, brandKit:', !!data.brandKit);

  return { ok: true, data };
}

// ── Step 3 (legacy): Gemini vision extraction (AIGO) ────────────

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
    "design_style": "minimalist|editorial|swiss|corporate|brutalist|modern|retro|organic|luxury|playful",
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
    max_tokens: 8192,
    temperature: 0.2,
    thinking: { type: 'disabled' },
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
    typography: ['display-font', 'body-font'],
    spacing: ['page-padding', 'element-gap'],
    radius: ['radius'],
    shadow: ['shadow'],
    motion: ['easing', 'duration'],
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

// ── Step 6 helpers: AI content generation for skeleton placeholders ──

function extractPlaceholders(skeletonPath) {
  const html = fs.readFileSync(skeletonPath, 'utf-8');
  const re = /\{\{(\w+)\}\}/g;
  const placeholders = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    placeholders.add(m[1]);
  }
  return Array.from(placeholders).filter(p => p !== 'FONT_IMPORTS' && p !== 'TOKEN_CSS');
}

function buildContentGenerationPrompt(placeholders, textContent, tokensData, hostname) {
  const name = hostname.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const bk = tokensData.brandKit || {};
  const colors = bk.colorRoles || {};
  const moodParts = [];
  if (colors.primary) moodParts.push('accent: ' + colors.primary);
  if (colors.background) moodParts.push('bg: ' + colors.background);
  const mood = moodParts.join(', ') || 'neutral modern design';

  return `你是网页内容创作助手。根据原始网站的文字内容和设计 token 情绪，为 HTML 模板占位符生成品牌匹配的内容。

## 原始网站文字内容
${textContent || '(未提取到文字内容)'}

## 设计 Token 情绪
${mood}

## 品牌名（从域名推导）
${name}

## 占位符含义
- PAGE_TITLE: 页面标题（title tag）
- TEMPLATE_NAME: 品牌/模板名称
- LOGO_INITIAL: 品牌首字母（一个大写字母）
- MASTHEAD_LEFT, MASTHEAD_RIGHT: 页眉左右标签文字
- HERO_HEADLINE: 主标题，允许 <br> 换行
- HERO_COPY: 英雄区导语
- CTA_PRIMARY, CTA_SECONDARY: 按钮文字
- HERO_NOTE: 英雄区小字注释
- SECTION1_TITLE: 第一个区块标题（允许 <br>）
- SECTION1_SUBTITLE: 区块副标题
- CARD1~CARD4_TITLE: 四张卡片标题
- CARD1~CARD4_DESC: 四张卡片描述
- QUOTE_TEXT: 引用语录
- PANEL1_EYEBROW/TITLE/DESC: 左侧面板
- PANEL2_EYEBROW/TITLE/ITEM1~4: 右侧面板
- TIMELINE_TITLE/SUBTITLE: 时间线标题/副标题
- RECORD1~3_DATE/TAG/TITLE/DESC: 三条时间线记录
- MANIFESTO_EYEBROW/TITLE/P1/P2/CTA/LINK: 宣言区

## 规则
1. 读原始网站文字，提取品牌定位和语气
2. 根据设计 token 情绪调整文风
3. 每段文字简明有力，不冗长
4. 卡片和时间线之间要有逻辑关联和递进
5. QUOTE 要像原创品牌语录
6. 时间线日期用最近三个月内真实日期 YYYY-MM-DD
7. HERO_HEADLINE 可含 <br> 强制换行
8. 若原站是电商/产品型→卡片写产品特色；若公司官网→保持专业风格

## 输出格式
纯 JSON，不加 markdown 标记：

{
  "PAGE_TITLE": "...",
  "TEMPLATE_NAME": "...",
  "LOGO_INITIAL": "X",
  ...所有占位符 key...
  "template_type": "single-page",
  "design_style": "editorial"
}

template_type: 选 single-page
design_style: 选 editorial | corporate | modern | minimalist | brutalist | playful 之一，基于原站风格判断`;
}

async function generateTemplateContent(siteData, tokensData, hostname, skeletonPath) {
  const placeholders = extractPlaceholders(skeletonPath);
  const textContent = siteData.textContent || '';

  const prompt = buildContentGenerationPrompt(placeholders, textContent, tokensData, hostname);

  try {
    const response = await axios.post(DEEPSEEK_BASE + '/v1/chat/completions', {
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
      thinking: { type: 'disabled' },
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

    const parsed = JSON.parse(json);
    const template_type = parsed.template_type || 'single-page';
    const design_style = parsed.design_style || 'editorial';
    delete parsed.template_type;
    delete parsed.design_style;
    return { ok: true, content: parsed, template_type, design_style };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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

    // Step 3: DeepSeek structures tokens.json directly from CSS data
    emit(3, 'running', { message: 'DeepSeek 结构化提取...' });
    if (!DEEPSEEK_KEY) {
      emit(3, 'error', { error: 'DEEPSEEK_API_KEY 未配置' });
      return { ok: false, step: 3, error: 'DEEPSEEK_API_KEY 未配置。' };
    }
    const structured = await structureTokensFromCSS(siteData, validated.hostname);
    if (!structured.ok) {
      emit(3, 'error', { error: structured.error });
      return { ok: false, step: 3, error: structured.error, raw: structured.raw };
    }
    emit(3, 'done', {
      categories: Object.keys(structured.data.tokens || {}).length,
      colorCount: (structured.data.tokens?.color || []).length,
      fontCount: (structured.data.tokens?.typography || []).length,
    });

    // Step 4: Validate schema
    emit(4, 'running', { message: '校验 tokens.json schema...' });
    const validation = validateTokens(structured.data);
    if (!validation.ok) {
      emit(4, 'error', { errors: validation.errors });
      return { ok: false, step: 4, error: 'Schema 校验失败', errors: validation.errors };
    }
    emit(4, 'done', { valid: true });

    // Step 5: Write + sync
    emit(5, 'running', { message: '写入文件 + sync-roots.js :root 生成...' });
    const written = writeAndSync(structured.data, validated.slug);
    if (!written.ok) {
      emit(5, 'error', { error: written.error });
      return { ok: false, step: 5, error: written.error };
    }
    emit(5, 'done', {
      dir: path.relative(PROJECT_DIR, written.dir),
      tokensPath: path.relative(PROJECT_DIR, written.tokensPath),
      tmplPath: path.relative(PROJECT_DIR, written.tmplPath),
    });

    // Step 6: AI generates template content
    let contentResult = { ok: false, content: null, template_type: 'single-page', design_style: 'editorial' };
    try {
      emit(6, 'running', { message: 'DeepSeek 生成页面内容...' });
      const skeletonPath = path.join(PROJECT_DIR, 'templates', 'skeletons', 'editorial-single-page.html');
      contentResult = await generateTemplateContent(siteData, structured.data, validated.hostname, skeletonPath);
      if (contentResult.ok) {
        emit(6, 'done', {
          placeholderCount: Object.keys(contentResult.content).length,
          template_type: contentResult.template_type,
          design_style: contentResult.design_style,
        });
      } else {
        emit(6, 'done', { warning: 'AI 内容生成失败: ' + (contentResult.error || 'unknown') });
      }
    } catch (err) {
      emit(6, 'done', { warning: 'AI 内容生成异常: ' + err.message });
    }

    // Step 7: Render full template.html via template-renderer
    try {
      emit(7, 'running', { message: '渲染完整 template.html...' });
      const { renderTemplate } = require('./template-renderer');
      const tmplEntry = {
        slug: validated.slug,
        name: validated.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        tagline: '',
        template_path: 'templates/_growth/' + validated.slug + '/template.html',
        template_type: contentResult.template_type,
        design_style: contentResult.design_style,
      };
      const fullHtml = renderTemplate(tmplEntry, PROJECT_DIR, structured.data, contentResult.content || undefined);
      const tmplPath = path.join(written.dir, 'template.html');
      fs.writeFileSync(tmplPath, fullHtml, 'utf-8');

      // Write pipeline metadata for approve endpoint
      const metaPath = path.join(written.dir, '.growth-meta.json');
      fs.writeFileSync(metaPath, JSON.stringify({
        template_type: contentResult.template_type,
        design_style: contentResult.design_style,
        generatedAt: new Date().toISOString(),
      }, null, 2), 'utf-8');

      emit(7, 'done', { message: 'template.html 渲染完成', contentGenerated: contentResult.ok });
    } catch (renderErr) {
      emit(7, 'done', { warning: '模板渲染失败: ' + renderErr.message });
    }

    // Done
    emit('complete', 'done', {
      slug: validated.slug,
      brandUrl: '/brand/' + validated.slug,
      dir: path.relative(PROJECT_DIR, written.dir),
      contentGenerated: contentResult.ok,
      template_type: contentResult.template_type,
      design_style: contentResult.design_style,
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
  extractTextContent,
  extractPlaceholders,
  generateTemplateContent,
};

// validate-templates.js — 模板文件完整性审计 CLI
// 一源双端门禁：读取 template-manifest.json 合约，扫描所有已注册模板，
// 报告文件覆盖率 + 运行 validator。
//
// Usage:
//   node scripts/validate-templates.js             # 全量审计，仅报告
//   node scripts/validate-templates.js --strict     # (已废弃 — 默认即硬门禁)
//   node scripts/validate-templates.js --verbose    # 逐模板明细
//   node scripts/validate-templates.js --dir templates/frontend-design/layout-gallery

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');
const MANIFEST_PATH = path.join(PROJECT_DIR, 'config', 'template-manifest.json');

// ── Manifest ──────────────────────────────────────────────────────

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

// ── Validators ────────────────────────────────────────────────────

function validateTokensSchema(tmplDir, tokensData) {
  const errors = [];
  const cats = ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'];

  if (!tokensData.tokens || typeof tokensData.tokens !== 'object') {
    errors.push('tokens.json: 缺少 tokens 对象');
    return errors;
  }

  for (const cat of cats) {
    if (!Array.isArray(tokensData.tokens[cat])) {
      errors.push('tokens.json: 缺少分类 tokens.' + cat);
      continue;
    }
    for (let i = 0; i < tokensData.tokens[cat].length; i++) {
      const t = tokensData.tokens[cat][i];
      if (!t.name) errors.push('tokens.' + cat + '[' + i + ']: 缺 name');
      if (t.value === undefined) errors.push('tokens.' + cat + '[' + i + ']: 缺 value');
    }
  }

  if (!tokensData.brandKit) {
    errors.push('tokens.json: 缺少 brandKit 区段');
  } else {
    if (!Array.isArray(tokensData.brandKit.typeScale) || tokensData.brandKit.typeScale.length === 0)
      errors.push('brandKit.typeScale: 缺失或为空');
    if (!Array.isArray(tokensData.brandKit.spacingScale) || tokensData.brandKit.spacingScale.length === 0)
      errors.push('brandKit.spacingScale: 缺失或为空');
  }

  return errors;
}

function validateRootSync(tmplDir, tokensData) {
  const errors = [];
  const tmplPath = path.join(tmplDir, 'template.html');
  if (!fs.existsSync(tmplPath)) {
    errors.push('template.html 不存在，无法校验 :root 同步');
    return errors;
  }

  const html = fs.readFileSync(tmplPath, 'utf-8');
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  if (!rootMatch) {
    errors.push('template.html: 未找到 :root 块');
    return errors;
  }

  // Extract :root values
  const rootVars = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(rootMatch[1])) !== null) {
    rootVars[m[1]] = m[2].trim();
  }

  // Build expected :root values directly from ALL tokens.json categories.
  // No intermediary mapping — every token should have a 1:1 :root counterpart.
  const expected = {};
  for (const cat of ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion']) {
    const items = tokensData.tokens[cat] || [];
    for (const t of items) {
      expected[t.name] = t.value;
    }
  }

  let mismatchCount = 0;
  for (const [name, expectedVal] of Object.entries(expected)) {
    const rootVal = rootVars[name];
    if (rootVal === undefined) {
      mismatchCount++;
      if (mismatchCount <= 3) errors.push(':root 缺 token ' + name);
    } else if (rootVal !== expectedVal) {
      mismatchCount++;
      if (mismatchCount <= 3) errors.push(name + ': :root=' + rootVal + ' ≠ tokens.json=' + expectedVal);
    }
  }

  return errors;
}

// ── Google Fonts gate ────────────────────────────────────────────
// Scans template.html <link>/@import and tokens.json font fields.
// Any hit = hard fail — Google Fonts blocked in China (GFW).

function validateGoogleFonts(tmplDir, tokensData) {
  const errors = [];
  const GOOGLE_FONTS_RE = /fonts\.googleapis\.com/i;

  // Check template.html
  const tmplPath = path.join(tmplDir, 'template.html');
  if (fs.existsSync(tmplPath)) {
    const html = fs.readFileSync(tmplPath, 'utf-8');
    if (/<link[^>]*fonts\.googleapis\.com[^>]*\/?>/i.test(html)) {
      errors.push('template.html: 包含 Google Fonts <link> 标签');
    }
    if (/@import\s+url\(['"]?https?:\/\/fonts\.googleapis\.com[^)]*\)/i.test(html)) {
      errors.push('template.html: 包含 Google Fonts @import');
    }
  }

  // Check tokens.json font fields
  const fontFields = ['fontImports', 'googleFonts', 'brandKit.googleFonts'];
  for (const field of fontFields) {
    let val;
    if (field.includes('.')) {
      const parts = field.split('.');
      val = tokensData[parts[0]] && tokensData[parts[0]][parts[1]];
    } else {
      val = tokensData[field];
    }
    if (val) {
      const str = typeof val === 'string' ? val : JSON.stringify(val);
      if (GOOGLE_FONTS_RE.test(str)) {
        errors.push('tokens.json: ' + field + ' 引用 Google Fonts');
      }
    }
  }

  return errors;
}

// ── Standard vocabulary gate ─────────────────────────────────────
// v4: 适配 MD3 29 角色合约。嵌套 color 子分组 → 展平。迁移模式下
// migrationMap 命中 → 警告（需迁移），非标准名 + 不在迁移表 + 不在豁免 → 报错。

function loadContract() {
  const contractPath = path.join(PROJECT_DIR, 'meta', 'token-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  return contract;
}

function flattenStandardVars(standardVars) {
  const allowedNames = new Set();
  const requiredNames = [];

  for (const [category, vars] of Object.entries(standardVars)) {
    if (category.startsWith('_')) continue;

    for (const [key, val] of Object.entries(vars)) {
      // Detect nesting: if val has 'md3' or 'role' → direct token def
      if (val && typeof val === 'object' && (val.md3 !== undefined || val.role !== undefined)) {
        allowedNames.add(key);
        if (val.required) requiredNames.push(key);
      } else if (val && typeof val === 'object') {
        // Sub-group (e.g. color.primary, color.secondary)
        for (const [subKey, subVal] of Object.entries(val)) {
          if (subVal && typeof subVal === 'object') {
            allowedNames.add(subKey);
            if (subVal.required) requiredNames.push(subKey);
          }
        }
      }
    }
  }

  return { allowedNames, requiredNames };
}

function validateStandardVars(tmplDir, tokensData) {
  const errors = [];
  const contract = loadContract();
  const standardVars = contract.standardVars;
  const templateSpecific = contract.templateSpecific || {};
  const migrationMap = contract.migrationMap || {};

  if (!standardVars) {
    errors.push('token-contract.json 缺少 standardVars 定义');
    return errors;
  }

  // Flatten standard vocabulary (handles nested color sub-groups)
  const { allowedNames, requiredNames } = flattenStandardVars(standardVars);

  // Add template-specific exemptions
  const slug = tokensData.slug;
  const tmplSpecific = templateSpecific[slug];
  if (tmplSpecific) {
    for (const [category, names] of Object.entries(tmplSpecific)) {
      if (category.startsWith('_')) continue;
      for (const name of names) {
        allowedNames.add(name);
      }
    }
  }

  // Build migration lookup: all old→new mappings flattened
  const migrationLookup = {};
  for (const [cat, map] of Object.entries(migrationMap)) {
    if (cat.startsWith('_')) continue;
    for (const [oldName, newName] of Object.entries(map)) {
      migrationLookup[oldName] = newName;
    }
  }

  // Flatten all token names from tokens.json
  const tokenNames = [];
  for (const tokens of Object.values(tokensData.tokens)) {
    for (const t of tokens) {
      tokenNames.push(t.name);
    }
  }

  const tokenNameSet = new Set(tokenNames);

  // Check: every token name must be in allowed set OR migrationMap OR templateSpecific
  for (const name of tokenNames) {
    if (allowedNames.has(name)) continue;
    if (migrationLookup[name]) {
      errors.push('需迁移: ' + name + ' → ' + migrationLookup[name]);
      continue;
    }
    // Already in templateSpecific → skip (already added to allowedNames above)
    errors.push('非标准 token 名: ' + name + ' — 不在标准词汇表、迁移表或豁免清单');
  }

  // Check: required standard names must be present (or their migration source)
  for (const req of requiredNames) {
    if (tokenNameSet.has(req)) continue;
    // Check if any old name maps to this required name
    const hasMigrationSource = Object.entries(migrationLookup).some(([old, nu]) =>
      nu === req && tokenNameSet.has(old)
    );
    if (hasMigrationSource) {
      errors.push('需迁移: 缺标准变量 ' + req + '（当前通过旧名提供）');
      continue;
    }
    errors.push('缺必需标准变量 ' + req);
  }

  // Check colorRoles in brandKit
  if (tokensData.brandKit && tokensData.brandKit.colorRoles) {
    const cr = tokensData.brandKit.colorRoles;
    const requiredRoles = ['primary', 'secondary', 'background', 'text', 'textSecondary', 'border', 'surface'];
    for (const role of requiredRoles) {
      if (!cr[role]) {
        errors.push('brandKit.colorRoles 缺 ' + role);
      }
    }
  } else {
    errors.push('brandKit.colorRoles 缺失 — 无法推导标准颜色别名');
  }

  return errors;
}

// ── Hardcoded values audit ────────────────────────────────────────
// Scans template.html CSS for values that SHOULD be var(--*) but aren't.
// Hardcoded font-size / line-height / position / letter-spacing are exempt.
//
// Return: { score, vars, hardcoded, violations }
//   score = var(--*) references / (var + hardcoded) * 100
//   violations = list of hardcoded values that should be tokens

function validateHardcoded(tmplDir, tokensData) {
  const warnings = [];
  const tmplPath = path.join(tmplDir, 'template.html');
  if (!fs.existsSync(tmplPath)) return warnings;

  const html = fs.readFileSync(tmplPath, 'utf-8');

  // Extract CSS, strip :root blocks
  const rootRegex = /:root\s*\{[^}]*\}/g;
  const css = html.replace(rootRegex, '');

  // Count var(--*) references
  const varRefs = (css.match(/var\(--[\w-]+\)/g) || []).length;

  // ── Hardcoded hex/rgba colors (NOT in :root, NOT var()) ──
  const hexMatches = css.match(/(?<!var\([^)]{0,200})(?<![-])\b#[0-9a-fA-F]{3,8}\b/g) || [];
  const hardHex = hexMatches.filter(h => h !== '#1a1a1a').length; // exclude stage bg

  // ── Hardcoded font-family with named fonts ──
  const fontMatches = css.match(/font-family\s*:\s*(?!var\()[^;"]*"[^"]+"[^;]*;/g) || [];
  const hardFonts = fontMatches.length;

  // ── Hardcoded border-radius (px only, not %) ──
  const radiusMatches = css.match(/border-radius\s*:\s*[\d.]+px/g) || [];
  const hardRadius = radiusMatches.length;

  // ── Hardcoded transition/animation (value contains no var() and is not "none") ──
  const transMatches = css.match(/transition\s*:\s*[^;]+;/g) || [];
  const hardMotion = transMatches.filter(t => !t.includes('var(--') && !t.includes(':none')).length;

  // ── Score ──
  const hardTotal = hardHex + hardFonts + hardRadius + hardMotion;
  const total = varRefs + hardTotal;
  const score = total > 0 ? Math.round((varRefs / total) * 100) : 100;

  if (hardHex > 0) {
    warnings.push('模板含 ' + hardHex + ' 处硬编码颜色（应为 var(--*)）：应 ≤ 10');
  }
  if (hardFonts > 0) {
    warnings.push('模板含 ' + hardFonts + ' 处硬编码 font-family（应为 var(--font-*)）：应 = 0');
  }
  if (hardRadius > 0) {
    warnings.push('模板含 ' + hardRadius + ' 处硬编码 border-radius（应为 var(--radius-*)）：应 = 0');
  }
  if (hardMotion > 0) {
    warnings.push('模板含 ' + hardMotion + ' 处硬编码 transition（应为 var(--ease-*)）：应 = 0');
  }

  if (score < 80) {
    warnings.push('Token 化率 ' + score + '% — 低于 80%，建议提升');
  }

  return warnings;
}

// ── Audit logic ───────────────────────────────────────────────────

function auditTemplate(entry, manifest, options) {
  const tmplDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  const type = entry.brand_kit_ready ? 'brand_kit' : (manifest.default_type || 'gallery');
  const contract = manifest.template_types[type] || manifest.template_types.gallery;

  const result = {
    slug: entry.slug,
    dir: path.relative(PROJECT_DIR, tmplDir),
    type,
    ok: true,
    required: { present: [], missing: [] },
    optional: { present: [], missing: [] },
    validatorErrors: [],
  };

  // Check required files
  for (const f of contract.required) {
    if (fs.existsSync(path.join(tmplDir, f))) {
      result.required.present.push(f);
    } else {
      result.required.missing.push(f);
      result.ok = false;
    }
  }

  // Check optional files
  for (const f of (contract.optional || [])) {
    if (fs.existsSync(path.join(tmplDir, f))) {
      result.optional.present.push(f);
    } else {
      result.optional.missing.push(f);
    }
  }

  // Run validators (only if tokens.json exists)
  const tokensPath = path.join(tmplDir, 'tokens.json');
  if (fs.existsSync(tokensPath) && manifest.validators) {
    let tokensData;
    try {
      tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    } catch (e) {
      result.validatorErrors.push('tokens.json: JSON 解析失败 — ' + e.message);
      result.ok = false;
      return result;
    }

    for (const [vName, vDef] of Object.entries(manifest.validators)) {
      try {
        const mod = require('./' + vDef.module);
        if (typeof mod[vDef.function] !== 'function') {
          result.validatorErrors.push('Validator 未注册: ' + vDef.module + '.' + vDef.function + '()');
          result.ok = false;
          continue;
        }
        const errors = mod[vDef.function](tmplDir, tokensData);
        if (errors.length > 0) {
          result.validatorErrors.push(...errors.map(e => '[' + vName + '] ' + e));
          result.ok = false;
        }
      } catch (e) {
        result.validatorErrors.push('Validator 加载失败: ' + vName + ' — ' + e.message);
        result.ok = false;
      }
    }
  }

  return result;
}

function validateAll(registry, options) {
  const manifest = loadManifest();
  const results = [];

  for (const entry of registry) {
    if (entry.status === 'placeholder') continue;
    if (!entry.template_path) {
      results.push({ slug: entry.slug, dir: '(none)', ok: false, required: { present: [], missing: ['template_path 未设置'] }, optional: { present: [], missing: [] }, validatorErrors: [] });
      continue;
    }
    results.push(auditTemplate(entry, manifest, options));
  }

  // Sort: failures first, then by slug
  results.sort((a, b) => (a.ok === b.ok ? a.slug.localeCompare(b.slug) : a.ok ? 1 : -1));

  return { manifest, results };
}

function reportSummary(results, verbose) {
  const total = results.length;
  const passing = results.filter(r => r.ok).length;
  const failing = total - passing;
  const hasTokens = results.filter(r => r.required.present.includes('tokens.json') || r.optional.present.includes('tokens.json')).length;

  console.log('registry.json: ' + total + ' entries');
  console.log('  合约合规:  ' + passing + '/' + total + ' (required 文件齐全)');
  console.log('  tokens.json: ' + hasTokens + '/' + total);
  console.log('');

  if (failing > 0) {
    console.log('── 不合规模板 ──');
    for (const r of results.filter(r => !r.ok)) {
      const issues = [];
      if (r.required.missing.length > 0) issues.push('缺 required: ' + r.required.missing.join(', '));
      if (r.validatorErrors.length > 0) issues.push(r.validatorErrors.length + ' validator 异常');
      console.log('  ' + r.slug + '  ' + r.dir);
      for (const issue of issues) console.log('    ✗ ' + issue);
      if (verbose) {
        for (const f of r.required.missing) console.log('      - ' + f);
        for (const e of r.validatorErrors) console.log('      ' + e);
      }
    }
    console.log('');
  }

  return { total, passing, failing, hasTokens };
}

// ── Main ──────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const targetDir = args.find(a => a.startsWith('--dir='));

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('registry.json 不存在');
    process.exit(1);
  }

  let registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

  if (targetDir) {
    const dir = targetDir.replace('--dir=', '');
    const target = path.resolve(PROJECT_DIR, dir);
    registry = registry.filter(e => {
      if (!e.template_path) return false;
      return path.resolve(PROJECT_DIR, path.dirname(e.template_path)) === target;
    });
    if (registry.length === 0) {
      console.error('No registry entries for dir: ' + dir);
      process.exit(1);
    }
  }

  const { results } = validateAll(registry, { verbose });
  const summary = reportSummary(results, verbose);

  // Detailed report
  if (verbose) {
    console.log('── 全部模板 ──');
    for (const r of results) {
      const status = r.ok ? '✓' : '✗';
      const tokenStatus = (r.required.present.includes('tokens.json') || r.optional.present.includes('tokens.json')) ? ' [tokens.json]' : '';
      console.log('  ' + status + ' ' + r.slug + tokenStatus);
    }
  }

  if (summary.failing > 0) {
    console.error(summary.failing + ' 模板不合规，exit 1');
    process.exit(1);
  }
}

module.exports = { validateAll, reportSummary, validateTokensSchema, validateRootSync, validateStandardVars, validateGoogleFonts, validateHardcoded };

if (require.main === module) {
  main();
}

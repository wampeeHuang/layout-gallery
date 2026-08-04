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

  // Build expected :root values from tokens.json
  const cr = (tokensData.brandKit && tokensData.brandKit.colorRoles) ? tokensData.brandKit.colorRoles : {};
  const expected = {};

  if (cr.primary) expected['--accent'] = cr.primary;
  if (cr.secondary) expected['--accent-alt'] = cr.secondary;
  if (cr.background) expected['--bg'] = cr.background;
  if (cr.text) expected['--text'] = cr.text;
  if (cr.textSecondary) expected['--text-soft'] = cr.textSecondary;
  if (cr.border) expected['--line'] = cr.border;
  if (cr.surface) expected['--surface'] = cr.surface;

  // Typography/spacing/radius/shadow/motion — direct injection
  for (const cat of ['typography', 'spacing', 'radius', 'shadow', 'motion']) {
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
// Checks that template tokens.json uses standard CSS var names defined
// in token-contract.json standardVars. This is the "普通话" enforcement —
// templates that use domain names (--ink, --oxide) fail this check.

function loadContract() {
  const contractPath = path.join(PROJECT_DIR, 'meta', 'token-contract.json');
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
  return contract;
}

function validateStandardVars(tmplDir, tokensData) {
  const errors = [];
  const contract = loadContract();
  const standardVars = contract.standardVars;
  if (!standardVars) {
    errors.push('token-contract.json 缺少 standardVars 定义');
    return errors;
  }

  // Flatten all token names from tokens.json
  const tokenNames = new Set();
  for (const tokens of Object.values(tokensData.tokens)) {
    for (const t of tokens) {
      tokenNames.add(t.name);
    }
  }

  // Check each category's standard vars
  let missingCount = 0;
  for (const [category, vars] of Object.entries(standardVars)) {
    if (category.startsWith('_')) continue; // skip convention comments
    for (const [stdName, def] of Object.entries(vars)) {
      if (!tokenNames.has(stdName)) {
        missingCount++;
        if (missingCount <= 8) {
          errors.push('缺标准变量 ' + stdName + ' (' + def.role + ')');
        }
      }
    }
  }

  if (missingCount > 8) {
    errors.push('... 共缺 ' + missingCount + ' 个标准变量');
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

module.exports = { validateAll, reportSummary, validateTokensSchema, validateRootSync, validateStandardVars, validateGoogleFonts };

if (require.main === module) {
  main();
}

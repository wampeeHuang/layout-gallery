// Add a template to registry.json — single atomic operation
// Usage:
//   node scripts/add-template.js <metadata.json>
//
// metadata.json must contain: slug, name, skill, template_type, design_style, scheme
// Optional: tagline, mood[], occasion[], tone[], formality, density, palette[],
//           displayFont, bodyFont, typography_style, best_for, avoid_for,
//           features[], visibility, aspect_ratio, slide_count
//
// The script will:
//   1. Read metadata JSON
//   2. Infer template_path = templates/{skill}/{slug}/template.html
//   3. Extract CSS variables from template HTML
//   4. Validate against registry.schema.json
//   5. Add to registry.json (or update existing)

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'registry.json');
const SCHEMA_PATH = path.join(PROJECT_DIR, 'registry.schema.json');

// ── CSS Variable Extraction ────────────────────────────────────

function extractCSSVars(html) {
  const vars = [];
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  if (!rootMatch) return vars;

  const block = rootMatch[1];

  // Pass 1: vars with inline comments /* desc */ --var: value;
  const commentedRegex = /\/\*\s*([^*]+)\*\/\s*\n?\s*(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = commentedRegex.exec(block))) {
    const desc = m[1].trim();
    if (desc.length < 120 && !desc.includes('===') && !desc.includes('切换')) {
      vars.push({ name: m[2], default: m[3].trim(), description: desc });
    }
  }

  // Pass 2: bare --var: value;
  const bareRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  while ((m = bareRegex.exec(block))) {
    if (!vars.find(v => v.name === m[1])) {
      vars.push({ name: m[1], default: m[2].trim(), description: '' });
    }
  }

  return vars;
}

// ── Validation ─────────────────────────────────────────────────

function validate(entry, schema) {
  const errors = [];

  // Required fields
  (schema.required || []).forEach(field => {
    if (!entry[field]) errors.push(`缺少必填字段: ${field}`);
  });

  // Enum validation
  const props = schema.properties || {};
  Object.keys(entry).forEach(field => {
    const prop = props[field];
    if (!prop) return; // Unknown fields pass through
    if (prop.enum && !prop.enum.includes(entry[field])) {
      errors.push(`${field}: "${entry[field]}" 不在允许值 [${prop.enum.join(', ')}] 中`);
    }
    if (prop.pattern && typeof entry[field] === 'string') {
      if (!new RegExp(prop.pattern).test(entry[field])) {
        errors.push(`${field}: "${entry[field]}" 不匹配格式 ${prop.pattern}`);
      }
    }
  });

  // Validate palette colors
  if (entry.palette) {
    entry.palette.forEach((p, i) => {
      if (!p.name) errors.push(`palette[${i}]: 缺少 name`);
      if (!p.color) errors.push(`palette[${i}]: 缺少 color`);
      else if (!/^#[0-9a-fA-F]{6}$/.test(p.color)) errors.push(`palette[${i}].color: "${p.color}" 不是合法 hex 颜色`);
    });
  }

  return errors;
}

// ── Main ───────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('用法: node scripts/add-template.js <metadata.json>');
    console.log('');
    console.log('metadata.json 必填: slug, name, skill, template_type, design_style, scheme');
    console.log('可选: tagline, mood[], occasion[], tone[], formality, density, palette[],');
    console.log('       displayFont, bodyFont, typography_style, best_for, avoid_for,');
    console.log('       features[], visibility, aspect_ratio, slide_count');
    console.log('');
    console.log('脚本自动: 提取 CSS 变量, 推断 template_path, 校验 schema, 写入 registry');
    process.exit(args.length === 0 ? 1 : 0);
  }

  const metaPath = args[0];
  if (!fs.existsSync(metaPath)) {
    console.error(`文件不存在: ${metaPath}`);
    process.exit(1);
  }

  // Read metadata
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch (e) {
    console.error(`JSON 解析失败: ${e.message}`);
    process.exit(1);
  }

  // Infer template_path
  if (!meta.template_path) {
    meta.template_path = `templates/${meta.skill}/${meta.slug}/template.html`;
  }

  const tmplPath = path.join(PROJECT_DIR, meta.template_path);

  // Extract CSS variables
  if (fs.existsSync(tmplPath)) {
    const html = fs.readFileSync(tmplPath, 'utf-8');
    meta.css_variables = extractCSSVars(html);
    console.log(`CSS 变量: 提取 ${meta.css_variables.length} 个`);
  } else {
    console.warn(`模板文件不存在: ${tmplPath}，跳过 CSS 变量提取`);
    meta.css_variables = meta.css_variables || [];
  }

  // Set defaults
  meta.visibility = meta.visibility || 'public';
  meta.formality = meta.formality || 'medium';
  meta.density = meta.density || 'medium';
  meta.aspect_ratio = meta.aspect_ratio || '16:9';
  meta.slide_count = meta.slide_count || 0;
  meta.mood = meta.mood || [];
  meta.occasion = meta.occasion || [];
  meta.tone = meta.tone || [];
  meta.features = meta.features || [];
  meta.palette = meta.palette || [];
  meta.tagline = meta.tagline || '';
  meta.displayFont = meta.displayFont || '';
  meta.bodyFont = meta.bodyFont || '';
  meta.typography_style = meta.typography_style || '';
  meta.best_for = meta.best_for || '';
  meta.avoid_for = meta.avoid_for || '';
  meta.preview_type = meta.preview_type || 'iframe';

  // Validate
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  } catch (e) {
    console.warn('未找到 schema 文件，跳过校验');
    schema = { required: [], properties: {} };
  }

  const errors = validate(meta, schema);
  if (errors.length > 0) {
    console.error('校验失败:');
    errors.forEach(e => console.error('  ✗', e));
    process.exit(1);
  }
  console.log('校验通过 ✓');

  // Read registry, upsert
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const existingIdx = registry.findIndex(e => e.slug === meta.slug);

  // Ensure all registry-standard fields exist
  const entry = {
    slug: meta.slug,
    name: meta.name,
    tagline: meta.tagline,
    skill: meta.skill,
    template_type: meta.template_type,
    design_style: meta.design_style,
    aspect_ratio: meta.aspect_ratio,
    mood: meta.mood,
    occasion: meta.occasion,
    tone: meta.tone,
    formality: meta.formality,
    density: meta.density,
    scheme: meta.scheme,
    palette: meta.palette,
    displayFont: meta.displayFont,
    bodyFont: meta.bodyFont,
    typography_style: meta.typography_style,
    best_for: meta.best_for,
    avoid_for: meta.avoid_for,
    features: meta.features,
    slide_count: meta.slide_count,
    css_variables: meta.css_variables,
    visibility: meta.visibility,
    preview_type: meta.preview_type,
    template_path: meta.template_path,
  };

  if (existingIdx >= 0) {
    registry[existingIdx] = entry;
    console.log(`更新现有条目: ${meta.slug}`);
  } else {
    registry.push(entry);
    console.log(`新增条目: ${meta.slug}`);
  }

  // Write
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`registry.json 已更新 (${registry.length} 条目)`);

  // Summary
  console.log('');
  console.log('── 条目摘要 ──');
  console.log(`  slug:       ${entry.slug}`);
  console.log(`  name:       ${entry.name}`);
  console.log(`  skill:      ${entry.skill}`);
  console.log(`  type:       ${entry.template_type}`);
  console.log(`  style:      ${entry.design_style}`);
  console.log(`  scheme:     ${entry.scheme}`);
  console.log(`  formality:  ${entry.formality}`);
  console.log(`  density:    ${entry.density}`);
  console.log(`  visibility: ${entry.visibility}`);
  console.log(`  css_vars:   ${entry.css_variables.length} 个`);
  console.log(`  path:       ${entry.template_path}`);
}

main();

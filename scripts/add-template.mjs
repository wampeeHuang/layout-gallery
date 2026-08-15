// Add a template to registry.json — single atomic operation
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_DIR = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');
const SCHEMA_PATH = path.join(PROJECT_DIR, 'schemas', 'registry.schema.json');

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

  return errors;
}

// ── Main ───────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('用法: node scripts/add-template.js <metadata.json>');
    console.log('');
    console.log('metadata.json 必填: slug, name, skill, scheme, visual_family, content_type');
    console.log('可选: tagline, tone[], formality, density, best_for, avoid_for,');
    console.log('       features[], visibility, aspect_ratio, slide_count');
    console.log('');
    console.log('身份分类 visual_family/content_type/tone 值见 data/taxonomy.json 枚举');
    console.log('脚本自动: 推断 template_path, 校验 schema, 写入 registry');
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
    meta.template_path = `templates/${meta.slug}/template.html`;
  }

  const tmplPath = path.join(PROJECT_DIR, meta.template_path);

  // ── 文件系统门禁 ────────────────────────────────────────────
  if (!fs.existsSync(tmplPath)) {
    console.error(`✗ 模板文件不存在: ${tmplPath}`);
    console.error('  每个模板必须包含 template.html。注册中止。');
    process.exit(1);
  }

  // Check tokens.json (brand kit readiness)
  const tokensPath = path.join(path.dirname(tmplPath), 'tokens.json');
  if (fs.existsSync(tokensPath)) {
    console.log('tokens.json: ✓ 品牌套件可用');
    meta.brand_kit_ready = true;
  } else {
    console.warn('⚠ 缺 tokens.json — 品牌套件页 /brand/' + meta.slug + '/ 将不可用');
    console.warn('  运行 node scripts/extract-tokens.js ' + path.dirname(meta.template_path).replace(/\\/g, '/') + ' 生成');
    meta.brand_kit_ready = false;
  }

  // Set defaults
  meta.visibility = meta.visibility || 'public';
  meta.formality = meta.formality || 'medium';
  meta.density = meta.density || 'medium';
  meta.aspect_ratio = meta.aspect_ratio || '16:9';
  meta.slide_count = meta.slide_count || 0;
  meta.features = meta.features || [];
  meta.tagline = meta.tagline || '';
  meta.best_for = meta.best_for || '';
  meta.avoid_for = meta.avoid_for || '';
  meta.preview_type = meta.preview_type || 'iframe';
  meta.visual_family = meta.visual_family || null;
  meta.content_type = meta.content_type || null;
  meta.tone = meta.tone || [];

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

  // 目录契约唯一真相应是 registry.json —— 不再写 template.json 副本。
  // registry 字段校验已在上方 validate(meta, schema) 完成。

  // Read registry, upsert
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const existingIdx = registry.findIndex(e => e.slug === meta.slug);

  // Ensure all registry-standard fields exist
  const entry = {
    slug: meta.slug,
    name: meta.name,
    tagline: meta.tagline,
    skill: meta.skill,
    aspect_ratio: meta.aspect_ratio,
    visual_family: meta.visual_family,
    content_type: meta.content_type,
    tone: meta.tone,
    formality: meta.formality,
    density: meta.density,
    scheme: meta.scheme,
    best_for: meta.best_for,
    avoid_for: meta.avoid_for,
    features: meta.features,
    slide_count: meta.slide_count,
    visibility: meta.visibility,
    preview_type: meta.preview_type,
    template_path: meta.template_path,
    brand_kit_ready: meta.brand_kit_ready !== undefined ? meta.brand_kit_ready : false,
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

  // Token coverage audit
  try {
    const { auditEntry, loadContractRoles } = require('./audit-tokens');
    const contractRoles = loadContractRoles();
    const report = auditEntry(entry, contractRoles);
    console.log('');
    console.log('── Token 覆盖 ──');
    console.log(`  合规: ${report.compliance}  |  角色: ${report.totalCovered}/${report.totalRoles}  |  分类: ${report.coveredCategories}/6`);
    for (const [catKey, cat] of Object.entries(report.categories)) {
      if (cat.missing.length > 0) {
        console.log(`  ${cat.label}: 缺 ${cat.missing.join(', ')}`);
      }
    }
  } catch (e) {
    console.warn('跳过 token 审计:', e.message);
  }

  // Summary
  console.log('');
  console.log('── 条目摘要 ──');
  console.log(`  slug:       ${entry.slug}`);
  console.log(`  name:       ${entry.name}`);
  console.log(`  skill:      ${entry.skill}`);
  console.log(`  scheme:     ${entry.scheme}`);
  console.log(`  formality:  ${entry.formality}`);
  console.log(`  density:    ${entry.density}`);
  console.log(`  visibility: ${entry.visibility}`);
  console.log(`  path:       ${entry.template_path}`);
}

main();

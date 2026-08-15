import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const { readManifest, validateManifest } = require('./template-package.cjs');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/template-migration-report.mjs <slug>');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'data/registry.json'), 'utf8'));
const entry = registry.find(item => item.slug === slug);
if (!entry) throw new Error(`registry entry not found: ${slug}`);

const templateDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
const packageInfo = readManifest(PROJECT_DIR, entry.template_path, entry);
const manifest = packageInfo.manifest;
const mapping = {
  name: 'name',
  tagline: 'tagline',
  template_type: 'taxonomy.templateType',
  design_style: 'taxonomy.visualFamily',
  scheme: 'taxonomy.scheme',
  mood: 'mood',
  template_path: 'template_path',
  brand_kit_ready: 'capabilities.brandKit',
};

const get = (obj, key) => key.split('.').reduce((value, part) => value == null ? undefined : value[part], obj);
const overlaps = [];
const mismatches = [];
for (const [legacyKey, canonicalPath] of Object.entries(mapping)) {
  const legacyValue = entry[legacyKey];
  const canonicalValue = get(manifest, canonicalPath);
  if (legacyValue !== undefined) {
    overlaps.push({ legacyKey, canonicalPath });
    if (JSON.stringify(legacyValue) !== JSON.stringify(canonicalValue)) mismatches.push({ legacyKey, canonicalPath, legacyValue, canonicalValue });
  }
}

const legacyFiles = ['components.md', 'recipes.md', 'themes.json', 'template.json'];
const canonicalFiles = ['design.md', 'tokens.json', 'template.html'];
const report = {
  slug,
  generatedAt: new Date().toISOString(),
  manifestSource: packageInfo.source,
  manifestErrors: validateManifest(manifest),
  canonicalFiles: Object.fromEntries(canonicalFiles.map(file => [file, fs.existsSync(path.join(templateDir, file))])),
  legacyFiles: Object.fromEntries(legacyFiles.map(file => [file, fs.existsSync(path.join(templateDir, file))])),
  legacyOptional: true,
  registryOverlap: overlaps,
  registryMismatches: mismatches,
  themesMigration: fs.existsSync(path.join(templateDir, 'themes.json'))
    ? { action: 'retain-legacy', reason: 'preset css is empty; no real token delta to migrate' }
    : { action: 'none' },
  decision: mismatches.length === 0 && validateManifest(manifest).length === 0 ? 'dual-read-safe' : 'needs-review',
};

const outputDir = path.join(PROJECT_DIR, 'output', 'p1');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${slug}-migration.json`);
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({ outputPath, decision: report.decision, overlaps: overlaps.length, mismatches: mismatches.length, manifestErrors: report.manifestErrors.length }, null, 2));

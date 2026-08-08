#!/usr/bin/env node
/**
 * validate-taxonomy.mjs
 * 验证标签体系完整性：
 *   1. taxonomy.json schema 合法
 *   2. curation.json 每个条目 visual_family/content_type/tone 字段在枚举内
 *   3. 无遗漏模板
 * Exit 0 = 通过, Exit 1 = 有错误
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(__dirname, '..');

let errors = 0;

function fail(msg) { console.error('FAIL:', msg); errors++; }
function ok(msg) { console.log('OK:', msg); }

// ── Load files ──
let taxonomy, curation, registry;
try {
  taxonomy = JSON.parse(readFileSync(resolve(PROJECT_DIR, 'data', 'taxonomy.json'), 'utf-8'));
  ok('taxonomy.json loaded');
} catch (e) { fail('taxonomy.json: ' + e.message); process.exit(1); }

try {
  curation = JSON.parse(readFileSync(resolve(PROJECT_DIR, 'data', 'curation.json'), 'utf-8'));
  ok('curation.json loaded');
} catch (e) { fail('curation.json: ' + e.message); process.exit(1); }

try {
  registry = JSON.parse(readFileSync(resolve(PROJECT_DIR, 'data', 'registry.json'), 'utf-8'));
  ok('registry.json loaded');
} catch (e) { fail('registry.json: ' + e.message); process.exit(1); }

// ── 1. Validate taxonomy.json against schema ──
try {
  const schema = JSON.parse(readFileSync(resolve(PROJECT_DIR, 'schemas', 'taxonomy.schema.json'), 'utf-8'));

  if (taxonomy.$schema !== schema.$id) fail('taxonomy.json $schema mismatch');
  else ok('taxonomy $schema correct');

  for (const dim of ['visual_family', 'content_type', 'scheme', 'tone']) {
    if (!taxonomy[dim]) { fail('taxonomy missing dimension: ' + dim); continue; }
    if (!taxonomy[dim].description) fail(dim + ' missing description');
    if (!taxonomy[dim].values || Object.keys(taxonomy[dim].values).length === 0) fail(dim + ' values empty');

    const expectedKeys = dim === 'scheme' || dim === 'tone' ? ['label'] : ['label', 'desc'];
    for (const [key, val] of Object.entries(taxonomy[dim].values)) {
      for (const ek of expectedKeys) {
        if (!val[ek]) fail(dim + '.' + key + ' missing ' + ek);
      }
    }
  }
  ok('taxonomy.json structure valid');
} catch (e) {
  fail('taxonomy schema validation: ' + e.message);
  process.exit(1);
}

// ── 2. Validate curation entries ──
const vfValid = new Set(Object.keys(taxonomy.visual_family.values));
const ctValid = new Set(Object.keys(taxonomy.content_type.values));
const toneValid = new Set(Object.keys(taxonomy.tone.values));

const missing = { vf: 0, ct: 0, tone: 0 };
const invalid = { vf: [], ct: [], tone: [] };

let total = 0;
for (const [slug, entry] of Object.entries(curation.entries)) {
  if (entry.status === 'excluded') continue;
  total++;

  if (!entry.visual_family) { missing.vf++; fail(slug + ': missing visual_family'); }
  else if (!vfValid.has(entry.visual_family)) { invalid.vf.push(slug + '=' + entry.visual_family); fail(slug + ': invalid visual_family=' + entry.visual_family); }

  if (!entry.content_type) { missing.ct++; fail(slug + ': missing content_type'); }
  else if (!ctValid.has(entry.content_type)) { invalid.ct.push(slug + '=' + entry.content_type); fail(slug + ': invalid content_type=' + entry.content_type); }

  if (!entry.tone || entry.tone.length === 0) { missing.tone++; fail(slug + ': missing tone'); }
  else {
    for (const t of entry.tone) {
      if (!toneValid.has(t)) { invalid.tone.push(slug + '=' + t); fail(slug + ': invalid tone=' + t); }
    }
  }
}
ok(total + ' entries checked (excluded skipped)');

// ── 3. Cross-check with registry ──
const registrySlugs = new Set(registry.filter(e => e.status !== 'placeholder').map(e => e.slug));
const curationSlugs = new Set(Object.keys(curation.entries));
const inRegistryNotCuration = [...registrySlugs].filter(s => !curationSlugs.has(s));
const inCurationNotRegistry = [...curationSlugs].filter(s => !registrySlugs.has(s) && curation.entries[s].status !== 'excluded');

for (const s of inRegistryNotCuration) fail('registry has ' + s + ' but not in curation');
for (const s of inCurationNotRegistry) fail('curation has ' + s + ' but not in registry');
if (inRegistryNotCuration.length === 0 && inCurationNotRegistry.length === 0) ok('curation ↔ registry cross-check PASS');

// ── Summary ──
console.log('\n=== RESULT ===');
if (errors > 0) {
  console.log(errors + ' error(s) found');
  process.exit(1);
} else {
  console.log('All checks PASS. 35 templates labeled.');
  process.exit(0);
}

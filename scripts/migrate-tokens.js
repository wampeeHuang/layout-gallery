// migrate-tokens.js — MD3 token name migration
// Reads token-contract.json migrationMap, applies to all templates.
// Three-location sync: tokens.json names + :root vars + CSS var() refs.
//
// Usage:
//   node scripts/migrate-tokens.js              # migrate all templates
//   node scripts/migrate-tokens.js --dry-run    # preview only
//   node scripts/migrate-tokens.js --slug=xxx   # single template

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const CONTRACT_PATH = path.join(PROJECT_DIR, 'meta', 'token-contract.json');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');

function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf-8'));
}

function buildMigrationMap(contract) {
  const map = {};
  const mm = contract.migrationMap || {};
  for (const [cat, entries] of Object.entries(mm)) {
    if (cat.startsWith('_')) continue;
    for (const [oldName, newName] of Object.entries(entries)) {
      map[oldName] = newName;
    }
  }
  return map;
}

function migrateTokensJson(tokensPath, migrationMap) {
  const data = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  let migrated = 0;
  let skipped = 0;

  for (const [cat, tokens] of Object.entries(data.tokens)) {
    if (!Array.isArray(tokens)) continue;

    // Track which new names already exist in this category to avoid duplicates.
    // When multiple old names map to same new name (e.g. --accent/--accent-dark both → --color-primary),
    // only the first wins. Derived variants (darker/lighter/hover) are CSS-level, not tokens.
    const usedTargets = new Set(tokens.map(t => t.name));

    for (const t of tokens) {
      const target = migrationMap[t.name];
      if (!target) continue;

      // Check if this token is a "canonical" mapping (--accent → primary) vs derived (--accent-dark → primary)
      // Canonical = the old name is the shortest form; derived = longer form (has extra suffix)
      const isCanonical = !Object.keys(migrationMap).some(
        other => other !== t.name && migrationMap[other] === target && other.length < t.name.length
      );

      if (isCanonical || !usedTargets.has(target)) {
        usedTargets.add(target);
        t.name = target;
        migrated++;
      } else {
        // Derived variant (darker/lighter/hover) — skip, this is a CSS concern
        skipped++;
      }
    }
  }

  return { data, migrated, skipped };
}

function migrateTemplateHtml(tmplPath, migrationMap) {
  let html = fs.readFileSync(tmplPath, 'utf-8');
  let migratedRoot = 0;
  let migratedVar = 0;
  let deduped = 0;

  // Sort keys longest-first to avoid partial matches
  const sortedKeys = Object.keys(migrationMap).sort((a, b) => b.length - a.length);

  // ── Phase 1: replace var() references (all instances) ──
  for (const oldName of sortedKeys) {
    const newName = migrationMap[oldName];
    const varRe = new RegExp('var\\(' + oldName.replace(/--/g, '--') + '(?=[,\\)])', 'g');
    const varMatches = html.match(varRe);
    if (varMatches) {
      html = html.replace(varRe, 'var(' + newName);
      migratedVar += varMatches.length;
    }
  }

  // ── Phase 2: replace :root declarations, dedup same-target mappings ──
  // Build reverse: target → [source names sorted shortest first]
  const targetSources = {};
  for (const oldName of sortedKeys) {
    const target = migrationMap[oldName];
    if (!targetSources[target]) targetSources[target] = [];
    targetSources[target].push(oldName);
  }

  // Replace :root block: for each old→new pair, replace old with new.
  // When multiple old names point to same new name, only the shortest (canonical) keeps its declaration;
  // subsequent ones are removed.
  const rootBlockRe = /(:root\s*\{)([^}]*)(\})/s;
  const rootMatch = html.match(rootBlockRe);

  if (rootMatch) {
    let rootContent = rootMatch[2];

    for (const oldName of sortedKeys) {
      const newName = migrationMap[oldName];
      const canonicals = targetSources[newName].sort((a, b) => a.length - b.length);
      const isCanonical = oldName === canonicals[0];

      // Find --old-name: value; in :root
      const declRe = new RegExp('(' + oldName.replace(/--/g, '--') + '\\s*:\\s*[^;]+;)', 'g');

      if (isCanonical) {
        // Replace name, keep value
        const matches = rootContent.match(declRe);
        if (matches) {
          rootContent = rootContent.replace(declRe, (match) => {
            migratedRoot++;
            return match.replace(oldName, newName);
          });
        }
      } else {
        // Derived variant — remove declaration entirely
        const before = rootContent.length;
        rootContent = rootContent.replace(declRe, '');
        if (rootContent.length !== before) deduped++;
      }
    }

    html = html.replace(rootBlockRe, '$1' + rootContent + '$3');
  }

  return { html, migratedRoot, migratedVar, deduped };
}

function migrateOne(slug, tmplDir, migrationMap, dryRun) {
  const tokensPath = path.join(tmplDir, 'tokens.json');
  const tmplPath = path.join(tmplDir, 'template.html');

  const result = { slug, tokens: 0, root: 0, varRefs: 0 };

  if (fs.existsSync(tokensPath)) {
    const { data, migrated } = migrateTokensJson(tokensPath, migrationMap);
    result.tokens = migrated;
    if (!dryRun && migrated > 0) {
      fs.writeFileSync(tokensPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    }
  }

  if (fs.existsSync(tmplPath)) {
    const { html, migratedRoot, migratedVar } = migrateTemplateHtml(tmplPath, migrationMap);
    result.root = migratedRoot;
    result.varRefs = migratedVar;
    if (!dryRun && (migratedRoot > 0 || migratedVar > 0)) {
      fs.writeFileSync(tmplPath, html, 'utf-8');
    }
  }

  return result;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugFilter = args.find(a => a.startsWith('--slug='));
  const targetSlug = slugFilter ? slugFilter.replace('--slug=', '') : null;

  const contract = loadContract();
  const migrationMap = buildMigrationMap(contract);

  console.log('Migration map: ' + Object.keys(migrationMap).length + ' entries');
  console.log(dryRun ? '(DRY RUN — no files written)' : '(LIVE — files will be written)');
  console.log('');

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  let total = { tokens: 0, root: 0, varRefs: 0 };

  for (const entry of registry) {
    if (entry.status === 'placeholder' || !entry.template_path) continue;
    if (targetSlug && entry.slug !== targetSlug) continue;

    const tmplDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
    const r = migrateOne(entry.slug, tmplDir, migrationMap, dryRun);
    total.tokens += r.tokens;
    total.root += r.root;
    total.varRefs += r.varRefs;

    const status = (r.tokens + r.root + r.varRefs) > 0 ? '✓' : '-';
    console.log('  ' + status + ' ' + r.slug.padEnd(20) + ' tokens:' + r.tokens + ' root:' + r.root + ' var():' + r.varRefs);
  }

  console.log('');
  console.log('Total: ' + total.tokens + ' token names, ' + total.root + ' :root vars, ' + total.varRefs + ' var() refs');

  if (dryRun) {
    console.log('\nRe-run without --dry-run to apply.');
  }
}

module.exports = { buildMigrationMap, migrateTokensJson, migrateTemplateHtml };

if (require.main === module) {
  main();
}

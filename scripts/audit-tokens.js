// Audit template CSS variables against token-contract.json roles
// Usage:
//   node scripts/audit-tokens.js                  → all templates, summary table
//   node scripts/audit-tokens.js <slug>           → single template, detailed report
//   node scripts/audit-tokens.js --json           → all templates, JSON output

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const CONTRACT_PATH = path.join(PROJECT_DIR, 'meta', 'token-contract.json');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');

// ── Load contract roles ──────────────────────────────────────────

function loadContractRoles() {
  const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf-8'));
  const roles = {};
  for (const [catKey, cat] of Object.entries(contract.categories)) {
    roles[catKey] = {
      label: cat.label,
      total: cat.roles.length,
      roleNames: cat.roles.map(r => r.role),
    };
  }
  return roles;
}

// ── Audit single entry ───────────────────────────────────────────

function auditEntry(entry, contractRoles) {
  const mappedRoles = new Set();
  const cssVars = entry.css_variables || [];

  for (const v of cssVars) {
    if (v.role && v.role.trim()) {
      mappedRoles.add(v.role.trim());
    }
  }

  const categories = {};
  let totalCovered = 0;
  let totalRoles = 0;

  for (const [catKey, cat] of Object.entries(contractRoles)) {
    const covered = cat.roleNames.filter(r => mappedRoles.has(r));
    const missing = cat.roleNames.filter(r => !mappedRoles.has(r));
    categories[catKey] = {
      label: cat.label,
      covered: covered.length,
      total: cat.total,
      missing,
    };
    totalCovered += covered.length;
    totalRoles += cat.total;
  }

  const coveredCategories = Object.values(categories).filter(c => c.covered > 0).length;
  let compliance;
  if (coveredCategories === 6) compliance = 'full';
  else if (coveredCategories >= 3) compliance = 'partial';
  else if (coveredCategories >= 1) compliance = 'minimal';
  else compliance = 'none';

  return {
    slug: entry.slug,
    name: entry.name,
    design_style: entry.design_style,
    totalCovered,
    totalRoles,
    coveredCategories,
    compliance,
    categories,
  };
}

// ── CLI ───────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const contractRoles = loadContractRoles();
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

  // --json flag: output machine-readable
  const asJson = args.includes('--json');
  const slug = args.find(a => !a.startsWith('--'));

  if (slug) {
    const entry = registry.find(e => e.slug === slug);
    if (!entry) {
      console.error(`模板不存在: ${slug}`);
      process.exit(1);
    }
    const report = auditEntry(entry, contractRoles);
    if (asJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printDetail(report);
    }
    return;
  }

  const reports = registry.map(e => auditEntry(e, contractRoles));

  if (asJson) {
    console.log(JSON.stringify(reports, null, 2));
    return;
  }

  printSummary(reports);
}

// ── Output formatters ────────────────────────────────────────────

function printSummary(reports) {
  const counts = { full: 0, partial: 0, minimal: 0, none: 0 };
  reports.forEach(r => counts[r.compliance]++);

  console.log('Token 角色覆盖审计');
  console.log('='.repeat(60));
  console.log(`模板总数: ${reports.length}`);
  console.log(`  full (6/6):    ${counts.full}`);
  console.log(`  partial (3-5): ${counts.partial}`);
  console.log(`  minimal (1-2): ${counts.minimal}`);
  console.log(`  none  (0):     ${counts.none}`);
  console.log('');

  // List non-full templates
  const problemReports = reports.filter(r => r.compliance !== 'full');
  if (problemReports.length === 0) {
    console.log('所有模板通过 ✓');
    return;
  }

  console.log(`${'模板名'.padEnd(30)} ${'风格'.padEnd(16)} ${'覆盖'.padEnd(8)} ${'等级'}`);
  console.log('-'.repeat(60));
  for (const r of problemReports) {
    const name = r.name.slice(0, 28).padEnd(30);
    const style = (r.design_style || '').slice(0, 14).padEnd(16);
    const cov = `${r.totalCovered}/${r.totalRoles}`.padEnd(8);
    console.log(`${name} ${style} ${cov} ${r.compliance}`);
  }
}

function printDetail(report) {
  console.log(`${report.name}  (${report.slug})`);
  console.log(`风格: ${report.design_style}  |  合规: ${report.compliance}`);
  console.log(`角色覆盖: ${report.totalCovered}/${report.totalRoles}  |  分类覆盖: ${report.coveredCategories}/6`);
  console.log('');
  console.log(`${'分类'.padEnd(14)} ${'覆盖'.padEnd(8)} ${'缺失角色'}`);
  console.log('-'.repeat(60));
  for (const [catKey, cat] of Object.entries(report.categories)) {
    const label = cat.label.padEnd(14);
    const cov = `${cat.covered}/${cat.total}`.padEnd(8);
    const missing = cat.missing.length === 0 ? '—' : cat.missing.join(', ');
    console.log(`${label} ${cov} ${missing}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { auditEntry, loadContractRoles };

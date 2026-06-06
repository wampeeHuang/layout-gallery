// Extract CSS variables from all templates
const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', 'registry.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function extractCSSVars(html) {
  const vars = [];
  // Match :root { ... } block
  const rootMatch = html.match(/:root\s*\{([^}]*)\}/s);
  if (!rootMatch) return vars;

  const block = rootMatch[1];

  // First try: extract vars with inline comments /* desc */ --var: value;
  const commentedRegex = /\/\*\s*([^*]+)\*\/\s*\n?\s*(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = commentedRegex.exec(block))) {
    const desc = m[1].trim();
    const name = m[2];
    const def = m[3].trim();
    // Skip section headers and multi-line instructions
    if (desc.length < 120 && !desc.includes('===') && !desc.includes('切换')) {
      vars.push({ name, default: def, description: desc });
    }
  }

  // Second pass: extract uncommented --var: value;
  const allVarRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  while ((m = allVarRegex.exec(block))) {
    const name = m[1];
    const def = m[2].trim();
    // Don't duplicate
    if (!vars.find(v => v.name === name)) {
      vars.push({ name, default: def, description: '' });
    }
  }

  return vars;
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

let total = 0;
registry.forEach(entry => {
  if (entry.status === 'placeholder') return;

  const tmplPath = path.join(TEMPLATES_DIR, entry.skill, entry.slug, 'template.html');
  if (!fs.existsSync(tmplPath)) return;

  const html = fs.readFileSync(tmplPath, 'utf-8');
  const vars = extractCSSVars(html);

  entry.css_variables = vars;
  if (vars.length > 0) total++;
});

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

// Report
const bySkill = {};
registry.forEach(e => {
  if (e.status === 'placeholder') return;
  bySkill[e.skill] = bySkill[e.skill] || { total: 0, withVars: 0 };
  bySkill[e.skill].total++;
  if (e.css_variables.length > 0) bySkill[e.skill].withVars++;
});

console.log(`CSS variables extracted. Templates with :root vars: ${total}/${registry.filter(e => e.status !== 'placeholder').length}`);
for (const [skill, s] of Object.entries(bySkill)) {
  console.log(`  ${skill}: ${s.withVars}/${s.total} have CSS vars`);
}

// Show some examples
const sample = registry.find(e => e.css_variables.length > 0);
if (sample) {
  console.log(`\nSample: ${sample.name} (${sample.css_variables.length} vars):`);
  sample.css_variables.forEach(v => console.log(`  ${v.name}: ${v.default} — ${v.description}`));
}

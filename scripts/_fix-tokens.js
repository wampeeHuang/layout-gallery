// Temporary: fix tokens.json for editorial test templates
const fs = require('fs');
const path = require('path');

const STANDARD_COLORS = [
  { name: '--accent', role: 'accent' },
  { name: '--accent-alt', role: 'accent' },
  { name: '--accent-hover', role: 'accent' },
  { name: '--bg', role: 'surface-bg' },
  { name: '--surface', role: 'surface-card' },
  { name: '--text', role: 'text-primary' },
  { name: '--text-soft', role: 'text-secondary' },
  { name: '--line', role: 'border' }
];

const STANDARD_TYPO = ['--font-display', '--font-body', '--font-mono'];
const STANDARD_SPACING = ['--page-wmax', '--page-pad', '--gap', '--gutter'];
const STANDARD_SHADOW = ['--shadow-sm', '--shadow-md'];
const STANDARD_MOTION = ['--ease-default', '--duration-base'];

// Non-standard → standard name mapping for editorial templates
const RENAMES = {
  '--paper': '--bg',
  '--paper-2': '--surface',
  '--ink': '--text',
  '--ink-soft': '--text-soft',
  '--body': '--font-body',
  '--display': '--font-display',
  '--mono': '--font-mono'
};

function fixTokensFile(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const brandKit = data.brandKit || {};
  const cr = brandKit.colorRoles || {};

  // Collect all existing token name→value
  const values = {};
  ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'].forEach(cat => {
    (data.tokens[cat] || []).forEach(t => { values[t.name] = t.value; });
  });

  let changed = false;

  // Step 1: Rename non-standard → standard in color tokens
  (data.tokens.color || []).forEach(t => {
    const newName = RENAMES[t.name];
    if (newName && !values[newName]) {
      t.name = newName;
      t.description = 'Standard: ' + (t.description || '');
      changed = true;
    }
  });

  // Refresh values after renames
  ['color', 'typography', 'spacing', 'radius', 'shadow', 'motion'].forEach(cat => {
    (data.tokens[cat] || []).forEach(t => { values[t.name] = t.value; });
  });

  const existingColorNames = (data.tokens.color || []).map(t => t.name);

  const defaults = {
    '--accent': cr.primary || values['--accent'] || values['--pink'] || values['--lemon'] || '#333',
    '--accent-alt': cr.secondary || values['--accent-alt'] || values['--lemon'] || values['--pink'] || '#888',
    '--accent-hover': values['--accent-hover'] || defaults_primary_dark(cr.primary || values['--accent']),
    '--bg': cr.background || values['--bg'] || '#fafafa',
    '--surface': cr.surface || values['--surface'] || values['--bg'] || '#fff',
    '--text': cr.text || values['--text'] || '#1a1a1a',
    '--text-soft': cr.textSecondary || values['--text-soft'] || '#666',
    '--line': cr.border || values['--line'] || '#e8e8e8',
    '--font-display': values['--font-display'] || 'Georgia, serif',
    '--font-body': values['--font-body'] || 'Inter, system-ui, sans-serif',
    '--font-mono': values['--font-mono'] || '"SF Mono", Consolas, monospace',
    '--page-wmax': values['--page-wmax'] || '1200px',
    '--page-pad': values['--page-pad'] || '32px',
    '--gap': values['--gap'] || '24px',
    '--gutter': values['--gutter'] || '24px',
    '--radius': values['--radius'] || '4px',
    '--shadow-sm': values['--shadow-sm'] || '0 1px 3px rgba(0,0,0,0.06)',
    '--shadow-md': values['--shadow-md'] || '0 8px 30px rgba(0,0,0,0.1)',
    '--ease-default': values['--ease-default'] || '0.18s ease',
    '--duration-base': values['--duration-base'] || '150ms'
  };

  function defaults_primary_dark(hex) {
    // Simple darken: just use a dark fallback
    return '#1a1a1a';
  }

  // Add missing standard colors
  STANDARD_COLORS.forEach(def => {
    if (!existingColorNames.includes(def.name)) {
      data.tokens.color.push({
        name: def.name,
        value: defaults[def.name],
        role: def.role,
        description: 'Standard (auto-generated)'
      });
      changed = true;
    }
  });

  // Add missing typography
  if (!data.tokens.typography) data.tokens.typography = [];
  const typoNames = data.tokens.typography.map(t => t.name);
  STANDARD_TYPO.forEach(name => {
    if (!typoNames.includes(name)) {
      data.tokens.typography.push({ name, value: defaults[name], role: 'font', description: 'Standard' });
      changed = true;
    }
  });

  // Add missing spacing
  if (!data.tokens.spacing) data.tokens.spacing = [];
  const spacingNames = data.tokens.spacing.map(t => t.name);
  STANDARD_SPACING.forEach(name => {
    if (!spacingNames.includes(name)) {
      data.tokens.spacing.push({ name, value: defaults[name], role: '', description: 'Standard' });
      changed = true;
    }
  });

  // Add missing radius
  if (!data.tokens.radius) data.tokens.radius = [];
  if (!data.tokens.radius.find(t => t.name === '--radius')) {
    data.tokens.radius.push({ name: '--radius', value: defaults['--radius'], role: 'radius', description: 'Standard' });
    changed = true;
  }

  // Add missing shadow
  if (!data.tokens.shadow) data.tokens.shadow = [];
  const shadowNames = data.tokens.shadow.map(t => t.name);
  STANDARD_SHADOW.forEach(name => {
    if (!shadowNames.includes(name)) {
      data.tokens.shadow.push({ name, value: defaults[name], role: 'shadow', description: 'Standard' });
      changed = true;
    }
  });

  // Add missing motion
  if (!data.tokens.motion) data.tokens.motion = [];
  const motionNames = data.tokens.motion.map(t => t.name);
  STANDARD_MOTION.forEach(name => {
    if (!motionNames.includes(name)) {
      data.tokens.motion.push({ name, value: defaults[name], role: '', description: 'Standard' });
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  }
  return false;
}

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.log('Usage: node scripts/_fix-tokens.js <slug1> <slug2> ...');
  process.exit(1);
}

// Look up template path from registry
const registryPath = path.join(__dirname, '..', 'data', 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
const base = path.join(__dirname, '..', 'templates', 'beautiful-html-templates');

slugs.forEach(slug => {
  // Find the template in registry to get correct path
  const entry = registry.find(e => e.slug === slug);
  let jsonPath;
  if (entry) {
    jsonPath = path.join(__dirname, '..', path.dirname(entry.template_path), 'tokens.json');
  } else {
    jsonPath = path.join(base, slug, 'tokens.json');
  }
  if (!fs.existsSync(jsonPath)) {
    console.log(slug + ': MISSING tokens.json');
    return;
  }
  const fixed = fixTokensFile(jsonPath);
  console.log(slug + ': ' + (fixed ? 'FIXED' : 'already OK'));
});

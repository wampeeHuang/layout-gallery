// Convert W3C DTCG tokens (designlang) → gallery tokens.json format
const fs = require('fs');

const dtcg = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));

// Resolve references like "{primitive.color.brand.primary}" to concrete values
function resolveValue(val, root) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    const refPath = val.slice(1, -1).split('.');
    let v = root;
    for (const p of refPath) {
      if (!v || typeof v !== 'object') return val;
      v = (v[p] !== undefined) ? v[p] : v;
    }
    if (v && typeof v === 'object' && '$value' in v) return resolveValue(v.$value, root);
    return typeof v === 'string' ? v : val;
  }
  if (typeof val === 'object' && val !== null && '$value' in val) {
    return resolveValue(val.$value, root);
  }
  return val;
}

// Extract flat tokens
function extractTokens(obj, root, prefix = '') {
  const result = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const name = prefix ? prefix + '-' + k : k;
    if (typeof v === 'object' && v !== null && !('$value' in v) && !('$type' in v)) {
      result.push(...extractTokens(v, root, name));
      continue;
    }
    const resolved = resolveValue(v, root);
    if (resolved === undefined || resolved === null) continue;
    if (typeof resolved === 'object') {
      // typography tokens like {fontFamily, fontSize, ...}
      for (const [prop, pval] of Object.entries(resolved)) {
        result.push({ name: '--dtcg-' + name + '-' + prop, value: String(pval), group: 'typography' });
      }
      continue;
    }
    const strVal = String(resolved);
    // Classify by token name prefix
    let group = 'color';
    if (name.includes('font') || name.includes('typography') || name.includes('line-height') || name.includes('letter-spacing')) group = 'typography';
    else if (name.includes('spacing') || name.includes('gap') || name.includes('padding') || name.includes('margin')) group = 'spacing';
    else if (name.includes('radius')) group = 'radius';
    else if (name.includes('shadow')) group = 'shadow';
    else if (name.includes('duration') || name.includes('easing') || name.includes('animation')) group = 'motion';
    else if (name.includes('color') || strVal.startsWith('#') || strVal.startsWith('rgb')) group = 'color';
    result.push({ name: '--dtcg-' + name, value: strVal, group });
  }
  return result;
}

const allTokens = extractTokens(dtcg, dtcg);

// Build gallery-compatible tokens.json
const tokens = { color: [], typography: [], spacing: [], radius: [], shadow: [], motion: [] };
allTokens.forEach(t => {
  if (tokens[t.group]) tokens[t.group].push({ name: t.name, value: t.value });
});

// brandKit stub
const brandKit = {
  typeScale: ['3rem', '2rem', '1.5rem', '1.25rem', '1rem', '0.875rem', '0.75rem'],
  spacingScale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'],
  colorRoles: {}
};

console.log(JSON.stringify({ tokens, brandKit }, null, 2));

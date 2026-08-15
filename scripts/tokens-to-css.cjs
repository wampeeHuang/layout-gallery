'use strict';

// tokens.json → :root CSS 唯一生成器。compile.mjs（编译模板）与 server.js（画廊站点注入）共用。

const SECTION_ORDER = [
  { key: 'color',      label: 'Color Roles' },
  { key: 'typography', label: 'Typography' },
  { key: 'dimension',  label: 'Dimensions — Radius, Spacing & Page Layout' },
  { key: 'shadow',     label: 'Shadow' },
  { key: 'easing',     label: 'Motion — Easing' },
  { key: 'duration',   label: 'Motion — Duration' },
];

function formatCubicBezier(arr) {
  return `cubic-bezier(${arr.join(',')})`;
}

function tokenToCSS(token) {
  const { name, $type, value } = token;
  let cssValue;

  switch ($type) {
    case 'color':
    case 'fontFamily':
    case 'dimension':
    case 'duration':
    case 'shadow':
    case 'raw':
      cssValue = value;
      break;
    case 'cubicBezier':
      cssValue = Array.isArray(value) ? formatCubicBezier(value) : value;
      break;
    default:
      throw new Error(`Unknown $type "${$type}" for token "${name}"`);
  }

  return `  ${name}: ${cssValue};`;
}

function generateRoot(tokens) {
  const lines = [':root {'];

  for (const { key, label } of SECTION_ORDER) {
    const group = tokens[key];
    if (!group || group.length === 0) continue;

    lines.push('');
    lines.push(`  /* ── ${label} ── */`);

    for (const token of group) {
      lines.push(tokenToCSS(token));
    }
  }

  // 未列入标准顺序的额外分组，按 tokens.json 原始顺序追加
  for (const [key, group] of Object.entries(tokens)) {
    if (SECTION_ORDER.some(s => s.key === key)) continue;
    if (!Array.isArray(group) || group.length === 0) continue;

    lines.push('');
    lines.push(`  /* ── ${key} ── */`);

    for (const token of group) {
      lines.push(tokenToCSS(token));
    }
  }

  lines.push('}');
  return lines.join('\n');
}

module.exports = { generateRoot, tokenToCSS };

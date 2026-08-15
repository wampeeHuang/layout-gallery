#!/usr/bin/env node

/**
 * validate.mjs — tokens.json 类型校验器
 *
 * 校验规则:
 *   1. $type 与 value 格式匹配
 *   2. 必填 token (required in token-contract) 存在
 *   3. 无重复 token name
 *   4. token name 符合 --kebab-case 约定
 *
 * 用法:
 *   node scripts/validate.mjs <slug>           # 校验单个模板
 *   node scripts/validate.mjs --all             # 校验所有有 tokens.json 的模板
 *   node scripts/validate.mjs <slug> --strict   # 严格模式: 也检查旧 brand.json+layout.json
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── 类型校验器 ──────────────────────────────────────────────────

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const RGB_RE = /^rgba?\([\d,\s.]+\)$/;
const HSL_RE = /^hsla?\([\d,\s%.]+\)$/;
const RGB_INT_RE = /^\d{1,3},\d{1,3},\d{1,3}$/;
const DIMENSION_RE = /^-?\d+(\.\d+)?(px|rem|em|vw|vh|vmin|vmax|%|ch|ex|cm|mm|in|pt|pc)$/;
const CSS_FN_RE = /^(clamp|min|max|calc)\(/;
const DURATION_RE = /^-?(\d+(\.\d+)?|\.\d+)(ms|s)$/;
const SHADOW_RE = /^(inset\s+)?(\d|\.)/;  // starts with number or "inset" + number

function validateColor(value) {
  if (typeof value !== 'string') return 'color value must be a string';
  if (HEX_RE.test(value)) return null;
  if (RGB_RE.test(value)) return null;
  if (HSL_RE.test(value)) return null;
  if (RGB_INT_RE.test(value)) return null;  // comma-separated RGB (helper vars)
  return `Invalid color value: "${value}"`;
}

function validateFontFamily(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'fontFamily value must be a non-empty string';
  }
  // Should contain at least one font name
  if (!value.includes(',')) {
    // Single font is OK but unusual for web-safe stacks
    return null;  // Warning only, not error
  }
  return null;
}

function validateDimension(value) {
  if (typeof value !== 'string') return 'dimension value must be a string';
  if (DIMENSION_RE.test(value)) return null;
  if (CSS_FN_RE.test(value)) return null;  // e.g. clamp(40px, 7vw, 64px)
  return `Invalid dimension value: "${value}". Expected a CSS length with unit (px, rem, vh, etc.) or CSS function.`;
}

function validateDuration(value) {
  if (typeof value !== 'string') return 'duration value must be a string';
  if (DURATION_RE.test(value)) return null;
  return `Invalid duration value: "${value}". Expected a time value (ms or s)`;
}

function validateCubicBezier(value) {
  if (!Array.isArray(value)) return 'cubicBezier value must be an array of 4 numbers';
  if (value.length !== 4) return `cubicBezier needs 4 numbers, got ${value.length}`;
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'number') return `cubicBezier[${i}] is not a number: ${value[i]}`;
    // P1, P2 must be 0–1; P3, P4 are typically 0–1 but can extend slightly
    const limit = i < 2 ? 1 : 1.1;
    if (value[i] < 0 || value[i] > limit) {
      return `cubicBezier[${i}]=${value[i]} out of range [0,${limit}]`;
    }
  }
  return null;
}

function validateShadow(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'shadow value must be a non-empty string';
  }
  if (value.trim() === 'none') return null;
  if (SHADOW_RE.test(value.trim())) return null;
  return `Invalid shadow value: "${value}". Expected CSS box-shadow format.`;
}

const VALIDATORS = {
  color:         validateColor,
  fontFamily:    validateFontFamily,
  dimension:     validateDimension,
  duration:      validateDuration,
  cubicBezier:   validateCubicBezier,
  shadow:        validateShadow,
  raw:           () => null,  // pass-through
};

// ── 必填 token 清单 (从 token-contract.json) ────────────────────

const REQUIRED_TOKENS = [
  '--color-primary',
  '--color-secondary',
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-variant',
  '--color-outline',
  '--font-display',
  '--font-body',
  '--elevation-sm',
  '--ease-standard',
  '--duration-base',
  '--space-page-wmax',
  '--space-page-pad',
  '--space-gap',
  '--space-gutter',
];

// ── 词汇表 (token-contract.json) ───────────────────────────────

let _contractCache = null;
function loadContract() {
  if (_contractCache) return _contractCache;
  const contractPath = resolve(ROOT, 'schemas', 'token-contract.json');
  _contractCache = JSON.parse(readFileSync(contractPath, 'utf-8'));
  return _contractCache;
}

function buildAllowedNames(slug) {
  const contract = loadContract();
  const allowed = new Set();

  for (const layer of ['brand', 'layout']) {
    const categories = contract.standardVars?.[layer] || {};
    for (const [cat, entries] of Object.entries(categories)) {
      if (cat.startsWith('_')) continue;
      for (const name of Object.keys(entries)) {
        if (!name.startsWith('_')) allowed.add(name);
      }
    }
  }

  const specific = contract.templateSpecific?.[slug] || {};
  for (const layer of ['brand', 'layout']) {
    const categories = specific[layer] || {};
    for (const entries of Object.values(categories)) {
      if (!Array.isArray(entries)) continue;  // skip note/_convention
      for (const name of entries) allowed.add(name);
    }
  }

  return allowed;
}

// ── 校验入口 ───────────────────────────────────────────────────

function validateTokens(tokensData, slug) {
  const issues = [];
  const warnings = [];

  if (!tokensData.tokens || typeof tokensData.tokens !== 'object') {
    issues.push('Missing or invalid "tokens" object');
    return { issues, warnings };
  }

  const allTokens = [];
  const allNames = new Set();
  const allowedNames = buildAllowedNames(slug);

  // Flatten all token groups
  for (const [groupName, group] of Object.entries(tokensData.tokens)) {
    if (!Array.isArray(group)) {
      issues.push(`tokens.${groupName} must be an array`);
      continue;
    }

    for (const token of group) {
      allTokens.push({ ...token, _group: groupName });

      // Check required fields
      if (!token.name) {
        issues.push(`tokens.${groupName}: token missing "name" field`);
        continue;
      }
      if (!token.$type) {
        issues.push(`${token.name}: missing "$type" field`);
        continue;
      }
      if (token.value === undefined || token.value === null) {
        issues.push(`${token.name}: missing "value" field`);
        continue;
      }

      // Check naming convention
      if (!token.name.startsWith('--')) {
        issues.push(`${token.name}: token name must start with "--"`);
      }

      // Check vocabulary (compliance.violation: name not in standardVars nor templateSpecific[slug])
      if (!allowedNames.has(token.name)) {
        issues.push(`${token.name}: token name not in vocabulary (standardVars or templateSpecific["${slug}"]) — compliance violation`);
      }

      // Check duplicate names
      if (allNames.has(token.name)) {
        issues.push(`${token.name}: duplicate token name (defined in multiple groups)`);
      }
      allNames.add(token.name);

      // Validate $type
      const validator = VALIDATORS[token.$type];
      if (!validator) {
        warnings.push(`${token.name}: unknown $type "${token.$type}" — skipped validation`);
        continue;
      }

      const err = validator(token.value);
      if (err) {
        issues.push(`${token.name} (${token.$type}): ${err}`);
      }
    }
  }

  // Check required tokens
  for (const reqName of REQUIRED_TOKENS) {
    if (!allNames.has(reqName)) {
      issues.push(`Missing required token: ${reqName}`);
    }
  }

  return { issues, warnings, tokenCount: allTokens.length };
}

// ── 兼容模式: 校验旧 brand.json + layout.json ──────────────────

function validateLegacy(slug) {
  const issues = [];
  const base = resolve(ROOT, 'templates', slug);

  const brandPath = resolve(base, 'brand.json');
  const layoutPath = resolve(base, 'layout.json');

  if (!existsSync(brandPath)) issues.push('Missing brand.json');
  if (!existsSync(layoutPath)) issues.push('Missing layout.json');

  if (issues.length > 0) return { issues, warnings: [], tokenCount: 0 };

  const brand = JSON.parse(readFileSync(brandPath, 'utf-8'));
  const layout = JSON.parse(readFileSync(layoutPath, 'utf-8'));

  // Check both have tokens
  if (!brand.tokens) issues.push('brand.json: missing "tokens"');
  if (!layout.tokens) issues.push('layout.json: missing "tokens"');

  return { issues, warnings: [], tokenCount: 0, note: 'Legacy format — run migration to tokens.json' };
}

// ── 目录枚举检查 (registry.json 标签值 ∈ taxonomy 枚举) ──

function loadTaxonomyEnums() {
  const txPath = resolve(ROOT, 'data', 'taxonomy.json');
  if (!existsSync(txPath)) return null;
  const tx = JSON.parse(readFileSync(txPath, 'utf-8'));
  const enums = {};
  for (const dim of ['scheme', 'tone', 'formality', 'density', 'visual_family', 'content_type']) {
    if (tx[dim]?.values) enums[dim] = new Set(Object.keys(tx[dim].values));
  }
  return enums;
}

function validateCatalogEnums() {
  const enums = loadTaxonomyEnums();
  if (!enums) return [{ enum: true, issues: ['data/taxonomy.json not found'] }];

  const issues = [];

  const registryPath = resolve(ROOT, 'data', 'registry.json');
  if (existsSync(registryPath)) {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    for (const e of registry) {
      for (const dim of ['scheme', 'formality', 'density', 'visual_family', 'content_type']) {
        if (e[dim] !== undefined && e[dim] !== null && !enums[dim].has(e[dim])) {
          issues.push(`registry:${e.slug}.${dim}="${e[dim]}" not in taxonomy enum`);
        }
      }
      for (const t of (e.tone || [])) {
        if (!enums.tone.has(t)) issues.push(`registry:${e.slug}.tone="${t}" not in taxonomy enum`);
      }
    }
  }

  return issues;
}

// ── 主入口 ─────────────────────────────────────────────────────

function validateOne(slug, strict = false) {
  const tokensPath = resolve(ROOT, 'templates', slug, 'tokens.json');

  if (!existsSync(tokensPath)) {
    if (strict) {
      return validateLegacy(slug);
    }
    console.log(`SKIP: ${slug} — no tokens.json (not yet migrated)`);
    return null;
  }

  const raw = readFileSync(tokensPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`ERROR: ${slug}/tokens.json — invalid JSON: ${e.message}`);
    return { issues: [e.message], warnings: [], tokenCount: 0 };
  }

  return validateTokens(data, slug);
}

function main() {
  const catalogIssues = validateCatalogEnums();
  if (catalogIssues.length > 0) {
    console.error(`FAIL: catalog enum check — ${catalogIssues.length} issue(s):`);
    for (const i of catalogIssues) console.error(`  ✗ ${i}`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const slugs = args.filter(a => a !== '--strict' && a !== '--all');

  if (args.includes('--all')) {
    const templatesDir = resolve(ROOT, 'templates');
    const allSlugs = readdirSync(templatesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    let totalIssues = 0;
    let totalWarnings = 0;
    let validated = 0;

    for (const slug of allSlugs.sort()) {
      const result = validateOne(slug, strict);
      if (!result) continue;

      validated++;
      const { issues, warnings, tokenCount } = result;

      if (issues.length === 0 && warnings.length === 0) {
        console.log(`PASS: ${slug} (${tokenCount} tokens)`);
      } else {
        if (issues.length > 0) {
          console.error(`\nFAIL: ${slug} — ${issues.length} issue(s):`);
          for (const issue of issues) {
            console.error(`  ✗ ${issue}`);
          }
          totalIssues += issues.length;
        }
        if (warnings.length > 0) {
          for (const w of warnings) {
            console.error(`  ⚠ ${w}`);
          }
          totalWarnings += warnings.length;
        }
        if (issues.length === 0 && warnings.length > 0) {
          console.log(`WARN: ${slug} (${tokenCount} tokens, ${warnings.length} warning(s))`);
        }
      }
    }

    console.log(`\n───\nValidated: ${validated} templates`);
    if (totalIssues > 0) {
      console.error(`Issues: ${totalIssues}`);
      process.exit(1);
    }
    if (totalWarnings > 0) {
      console.log(`Warnings: ${totalWarnings}`);
    }
    return;
  }

  if (slugs.length === 0) {
    console.error('Usage: node scripts/validate.mjs <slug> [--strict]');
    console.error('       node scripts/validate.mjs --all');
    process.exit(1);
  }

  for (const slug of slugs) {
    const result = validateOne(slug, strict);
    if (!result) process.exit(0);

    const { issues, warnings, tokenCount } = result;

    if (issues.length > 0) {
      console.error(`\nFAIL: ${slug} — ${issues.length} issue(s):`);
      for (const issue of issues) {
        console.error(`  ✗ ${issue}`);
      }
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.log(`WARN: ${slug} (${tokenCount} tokens)`);
      for (const w of warnings) {
        console.log(`  ⚠ ${w}`);
      }
    } else {
      console.log(`PASS: ${slug} (${tokenCount} tokens)`);
    }
  }
}

main();

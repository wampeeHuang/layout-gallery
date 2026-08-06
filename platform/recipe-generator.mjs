#!/usr/bin/env node

/**
 * recipe-generator.mjs — 批量迁移 legacy templates → 标准化格式
 *
 * 功能:
 *   1. 扫描所有没有 tokens.json 的模板
 *   2. 合并 brand.json + layout.json → tokens.json (DTCG 格式)
 *   3. 生成 recipes.md / components.md / themes.json 初稿
 *
 * 用法:
 *   node platform/recipe-generator.mjs --all          # 批量迁移全部
 *   node platform/recipe-generator.mjs <slug>         # 单模板迁移
 *   node platform/recipe-generator.mjs --dry-run      # 只报告，不写入
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── DTCG 类型推断 ──────────────────────────────────────────────

function inferType(name, value) {
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'color';
  if (/^rgba?\(/.test(value)) return 'color';
  if (/^hsla?\(/.test(value)) return 'color';
  if (/^\d{1,3},\d{1,3},\d{1,3}$/.test(value)) return 'color';  // rgb helper
  if (name.startsWith('--font-')) return 'fontFamily';
  if (/^cubic-bezier\(/.test(value)) return 'cubicBezier';
  if (name.startsWith('--ease-')) {
    if (Array.isArray(value) && value.length === 4 && value.every(n => typeof n === 'number')) return 'cubicBezier';
    return 'raw';
  }
  if (name.startsWith('--dur-') || name.startsWith('--duration')) return 'duration';
  if (name.startsWith('--elevation-') || name.startsWith('--shadow')) return 'shadow';
  if (name.startsWith('--radius-')) return 'dimension';
  if (name.startsWith('--sp-') || name.startsWith('--space-') || name.startsWith('--nav-') || name.startsWith('--gap-') || name.startsWith('--page-') || name.startsWith('--pad-')) return 'dimension';
  if (/^-?\d+(\.\d+)?(px|rem|em|vw|vh|vmin|vmax|%|ch|ex|cm|mm|in|pt|pc)$/.test(value)) return 'dimension';
  if (/^-?\d+(\.\d+)?(ms|s|\.s)$/.test(value)) return 'duration';
  if (/^\d+(\.\d+)?(px|rem|em|vw|vh|vmin|vmax|%|ch)$/.test(value)) return 'dimension';

  return 'raw';
}

// ── 值规范化 ──────────────────────────────────────────────────

function normalizeValue(type, value) {
  if (type === 'cubicBezier' && typeof value === 'string') {
    const m = value.match(/^cubic-bezier\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
    if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  }
  return value;
}

// ── brand.json + layout.json → tokens.json ─────────────────────

function convertBrandJSON(brand) {
  const tokens = brand.tokens || {};
  const result = {};

  for (const [category, items] of Object.entries(tokens)) {
    if (!Array.isArray(items)) continue;
    result[category] = items.map(t => {
      const type = inferType(t.name, t.value);
      return {
        name: t.name,
        $type: type,
        value: normalizeValue(type, t.value),
        role: t.role || category,
      };
    });
  }

  return result;
}

function convertLayoutJSON(layout) {
  const tokens = layout.tokens || {};
  const result = {};

  for (const [category, items] of Object.entries(tokens)) {
    if (!Array.isArray(items)) continue;
    if (category === 'typography' && items.length === 0) continue; // skip empty

    result[category] = items.map(t => {
      const type = inferType(t.name, t.value);
      return {
        name: t.name,
        $type: type,
        value: normalizeValue(type, t.value),
        role: t.role || category,
      };
    });
  }

  // Also convert typeScale — merge into typography, deduplicate by name
  if (layout.typeScale && Array.isArray(layout.typeScale)) {
    const scaleTokens = layout.typeScale.map(t => {
      const type = 'dimension';
      return {
        name: t.name,
        $type: type,
        value: normalizeValue(type, t.value),
        role: t.usage || 'type-scale',
      };
    });
    const existingNames = new Set((result['typography'] || []).map(t => t.name));
    if (!result['typography']) result['typography'] = [];
    for (const t of scaleTokens) {
      if (!existingNames.has(t.name)) {
        result['typography'].push(t);
      }
    }
  }

  return result;
}

function mergeTokens(brandResult, layoutResult) {
  const merged = {};

  for (const [key, tokens] of Object.entries(brandResult)) {
    if (tokens.length > 0) merged[key] = tokens;
  }

  for (const [key, tokens] of Object.entries(layoutResult)) {
    if (tokens.length > 0) {
      // Merge into existing or add new
      if (merged[key]) {
        // Deduplicate by name
        const existingNames = new Set(merged[key].map(t => t.name));
        for (const t of tokens) {
          if (!existingNames.has(t.name)) {
            merged[key].push(t);
          }
        }
      } else {
        merged[key] = tokens;
      }
    }
  }

  // Global dedup: same name across different groups → keep first only
  const seen = new Set();
  for (const [key, tokens] of Object.entries(merged)) {
    merged[key] = tokens.filter(t => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
    if (merged[key].length === 0) delete merged[key];
  }

  return merged;
}

// ── 生成初稿 ───────────────────────────────────────────────────

function generateRecipesMd(slug) {
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `# Recipes · ${name}

AI Agent 用此模板生成幻灯片的操作配方。

## 前置条件

- \`tokens.json\` 已编译到 \`template.html\` 的 \`:root\` 块
- \`runtime/deck-stage.js\` 加载为 Web Component

## 生成流程

### Step 1: 拷贝骨架

从 \`template.html\` 复制 \`<head>\` 完整内容，只替换 \`<title>\`。保留 \`<style>\` 和 \`<canvas class="bg">\` 容器。

### Step 2: 逐页生成 slide

在 \`<deck-stage>\` 内每页一个 \`<section class="slide">\`。参考 \`template.html\` 中已有的 slide 结构作为模板。

### Step 3: 注入 Chrome

底部 chrome（页码 + CTA）由 \`deck-stage.js\` 自动渲染。

## 设计约束

1. 颜色走 \`var(--...)\` — 不硬编码 hex/rgba
2. 间距走 token — 用 \`--sp-N\` 不用裸 px
3. 字体走 \`--font-display\` / \`--font-body\` / \`--font-mono\`
4. 一份 deck 一套主题

## 验证

\`\`\`bash
node platform/validate.mjs ${slug}
\`\`\`
`;
}

function generateThemesJson(slug) {
  return {
    template: slug,
    description: '主题色预设 — 从 tokens.json 派生',
    presets: [
      {
        id: 'default',
        name: '默认',
        emoji: '🎨',
        description: '模板默认配色',
        recommend: ['通用'],
        css: {},
      },
    ],
    rules: [
      '一份 deck 只用一套主题',
    ],
  };
}

function generateComponentsMd(slug) {
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `# Components · ${name}

## 通用布局

| Class | Effect |
|-------|--------|
| \`.slide\` | 全屏 section |
| \`.slide.dark\` | 深色背景 |
| \`.slide.accent\` | 强调色背景 |

## 排版

| Class | Role |
|-------|------|
| \`.hero\` | 主标题 |
| \`.lead\` | 导语 |
| \`.body\` | 正文 |
| \`.caption\` | 说明文字 |

## 具体组件

参考 \`template.html\` 中实际使用的 class。各模板的 class 命名体系可能不同。

---

*本文件为自动生成初稿，人工审阅后修正。*
`;
}

// ── 主入口 ─────────────────────────────────────────────────────

function migrateOne(slug, dryRun = false) {
  const templateDir = resolve(ROOT, 'templates', slug);

  if (!existsSync(templateDir)) {
    console.log(`SKIP ${slug}: directory not found`);
    return false;
  }

  const brandPath = resolve(templateDir, 'brand.json');
  const layoutPath = resolve(templateDir, 'layout.json');
  const tokensPath = resolve(templateDir, 'tokens.json');

  if (existsSync(tokensPath)) {
    console.log(`SKIP ${slug}: tokens.json already exists`);
    return false;
  }

  if (!existsSync(brandPath) || !existsSync(layoutPath)) {
    console.log(`SKIP ${slug}: missing brand.json or layout.json (not yet migrated to v2)`);
    return false;
  }

  const brand = JSON.parse(readFileSync(brandPath, 'utf-8'));
  const layout = JSON.parse(readFileSync(layoutPath, 'utf-8'));

  const brandResult = convertBrandJSON(brand);
  const layoutResult = convertLayoutJSON(layout);
  const mergedTokens = mergeTokens(brandResult, layoutResult);

  const totalTokens = Object.values(mergedTokens).reduce((sum, arr) => sum + arr.length, 0);

  const tokensJson = {
    template: slug,
    version: 1,
    description: `Auto-generated from brand.json + layout.json. Review before publishing.`,
    tokens: mergedTokens,
  };

  if (dryRun) {
    console.log(`DRY-RUN ${slug}: would migrate ${totalTokens} tokens`);
    return true;
  }

  // Write tokens.json
  writeFileSync(tokensPath, JSON.stringify(tokensJson, null, 2), 'utf-8');
  console.log(`  tokens.json: ${totalTokens} tokens`);

  // Write recipes.md (if missing)
  const recipesPath = resolve(templateDir, 'recipes.md');
  if (!existsSync(recipesPath)) {
    writeFileSync(recipesPath, generateRecipesMd(slug), 'utf-8');
    console.log(`  recipes.md: created`);
  }

  // Write themes.json (if missing)
  const themesPath = resolve(templateDir, 'themes.json');
  if (!existsSync(themesPath)) {
    // Check if this template has theme-specific data
    const themesJson = generateThemesJson(slug);
    writeFileSync(themesPath, JSON.stringify(themesJson, null, 2), 'utf-8');
    console.log(`  themes.json: created`);
  }

  // Write components.md (if missing)
  const componentsPath = resolve(templateDir, 'components.md');
  if (!existsSync(componentsPath)) {
    writeFileSync(componentsPath, generateComponentsMd(slug), 'utf-8');
    console.log(`  components.md: created`);
  }

  console.log(`DONE ${slug}: migrated to tokens.json`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (args.includes('--all')) {
    const templatesDir = resolve(ROOT, 'templates');
    const slugs = readdirSync(templatesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('_'))
      .map(d => d.name)
      .sort();

    let migrated = 0;
    let skipped = 0;

    for (const slug of slugs) {
      const result = migrateOne(slug, dryRun);
      if (result) migrated++;
      else skipped++;
    }

    console.log(`\nMigrated: ${migrated}, Skipped: ${skipped}`);
    if (dryRun) console.log('(dry-run mode — no files written)');
    return;
  }

  const slug = args[0];
  if (!slug) {
    console.error('Usage: node platform/recipe-generator.mjs <slug> [--dry-run]');
    console.error('       node platform/recipe-generator.mjs --all [--dry-run]');
    process.exit(1);
  }

  migrateOne(slug, dryRun);
}

main();

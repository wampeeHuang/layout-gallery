const fs = require('fs');
const path = require('path');

const QUALITY_TIERS = ['blocked', 'standard', 'curated'];
const EXPOSURES = ['hidden', 'listed', 'featured'];

function normalizeManifest(input, options = {}) {
  const meta = { ...(input || {}) };
  const slug = meta.slug || options.slug;
  if (!slug) throw new Error('template.json requires slug');

  const taxonomy = {
    templateType: meta.template_type || meta.templateType || 'single-page',
    visualFamily: meta.visual_family || meta.design_style || null,
    contentType: meta.content_type || 'landing',
    scheme: meta.scheme || 'light',
    tone: meta.tone || [],
  };

  const manifest = {
    ...meta,
    $schema: meta.$schema || '../../schemas/template.schema.json',
    version: Number(meta.version || 1),
    slug,
    name: meta.name || slug,
    source: typeof meta.source === 'object' && meta.source
      ? meta.source
      : { kind: 'local', locator: String(meta.source || `templates/${slug}`) },
    license: typeof meta.license === 'object' && meta.license
      ? meta.license
      : { status: 'unverified', spdx: null, attribution: null },
    upstream: meta.upstream || null,
    taxonomy,
    capabilities: {
      brandKit: Boolean(meta.brand_kit_ready || meta.capabilities?.brandKit || options.brandKit),
      responsive: meta.capabilities?.responsive !== false,
      interactive: Boolean(meta.capabilities?.interactive),
      preview: meta.capabilities?.preview || 'html',
    },
    lifecycle: {
      state: meta.lifecycle?.state || 'active',
      qualityTier: meta.lifecycle?.qualityTier || 'blocked',
      exposure: meta.lifecycle?.exposure || 'hidden',
    },
    quality: meta.quality || {
      report: null,
      review: null,
      lastCheckedAt: null,
    },
  };

  if (options.templatePath && !manifest.template_path) manifest.template_path = options.templatePath;
  return manifest;
}

function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  for (const key of ['slug', 'name', 'source', 'license', 'taxonomy', 'capabilities', 'lifecycle']) {
    if (!manifest[key]) errors.push(`missing ${key}`);
  }
  if (manifest.version !== 1) errors.push('version must be 1');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.slug || '')) errors.push('slug must be kebab-case');
  if (!manifest.source?.kind || !manifest.source?.locator) errors.push('source.kind and source.locator are required');
  if (!manifest.taxonomy?.templateType || !manifest.taxonomy?.scheme) errors.push('taxonomy.templateType and taxonomy.scheme are required');
  if (!QUALITY_TIERS.includes(manifest.lifecycle?.qualityTier)) errors.push(`lifecycle.qualityTier must be one of ${QUALITY_TIERS.join(', ')}`);
  if (!EXPOSURES.includes(manifest.lifecycle?.exposure)) errors.push(`lifecycle.exposure must be one of ${EXPOSURES.join(', ')}`);
  return errors;
}

function readManifest(projectDir, templatePath, registryEntry = {}) {
  const templateDir = path.join(projectDir, path.dirname(templatePath));
  const manifestPath = path.join(templateDir, 'template.json');
  if (!fs.existsSync(manifestPath)) return { manifest: normalizeManifest(registryEntry, { templatePath }), source: 'legacy-registry' };
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return { manifest: normalizeManifest({ ...registryEntry, ...raw }, { templatePath }), source: 'template.json', path: manifestPath };
}

module.exports = { QUALITY_TIERS, EXPOSURES, normalizeManifest, validateManifest, readManifest };

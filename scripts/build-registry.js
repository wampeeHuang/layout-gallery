// Build registry.json from 3 template sources
const fs = require('fs');
const path = require('path');

const OLD_INDEX = 'D:/projects/skill-html-showcase/generated/_index.json';
const GUIZANG_META = 'D:/projects/skill-html-showcase/meta/guizang-ppt-skill/';

function loadOldIndex() {
  return JSON.parse(fs.readFileSync(OLD_INDEX, 'utf-8'));
}

function loadGuizangMeta(slug) {
  const p = path.join(GUIZANG_META, `${slug}.json`);
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  return null;
}

// Map Chinese formality/density to English
const FORMALITY_MAP = {
  'low': 'low', '中低': 'medium-low', 'medium-low': 'medium-low',
  'medium': 'medium', '中': 'medium', '半正式': 'medium',
  'medium-high': 'medium-high',
  'high': 'high', '正式': 'high',
};
const DENSITY_MAP = {
  'low': 'low',
  'medium': 'medium', '中': 'medium',
  'medium-high': 'medium-high',
  'high': 'high', '高': 'high', 'dense': 'high', 'sparse': 'low',
};

// Chinese formality/density from _index.json
const RAW_FORMALITY = {
  'industrial-utilitarian': 'formal', 'japanese-zen': 'formal', 'luxury-dark': 'formal',
  'neo-brutalist': 'casual', 'organic-natural': 'neutral', 'retro-futuristic': 'casual',
};
const RAW_DENSITY = {
  'industrial-utilitarian': 'dense', 'japanese-zen': 'sparse', 'luxury-dark': 'sparse',
  'neo-brutalist': 'dense', 'organic-natural': 'sparse', 'retro-futuristic': 'dense',
};

// Guess template_type from structure
function guessType(entry) {
  if (entry.skill === 'guizang-ppt-skill') return 'slide-deck';
  if (entry.skill === 'frontend-design') return 'single-page';
  return 'slide-deck'; // beautiful-html-templates all slide decks
}

// Guess design_style from mood/name
function guessDesignStyle(entry) {
  const name = (entry.name || '').toLowerCase();
  const mood = (entry.mood || []).join(' ').toLowerCase();
  const combined = name + ' ' + mood;

  if (combined.includes('swiss') || combined.includes('瑞士') || combined.includes('grid') || combined.includes('cobalt') || combined.includes('monochrome') || combined.includes('minimal')) return 'swiss-minimal';
  if (combined.includes('editorial') || combined.includes('杂志') || combined.includes('magazine') || combined.includes('broadside') || combined.includes('vellum') || combined.includes('ledger')) return 'editorial';
  if (combined.includes('warm') || combined.includes('温润') || combined.includes('人文') || combined.includes('natural') || combined.includes('organic') || combined.includes('coral') || combined.includes('sakura') || combined.includes('daisy') || combined.includes('grove') || combined.includes('playful') || combined.includes('crafted')) return 'warm-humanist';
  if (combined.includes('cyberpunk') || combined.includes('neon') || combined.includes('tech') || combined.includes('terminal') || combined.includes('retro-tech') || combined.includes('8-bit') || combined.includes('synthwave') || combined.includes('赛博')) return 'tech-cyberpunk';
  if (combined.includes('retro') || combined.includes('vintage') || combined.includes('nostalgic') || combined.includes('zine') || combined.includes('retro-futuristic') || combined.includes('复古')) return 'retro-nostalgic';
  if (combined.includes('bold') || combined.includes('brutalist') || combined.includes('loud') || combined.includes('punk') || combined.includes('大胆') || combined.includes('粗野')) return 'experimental';
  if (combined.includes('institutional') || combined.includes('authoritative') || combined.includes('corporate') || combined.includes('signal')) return 'institutional';
  if (combined.includes('zen') || combined.includes('禅') || combined.includes('japanese') || combined.includes('wabi')) return 'eastern-zen';

  return 'editorial'; // default
}

// Guess aspect_ratio
function guessAspectRatio(entry) {
  if (entry.skill === 'frontend-design') return 'auto';
  return '16:9'; // all slide decks are 16:9
}

// Build features list from best_for/occasion
function guessFeatures(entry) {
  const features = new Set();
  const text = [(entry.best_for || ''), (entry.avoid_for || ''), (entry.occasion || []).join(' '), (entry.tagline || '')].join(' ').toLowerCase();

  if (text.includes('chart') || text.includes('data') || text.includes('数据') || text.includes('stat')) features.add('chart');
  if (text.includes('code') || text.includes('api') || text.includes('developer') || text.includes('dev tool')) features.add('code');
  if (text.includes('table') || text.includes('comparison') || text.includes('对比') || text.includes('matrix')) features.add('table');
  if (text.includes('citation') || text.includes('quote') || text.includes('引用') || text.includes('research') || text.includes('academic')) features.add('citation');

  return [...features];
}

function build() {
  const old = loadOldIndex();
  const registry = [];

  for (const e of old) {
    // Skip non-included sources
    if (!['beautiful-html-templates', 'guizang-ppt-skill', 'frontend-design'].includes(e.skill)) continue;

    // Skip empty placeholders
    if (e.skill === 'beautiful-html-templates' && ['garden-journal', 'warm-signal'].includes(e.slug)) {
      registry.push({
        slug: e.slug,
        skill: e.skill,
        name: e.name || e.slug,
        status: 'placeholder',
        visibility: 'local',
      });
      continue;
    }

    // Merge guizang meta if available
    let meta = e;
    if (e.skill === 'guizang-ppt-skill') {
      const gm = loadGuizangMeta(e.slug);
      if (gm) meta = { ...e, ...gm };
    }

    // Normalize formality
    let formality = meta.formality;
    if (RAW_FORMALITY[e.slug]) formality = RAW_FORMALITY[e.slug];
    formality = FORMALITY_MAP[formality] || formality || 'medium';

    // Normalize density
    let density = meta.density;
    if (RAW_DENSITY[e.slug]) density = RAW_DENSITY[e.slug];
    density = DENSITY_MAP[density] || density || 'medium';

    // Get mood array (handle Chinese strings in frontend-design)
    let mood = meta.mood || [];
    if (typeof mood === 'string') mood = [mood];

    const entry = {
      // Identity
      slug: meta.slug,
      name: meta.name || meta.slug,
      tagline: meta.tagline || '',
      skill: meta.skill,

      // Classification (new)
      template_type: guessType(meta),
      design_style: guessDesignStyle(meta),
      aspect_ratio: guessAspectRatio(meta),

      // Mood & tone (inherited)
      mood,
      occasion: meta.occasion || [],
      tone: meta.tone || [],
      formality,
      density,

      // Visual
      scheme: meta.scheme || 'light',
      palette: (meta.palette || []).map(p => {
        if (typeof p.color === 'object') return p.color; // guizang nested
        return { name: p.name, color: p.color };
      }),
      displayFont: meta.displayFont || '',
      bodyFont: meta.bodyFont || '',
      typography_style: meta.typography_style || '',

      // Usage
      best_for: meta.best_for || '',
      avoid_for: meta.avoid_for || '',
      features: guessFeatures(meta),
      slide_count: meta.slide_count || 0,

      // CSS variable contract (todo: manual analysis)
      css_variables: [],

      // Visibility
      visibility: 'public',

      // File refs
      preview_type: meta.preview_type || 'iframe',
      template_path: `templates/${meta.skill}/${meta.slug}/template.html`,
    };

    registry.push(entry);
  }

  // Sort: beautiful-html-templates first, then guizang, then frontend-design
  const order = { 'beautiful-html-templates': 0, 'guizang-ppt-skill': 1, 'frontend-design': 2 };
  registry.sort((a, b) => (order[a.skill] || 9) - (order[b.skill] || 9) || a.slug.localeCompare(b.slug));

  fs.writeFileSync(
    path.join(__dirname, '..', 'registry.json'),
    JSON.stringify(registry, null, 2),
    'utf-8'
  );

  const counts = {};
  registry.forEach(e => { counts[e.skill] = (counts[e.skill] || 0) + 1; });
  const placeholders = registry.filter(e => e.status === 'placeholder').length;

  console.log(`registry.json built: ${registry.length} entries (${placeholders} placeholders)`);
  console.log(counts);
}

build();

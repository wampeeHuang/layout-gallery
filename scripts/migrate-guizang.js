// One-shot migration: 归藏PPT 两个模板 → 标准变量名
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');

// 标准变量定义（从 token-contract.json 提炼）
const STD_COLOR = ['--accent', '--accent-alt', '--accent-hover', '--bg', '--surface', '--text', '--text-soft', '--line'];
const STD_TYPO = ['--font-display', '--font-body', '--font-mono'];
const STD_SPACING = ['--page-wmax', '--page-pad', '--gap', '--gutter'];
const STD_RADIUS = ['--radius'];
const STD_SHADOW = ['--shadow-sm', '--shadow-md'];
const STD_MOTION = ['--ease-default', '--duration-base'];

function collectNames(tokens) {
  const s = new Set();
  for (const cat of Object.values(tokens)) {
    for (const t of cat) s.add(t.name);
  }
  return s;
}

function addIfMissing(tokens, existingNames, stdNames, defaults) {
  const added = [];
  for (const name of stdNames) {
    if (!existingNames.has(name)) {
      const def = defaults[name] || {};
      tokens.push({ name, value: def.value || '', role: def.role || '', description: def.description || '' });
      existingNames.add(name);
      added.push(name);
    }
  }
  return added;
}

function migrateSwiss(data) {
  const t = data.tokens;
  const names = collectNames(t);

  // Color
  const cr = (data.brandKit && data.brandKit.colorRoles) || {};
  const colorDefaults = {
    '--accent':       { value: cr.primary || '#002FA7', role: 'accent', description: '标准: 主强调色' },
    '--accent-alt':   { value: cr.secondary || '#525252', role: 'accent', description: '标准: 辅强调色' },
    '--accent-hover': { value: '#001F80', role: 'accent', description: '标准: 强调色悬停态' },
    '--bg':           { value: cr.background || '#fafaf8', role: 'surface-bg', description: '标准: 页面底色' },
    '--surface':      { value: cr.surface || '#fafaf8', role: 'surface-card', description: '标准: 卡片背景' },
    '--text':         { value: cr.text || '#0a0a0a', role: 'text-primary', description: '标准: 主文字色' },
    '--text-soft':    { value: cr.textSecondary || '#525252', role: 'text-secondary', description: '标准: 次级文字色' },
    '--line':         { value: cr.border || 'rgba(10,10,10,0.15)', role: 'border', description: '标准: 边框色' },
  };
  const missingColor = addIfMissing(t.color, names, STD_COLOR, colorDefaults);

  // Typography
  const sans = t.typography.find(x => x.name === '--sans');
  const mono = t.typography.find(x => x.name === '--mono');
  const typoDefaults = {
    '--font-display': { value: (sans && sans.value) || 'Inter, sans-serif', role: 'font', description: '标准: 标题字体' },
    '--font-body':    { value: (sans && sans.value) || 'Inter, sans-serif', role: 'font', description: '标准: 正文字体' },
    '--font-mono':    { value: (mono && mono.value) || '"SF Mono", Consolas, monospace', role: 'font', description: '标准: 等宽字体' },
  };
  const missingTypo = addIfMissing(t.typography, names, STD_TYPO, typoDefaults);

  // Spacing
  const spDefaults = {
    '--page-wmax': { value: '1200px', role: 'page-width', description: '标准: 内容最大宽度' },
    '--page-pad':  { value: '32px', role: 'page-pad', description: '标准: 页面水平内边距' },
    '--gap':       { value: '24px', role: 'grid-gap', description: '标准: 元素间距' },
    '--gutter':    { value: '24px', role: 'gutter', description: '标准: 列间距' },
  };
  const missingSp = addIfMissing(t.spacing, names, STD_SPACING, spDefaults);

  // Radius
  const rDefaults = { '--radius': { value: '4px', role: 'radius', description: '标准: 圆角基准值' } };
  addIfMissing(t.radius, names, STD_RADIUS, rDefaults);

  // Shadow
  const shDefaults = {
    '--shadow-sm': { value: '0 1px 3px rgba(0,0,0,0.06)', role: 'shadow', description: '标准: 轻阴影' },
    '--shadow-md': { value: '0 8px 30px rgba(0,0,0,0.1)', role: 'shadow', description: '标准: 中阴影' },
  };
  addIfMissing(t.shadow, names, STD_SHADOW, shDefaults);

  // Motion
  const mDefaults = {
    '--ease-default':  { value: '0.18s ease', role: 'motion', description: '标准: 标准缓动曲线' },
    '--duration-base': { value: '150ms', role: 'motion', description: '标准: 基础过渡时长' },
  };
  addIfMissing(t.motion, names, STD_MOTION, mDefaults);

  // brandKit typeScale (was empty)
  if (!data.brandKit.typeScale || data.brandKit.typeScale.length === 0) {
    data.brandKit.typeScale = [
      { name: 'hero',    size: 'clamp(40px, 7vw, 64px)',   lineHeight: '1.05', usage: '主标题' },
      { name: 'section', size: 'clamp(28px, 4vw, 40px)',    lineHeight: '1.1',  usage: '段落标题' },
      { name: 'lead',    size: 'clamp(18px, 2.5vw, 22px)',  lineHeight: '1.5',  usage: '导语/摘要' },
      { name: 'body',    size: '16px',                       lineHeight: '1.6',  usage: '正文' },
      { name: 'caption', size: '13px',                       lineHeight: '1.4',  usage: '说明/注释' },
    ];
  }

  return { color: missingColor, typography: missingTypo, spacing: missingSp };
}

function migrateTemplate(data) {
  const t = data.tokens;
  const names = collectNames(t);

  // Color
  const cr = (data.brandKit && data.brandKit.colorRoles) || {};
  const colorDefaults = {
    '--accent':       { value: cr.primary || '#333333', role: 'accent', description: '标准: 主强调色' },
    '--accent-alt':   { value: cr.secondary || '#888888', role: 'accent', description: '标准: 辅强调色' },
    '--accent-hover': { value: '#1a1a1a', role: 'accent', description: '标准: 强调色悬停态' },
    '--bg':           { value: cr.background || '#f1efea', role: 'surface-bg', description: '标准: 页面底色 → --paper' },
    '--surface':      { value: cr.surface || '#f1efea', role: 'surface-card', description: '标准: 卡片背景' },
    '--text':         { value: cr.text || '#0a0a0b', role: 'text-primary', description: '标准: 主文字色 → --ink' },
    '--text-soft':    { value: cr.textSecondary || '#18181a', role: 'text-secondary', description: '标准: 次级文字色 → --ink-tint' },
    '--line':         { value: cr.border || 'rgba(10,10,11,0.18)', role: 'border', description: '标准: 边框色' },
  };
  const missingColor = addIfMissing(t.color, names, STD_COLOR, colorDefaults);

  // Typography
  const serif = t.typography.find(x => x.name === '--serif-en') || t.typography.find(x => x.name === '--serif-zh');
  const mono = t.typography.find(x => x.name === '--mono');
  const body = t.typography.find(x => x.name === '--serif-body-en') || t.typography.find(x => x.name === '--sans-zh');
  const typoDefaults = {
    '--font-display': { value: (serif && serif.value) || '"Playfair Display", Georgia, serif', role: 'font', description: '标准: 标题字体' },
    '--font-body':    { value: (body && body.value) || '"Source Serif 4", Georgia, serif', role: 'font', description: '标准: 正文字体' },
    '--font-mono':    { value: (mono && mono.value) || '"IBM Plex Mono", monospace', role: 'font', description: '标准: 等宽字体' },
  };
  const missingTypo = addIfMissing(t.typography, names, STD_TYPO, typoDefaults);

  // Spacing
  const spDefaults = {
    '--page-wmax': { value: '1200px', role: 'page-width', description: '标准: 内容最大宽度' },
    '--page-pad':  { value: '32px', role: 'page-pad', description: '标准: 页面水平内边距' },
    '--gap':       { value: '24px', role: 'grid-gap', description: '标准: 元素间距' },
    '--gutter':    { value: '24px', role: 'gutter', description: '标准: 列间距' },
  };
  const missingSp = addIfMissing(t.spacing, names, STD_SPACING, spDefaults);

  // Radius
  addIfMissing(t.radius, names, STD_RADIUS, { '--radius': { value: '0px', role: 'radius', description: '标准: 圆角基准值' } });

  // Shadow
  addIfMissing(t.shadow, names, STD_SHADOW, {
    '--shadow-sm': { value: '0 1px 3px rgba(0,0,0,0.06)', role: 'shadow', description: '标准: 轻阴影' },
    '--shadow-md': { value: '0 8px 30px rgba(0,0,0,0.1)', role: 'shadow', description: '标准: 中阴影' },
  });

  // Motion
  addIfMissing(t.motion, names, STD_MOTION, {
    '--ease-default':  { value: '0.18s ease', role: 'motion', description: '标准: 标准缓动曲线' },
    '--duration-base': { value: '150ms', role: 'motion', description: '标准: 基础过渡时长' },
  });

  // brandKit completion
  if (!data.brandKit.typeScale || data.brandKit.typeScale.length === 0) {
    data.brandKit.typeScale = [
      { name: 'hero',    size: 'clamp(40px, 7vw, 64px)',   lineHeight: '1.05', usage: '主标题' },
      { name: 'section', size: 'clamp(28px, 4vw, 40px)',    lineHeight: '1.1',  usage: '段落标题' },
      { name: 'lead',    size: 'clamp(18px, 2.5vw, 22px)',  lineHeight: '1.5',  usage: '导语/摘要' },
      { name: 'body',    size: '16px',                       lineHeight: '1.6',  usage: '正文' },
      { name: 'caption', size: '13px',                       lineHeight: '1.4',  usage: '说明/注释' },
    ];
  }
  if (!data.brandKit.spacingScale || data.brandKit.spacingScale.length === 0) {
    data.brandKit.spacingScale = [
      { name: 'xs', value: '4px',  usage: '紧凑间距' },
      { name: 'sm', value: '8px',  usage: '小间距' },
      { name: 'md', value: '16px', usage: '标准间距' },
      { name: 'lg', value: '24px', usage: '区块间距' },
      { name: 'xl', value: '32px', usage: '段落间距' },
    ];
  }

  return { color: missingColor, typography: missingTypo, spacing: missingSp };
}

function main() {
  const targets = [
    { dir: 'templates/guizang-ppt-skill/template-swiss', mig: migrateSwiss },
    { dir: 'templates/guizang-ppt-skill/template', mig: migrateTemplate },
  ];

  for (const { dir, mig } of targets) {
    const p = path.join(PROJECT_DIR, dir, 'tokens.json');
    if (!fs.existsSync(p)) { console.log('SKIP: ' + p); continue; }
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const added = mig(data);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
    console.log(dir);
    console.log('  +color:      ' + (added.color.length > 0 ? added.color.join(', ') : '(none)'));
    console.log('  +typography: ' + (added.typography.length > 0 ? added.typography.join(', ') : '(none)'));
    console.log('  +spacing:    ' + (added.spacing.length > 0 ? added.spacing.join(', ') : '(none)'));
    console.log('  brandKit: typeScale=' + data.brandKit.typeScale.length + ' spacingScale=' + (data.brandKit.spacingScale || []).length);
  }
}

main();

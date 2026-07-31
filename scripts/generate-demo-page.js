// generate-demo-page.js — tokens.json + layout.json → product-matching template.html
// Usage:
//   node scripts/generate-demo-page.js --dir=templates/design-systems/pinterest-gestalt
//   node scripts/generate-demo-page.js --all

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5576c 0%, #ff6f91 100%)',
];

// ═══════════════════════ CSS generation ═══════════════════════

function generateRootCSS(tokens) {
  const lines = [];
  for (const catName of tokens.categories) {
    const items = tokens.tokens[catName];
    if (!items) continue;
    for (const t of items) {
      lines.push(`  ${t.name}:${t.value};`);
    }
  }
  return `:root{\n${lines.join('\n')}\n}`;
}

function generateBaseCSS() {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font-sans);color:var(--text);background:var(--bg);font-size:var(--text-base);line-height:1.5}
.wrap{max-width:var(--page-wmax);margin:0 auto;padding:0 var(--page-pad)}`;
}

// ═══════════════════════ Header ═══════════════════════

function generateHeroCSS(header, tokens) {
  const bg = header.background;
  let bgCSS = '';
  if (bg === 'accent') {
    bgCSS = `background:var(--accent);color:#fff`;
  } else if (bg === 'dark') {
    bgCSS = `background:var(--text);color:#fff`;
  } else if (bg === 'gradient') {
    const accent = tokens.tokens.color.find(c => c.name === '--accent');
    const c = accent ? accent.value : '#E60023';
    bgCSS = `background:linear-gradient(135deg,${c} 0%,color-mix(in srgb,${c} 70%,#000) 50%,color-mix(in srgb,${c} 60%,#000) 100%);color:#fff`;
  }
  return `
.hero{position:relative;${bgCSS};padding:var(--space-3xl) var(--page-pad);text-align:center;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,rgba(255,255,255,0.12) 0%,transparent 60%);pointer-events:none}
.hero .badge{display:inline-block;padding:var(--space-xs) var(--space-md);background:rgba(255,255,255,0.15);border-radius:var(--radius-pill);font-size:var(--text-sm);margin-bottom:var(--space-md);backdrop-filter:blur(8px);position:relative;z-index:1}
.hero h1{font-size:var(--text-3xl);font-weight:var(--weight-bold);margin-bottom:var(--space-sm);position:relative;z-index:1;letter-spacing:-0.02em}
.hero p{font-size:var(--text-lg);opacity:0.85;max-width:640px;margin:0 auto;line-height:1.6;position:relative;z-index:1}`;
}

function generateNavbarCSS() {
  return `
.navbar{display:flex;align-items:center;gap:var(--space-lg);padding:var(--space-md) var(--page-pad);background:var(--text);color:#fff;border-bottom:1px solid rgba(255,255,255,0.08)}
.navbar .logo{font-weight:var(--weight-bold);font-size:var(--text-lg);font-family:var(--font-mono);margin-right:auto}
.navbar a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:var(--text-sm);transition:color var(--duration-fast)}
.navbar a:hover{color:#fff}
.navbar .btn-nav{padding:var(--space-xs) var(--space-lg);border-radius:var(--radius-sm);background:var(--accent);color:#fff;border:none;font-size:var(--text-sm);font-weight:var(--weight-semibold);cursor:pointer;font-family:inherit}`;
}

// ═══════════════════════ Masonry (Pinterest) ═══════════════════════

function generateMasonryCSS(layout, cardTemplate) {
  return `
.masonry{columns:${layout.columns};column-gap:${layout.gap};padding:var(--space-2xl) 0}
.masonry .pin{margin-bottom:${layout.gap};break-inside:avoid;border-radius:${cardTemplate.borderRadius};overflow:hidden;background:var(--bg-card);box-shadow:var(--shadow-sm);transition:transform var(--duration-slow),box-shadow var(--duration-slow);cursor:pointer}
.masonry .pin:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
.masonry .pin .pin-img{width:100%;display:block}
.masonry .pin .pin-body{padding:${cardTemplate.bodyPadding}}
.masonry .pin .pin-title{font-size:var(--text-sm);font-weight:var(--weight-semibold);margin-bottom:2px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.masonry .pin .pin-source{font-size:var(--text-xs);color:var(--text-muted)}
@media(max-width:1200px){.masonry{columns:4}}
@media(max-width:900px){.masonry{columns:3}}
@media(max-width:600px){.masonry{columns:2}}`;
}

function generateMasonryHTML(layout, cardTemplate, sampleData, tokens) {
  const cards = sampleData.map((item, i) => {
    const h = item.height || 200;
    const grad = GRADIENTS[i % GRADIENTS.length];
    return `    <div class="pin">
      <div class="pin-img" style="height:${h}px;background:${grad}"></div>
      <div class="pin-body">
        <div class="pin-title">${item.title}</div>
        <div class="pin-source">${item.source}</div>
      </div>
    </div>`;
  }).join('\n');
  return `<section class="wrap">
  <div class="masonry">
${cards}
  </div>
</section>`;
}

// ═══════════════════════ Shot Grid (Dribbble) ═══════════════════════

function generateShotGridCSS(layout, cardTemplate) {
  return `
.shot-grid{display:grid;grid-template-columns:repeat(${layout.columns},1fr);gap:${layout.gap};padding:var(--space-2xl) 0}
.shot-card{border-radius:${cardTemplate.borderRadius};overflow:hidden;background:var(--bg-card);box-shadow:var(--shadow-sm);transition:transform var(--duration-slow),box-shadow var(--duration-slow);cursor:pointer}
.shot-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
.shot-card .shot-thumb{width:100%;aspect-ratio:4/3;display:block;position:relative;overflow:hidden}
.shot-card .shot-thumb::after{content:'View Shot →';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);color:#fff;font-size:var(--text-sm);font-weight:var(--weight-semibold);opacity:0;transition:opacity var(--duration-base)}
.shot-card:hover .shot-thumb::after{opacity:1}
.shot-card .shot-body{padding:${cardTemplate.bodyPadding}}
.shot-card .shot-title{font-size:var(--text-sm);font-weight:var(--weight-bold);margin-bottom:var(--space-sm);line-height:1.4}
.shot-card .shot-author{display:flex;align-items:center;gap:var(--space-sm)}
.shot-card .shot-avatar{width:24px;height:24px;border-radius:50%;background:var(--text-muted);color:#fff;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xs);font-weight:var(--weight-bold);text-transform:uppercase;flex-shrink:0}
.shot-card .shot-name{font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.shot-card .shot-stats{font-size:var(--text-2xs);color:var(--text-muted);margin-top:2px}
@media(max-width:1000px){.shot-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:700px){.shot-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.shot-grid{grid-template-columns:1fr}}`;
}

function generateShotGridHTML(layout, cardTemplate, sampleData, tokens) {
  const cards = sampleData.map((item, i) => {
    const grad = GRADIENTS[i % GRADIENTS.length];
    return `    <div class="shot-card">
      <div class="shot-thumb" style="background:${grad}"></div>
      <div class="shot-body">
        <div class="shot-title">${item.title}</div>
        <div class="shot-author">
          <div class="shot-avatar">${item.avatar}</div>
          <div>
            <div class="shot-name">${item.author}</div>
            <div class="shot-stats">♥ ${item.likes} · ◎ ${item.views}</div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('\n');
  return `<section class="wrap">
  <div class="shot-grid">
${cards}
  </div>
</section>`;
}

// ═══════════════════════ Dashboard (Geist) ═══════════════════════

function generateDashboardCSS(layout) {
  return `
.dash-wrap{display:flex;min-height:100vh}
.sidebar{width:${layout.sidebarWidth};flex-shrink:0;background:var(--bg-card);border-right:1px solid var(--border);padding:var(--space-lg);display:flex;flex-direction:column;gap:var(--space-xl)}
.sidebar .logo{font-size:var(--text-lg);font-weight:700;font-family:var(--font-mono);letter-spacing:-0.02em;margin-bottom:var(--space-md)}
.sidebar .nav-group-label{font-size:var(--text-2xs);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:var(--space-xs)}
.sidebar .nav-item{padding:var(--space-xs) var(--space-sm);font-size:var(--text-sm);color:var(--text-secondary);border-radius:var(--radius-sm);cursor:pointer;transition:all var(--duration-fast)}
.sidebar .nav-item:hover{background:var(--bg);color:var(--text)}
.sidebar .nav-item.active{background:var(--bg);color:var(--accent);font-weight:var(--weight-semibold)}
.main{padding:var(--space-2xl);overflow-x:auto;flex:1;background:var(--bg)}
.main h2{font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-lg);letter-spacing:-0.02em}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-lg);margin-bottom:var(--space-2xl)}
.metric{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:var(--space-lg)}
.metric .metric-label{font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-xs)}
.metric .metric-value{font-size:var(--text-2xl);font-weight:700;margin-bottom:var(--space-xs);letter-spacing:-0.01em}
.metric .metric-change{font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.metric .metric-change.up{color:var(--success)}
.metric .metric-change.down{color:var(--success)}
.code-block{background:var(--text);color:#fff;border-radius:var(--radius);padding:var(--space-lg);margin-bottom:var(--space-2xl);overflow-x:auto}
.code-block .line{font-family:var(--font-mono);font-size:var(--text-sm);line-height:1.8;white-space:pre}
.code-block .line.dim{opacity:0.5}
.data-table{width:100%;border-collapse:collapse;margin-bottom:var(--space-2xl)}
.data-table th{text-align:left;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border)}
.data-table td{padding:var(--space-sm) var(--space-md);font-size:var(--text-sm);border-bottom:1px solid var(--border)}
.data-table tr:hover td{background:var(--bg-card)}
.status{display:inline-flex;align-items:center;gap:6px;font-weight:var(--weight-semibold)}
.status::before{content:'';width:6px;height:6px;border-radius:50%}
.status.ready{color:var(--success)}.status.ready::before{background:var(--success)}
.status.building{color:var(--warning)}.status.building::before{background:var(--warning)}
.status.failed{color:var(--error)}.status.failed::before{background:var(--error)}
@media(max-width:900px){.sidebar{display:none}.metrics{grid-template-columns:repeat(2,1fr)}}`;
}

function generateDashboardHTML(layout, tokens) {
  const sidebarSections = layout.sidebar.sections.map(sec => {
    const items = sec.items.map((item, i) =>
      `      <div class="nav-item${i === 0 ? ' active' : ''}">${item}</div>`
    ).join('\n');
    return `    <div>
      <div class="nav-group-label">${sec.label}</div>
${items}
    </div>`;
  }).join('\n');

  let mainHTML = '';
  for (const section of layout.mainContent.sections) {
    if (section.type === 'metric-cards') {
      const cards = section.cards.map(c => {
        const trendIcon = c.trend === 'down' && c.label.includes('Build') ? 'down good' : c.trend;
        return `        <div class="metric">
          <div class="metric-label">${c.label}</div>
          <div class="metric-value">${c.value}</div>
          <div class="metric-change ${c.trend === 'down' && c.label.includes('Build') ? 'down' : c.trend}">${c.change}</div>
        </div>`;
      }).join('\n');
      mainHTML += `    <h2>Overview</h2>
    <div class="metrics">
${cards}
    </div>\n`;
    } else if (section.type === 'code-block') {
      const lines = section.lines.map((l, i) =>
        `        <div class="line${l.startsWith('$') ? '' : ' dim'}">${l}</div>`
      ).join('\n');
      mainHTML += `    <div class="code-block">
${lines}
    </div>\n`;
    } else if (section.type === 'table') {
      const header = `        <tr>${section.columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
      const rows = section.rows.map(row => {
        const cells = row.map((cell, ci) => {
          if (ci === 1) {
            const cls = cell.toLowerCase().replace(/[^a-z]/g, '');
            return `<td><span class="status ${cls === 'ready' ? 'ready' : cls === 'building' ? 'building' : 'failed'}">${cell}</span></td>`;
          }
          return `<td>${cell}</td>`;
        }).join('');
        return `        <tr>${cells}</tr>`;
      }).join('\n');
      mainHTML += `    <h2>Recent Deployments</h2>
    <table class="data-table">
${header}
${rows}
    </table>\n`;
    }
  }

  const navLinks = (layout.navLinks || []).map(l => `  <a href="#">${l}</a>`).join('\n');

  return `<nav class="navbar">
  <span class="logo">▲ ${layout.logo || 'Geist'}</span>
${navLinks}
  <button class="btn-nav">Deploy</button>
</nav>
<div class="dash-wrap">
  <aside class="sidebar">
    <div class="logo">▲ ${layout.logo || 'Geist'}</div>
${sidebarSections}
  </aside>
  <main class="main">
${mainHTML}
  </main>
</div>`;
}

// ═══════════════════════ Footer ═══════════════════════

function generateFooterCSS() {
  return `
.foot{text-align:center;padding:var(--space-2xl) var(--page-pad);border-top:1px solid var(--border);color:var(--text-muted);font-size:var(--text-sm)}
.foot a{color:var(--accent);text-decoration:none}`;
}

// ═══════════════════════ Assembly ═══════════════════════

function generateDemoPage(tokens, layout) {
  const cssParts = [generateRootCSS(tokens)];
  cssParts.push(generateBaseCSS());

  let headerHTML = '';
  let contentHTML = '';

  if (layout.pageType === 'masonry-feed') {
    cssParts.push(generateHeroCSS(layout.header, tokens));
    cssParts.push(generateMasonryCSS(layout.content, layout.cardTemplate));
    cssParts.push(generateFooterCSS());

    const badge = layout.header.elements.includes('badge')
      ? `<span class="badge">Pinterest Gestalt · Design Tokens v177</span>\n` : '';
    const title = layout.header.elements.includes('title')
      ? `<h1>Discover Design Inspiration</h1>\n` : '';
    const desc = layout.header.elements.includes('description')
      ? `<p>A masonry feed built with Gestalt design tokens — warm red #E60023 accent, system font stack, 4px spacing base.</p>\n` : '';

    headerHTML = `<div class="hero">
  ${badge}  ${title}  ${desc}</div>`;
    contentHTML = generateMasonryHTML(layout.content, layout.cardTemplate, layout.sampleData, tokens);

  } else if (layout.pageType === 'shot-grid') {
    cssParts.push(generateHeroCSS(layout.header, tokens));
    cssParts.push(generateShotGridCSS(layout.content, layout.cardTemplate));
    cssParts.push(generateFooterCSS());

    const badge = layout.header.elements.includes('badge')
      ? `<span class="badge">Dribbble · Brand Identity</span>\n` : '';
    const title = layout.header.elements.includes('title')
      ? `<h1>Popular Shots This Week</h1>\n` : '';
    const desc = layout.header.elements.includes('description')
      ? `<p>A designer shot feed built with Dribbble's design tokens — classic pink #EA4C89, Inter typeface, large rounded corners, heavy shadows.</p>\n` : '';

    headerHTML = `<div class="hero">
  ${badge}  ${title}  ${desc}</div>`;
    contentHTML = generateShotGridHTML(layout.content, layout.cardTemplate, layout.sampleData, tokens);

  } else if (layout.pageType === 'dashboard') {
    cssParts.push(generateNavbarCSS());
    cssParts.push(generateDashboardCSS(layout.content));

    headerHTML = ''; // navbar is inside dashboard
    contentHTML = generateDashboardHTML(layout, tokens);
  }

  cssParts.push('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${layout.pageType === 'dashboard' ? 'Geist' : tokens.slug} · Design System Demo</title>
<style>
${cssParts.join('\n')}
</style>
</head>
<body>
${headerHTML}
${contentHTML}
<footer class="foot">
  <p>${tokens.source}</p>
  <p style="margin-top:var(--space-xs)">Design tokens from ${tokens.meta ? tokens.meta.source || tokens.source : tokens.source}</p>
</footer>
</body>
</html>`;
}

// ═══════════════════════ Main ═══════════════════════

function processDirectory(dir) {
  const tokensPath = path.join(dir, 'tokens.json');
  const layoutPath = path.join(dir, 'layout.json');
  const htmlPath = path.join(dir, 'template.html');

  if (!fs.existsSync(tokensPath)) {
    console.error('Missing tokens.json: ' + tokensPath);
    return false;
  }
  if (!fs.existsSync(layoutPath)) {
    console.error('Missing layout.json: ' + layoutPath);
    return false;
  }

  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

  const html = generateDemoPage(tokens, layout);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✓ Generated: ' + htmlPath + '  [' + layout.pageType + ']');
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const dirArg = args.find(a => a.startsWith('--dir='));
  const allFlag = args.find(a => a === '--all');

  const DS_DIR = path.join(PROJECT_DIR, 'templates', 'design-systems');

  if (dirArg) {
    const sub = dirArg.replace('--dir=', '');
    const dir = path.isAbsolute(sub) ? sub : path.join(PROJECT_DIR, sub);
    processDirectory(dir);
  } else if (allFlag) {
    const dirs = fs.readdirSync(DS_DIR).map(d => path.join(DS_DIR, d)).filter(d => fs.statSync(d).isDirectory());
    let count = 0;
    for (const dir of dirs) {
      if (processDirectory(dir)) count++;
    }
    console.log('\nDone. ' + count + ' demo pages generated.');
  } else {
    console.log('Usage:');
    console.log('  node scripts/generate-demo-page.js --dir=templates/design-systems/pinterest-gestalt');
    console.log('  node scripts/generate-demo-page.js --all');
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateDemoPage, processDirectory };

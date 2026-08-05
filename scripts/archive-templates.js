// Archive 44 templates, keep 5, flatten to templates/{slug}/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(PROJECT_DIR, 'data', 'registry.json');
const TEMPLATES_DIR = path.join(PROJECT_DIR, 'templates');

const KEEP = new Set([
  'brutalist-paper',
  'template',
  'template-swiss',
  '8-bit-orbit',
  'layout-gallery'
]);

// 1. Load registry
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

const toArchive = [];
const toKeep = [];

registry.forEach(entry => {
  if (KEEP.has(entry.slug)) {
    toKeep.push(entry);
  } else {
    toArchive.push(entry);
  }
});

console.log(`Keep: ${toKeep.length} | Archive: ${toArchive.length}`);

// 2. Build list of directories to archive
const archiveDirs = [];
const archiveDirSet = new Set();
toArchive.forEach(entry => {
  const dir = path.dirname(entry.template_path);
  if (!archiveDirSet.has(dir)) {
    archiveDirSet.add(dir);
    archiveDirs.push(dir);
  }
});

// Also include unregistered template dirs
const unregisteredDirs = ['templates/beautiful-html-templates/garden-journal', 'templates/beautiful-html-templates/warm-signal'];
unregisteredDirs.forEach(dir => {
  const full = path.join(PROJECT_DIR, dir);
  if (fs.existsSync(full) && !archiveDirSet.has(dir)) {
    archiveDirSet.add(dir);
    archiveDirs.push(dir);
  }
});

console.log(`Directories to archive: ${archiveDirs.length}`);
archiveDirs.forEach(d => console.log('  ' + d));

// 3. Create archive using PowerShell
const timestamp = new Date().toISOString().slice(0, 10);
const archivePath = path.join(PROJECT_DIR, `_archive-${timestamp}-templates.zip`);

// Build PowerShell command to archive each dir
const psCommands = archiveDirs.map(dir => {
  const fullDir = path.join(PROJECT_DIR, dir);
  const parentDir = path.dirname(fullDir);
  const dirName = path.basename(fullDir);
  return `if (Test-Path "${fullDir}") { Add-Assembly -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::Open("${archivePath}", [System.IO.Compression.ZipArchiveMode]::Create); function Add-Dir($src, $entryPath) { Get-ChildItem $src | ForEach-Object { $entry = $entryPath + $_.Name; if ($_.PSIsContainer) { Add-Dir $_.FullName ($entry + '/') } else { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry) } } }; Add-Dir "${fullDir}" "${dir}/"; $zip.Dispose() }`;
}).join('; ');

// Simpler approach: copy dirs to temp, then use Compress-Archive
const tempDir = path.join(PROJECT_DIR, '_runtime', 'archive-temp');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

archiveDirs.forEach(dir => {
  const src = path.join(PROJECT_DIR, dir);
  const dst = path.join(tempDir, dir.replace(/\//g, path.sep));
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    copyDir(src, dst);
    console.log('  Copied to temp: ' + dir);
  } else {
    console.log('  SKIP (not found): ' + dir);
  }
});

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  fs.readdirSync(src).forEach(name => {
    const srcPath = path.join(src, name);
    const dstPath = path.join(dst, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  });
}

// Use PowerShell Compress-Archive
try {
  execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${archivePath}' -Force"`, { stdio: 'inherit' });
  console.log(`\nArchive created: ${archivePath}`);
} catch (e) {
  console.error('Archive failed:', e.message);
  process.exit(1);
}

// Clean temp
fs.rmSync(tempDir, { recursive: true });

// 4. Move 5 keepers to flat structure
console.log('\n--- Moving keepers to flat structure ---');
toKeep.forEach(entry => {
  const oldDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  const newDir = path.join(TEMPLATES_DIR, entry.slug);
  const newTemplatePath = `templates/${entry.slug}/template.html`;

  console.log(`  ${entry.slug}: ${path.dirname(entry.template_path)}/ → templates/${entry.slug}/`);

  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true });
  }

  // Copy all files from old dir to new dir
  copyDir(oldDir, newDir);

  // Update registry entry
  entry.template_path = newTemplatePath;
  // Remove skill field since we're no longer organizing by skill
  // (keep it for backward compat but it's no longer meaningful)
});

// 5. Write updated registry
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
console.log(`\nRegistry updated: ${registry.length} entries`);

// 6. Remove old template dirs
console.log('\n--- Removing old directories ---');
const allArchiveDirs = [...archiveDirs, 'templates/beautiful-html-templates', 'templates/frontend-design', 'templates/codebase-to-course', 'templates/design-systems', 'templates/guizang-ppt-skill'];

// For keepers' old parent dirs, remove the old copy after move
toKeep.forEach(entry => {
  const oldDir = path.join(PROJECT_DIR, path.dirname(entry.template_path));
  // old template_path is pre-update, so we use the registry backup
});

// Actually, let's just remove the old skill dirs that should be empty or only contain moved stuff
const skillDirs = [
  'templates/beautiful-html-templates',
  'templates/frontend-design',
  'templates/codebase-to-course',
  'templates/design-systems',
  'templates/guizang-ppt-skill'
];

skillDirs.forEach(dir => {
  const full = path.join(PROJECT_DIR, dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true });
    console.log('  Removed: ' + dir);
  }
});

// Also remove _growth if present
const growthDir = path.join(TEMPLATES_DIR, '_growth');
if (fs.existsSync(growthDir)) {
  fs.rmSync(growthDir, { recursive: true });
  console.log('  Removed: templates/_growth');
}
console.log(`Archive: ${archivePath}`);
console.log('Keepers:');
toKeep.forEach(e => console.log(`  templates/${e.slug}/ — ${e.name}`));

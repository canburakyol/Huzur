import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const featuresRoot = path.join(root, 'src', 'features');

const staticScopes = {
  backend: [
    'functions/index.js',
    'functions/package.json',
    'firestore.rules',
    'firestore.indexes.json',
    'firebase.json',
  ],
  android: [
    'android',
    'capacitor.config.ts',
    'src/services/admobService.js',
    'src/services/prayerScheduleService.js',
    'src/services/revenueCatService.js',
    'src/services/proService.js',
    'src/services/subscriptionSyncService.js',
  ],
  monetization: [
    'src/services/admobService.js',
    'src/services/revenueCatService.js',
    'src/services/proService.js',
    'src/services/subscriptionSyncService.js',
    'functions/index.js',
  ],
  notifications: [
    'src/services/smartNotificationService.js',
    'src/services/reminderService.js',
    'src/services/fcmService.js',
    'src/services/notificationPlatformService.js',
    'android',
  ],
  release: [
    'RELEASE_READINESS_CHECKLIST.md',
    'reports',
    'scripts/checkBundleBudget.mjs',
    'playwright.config.js',
  ],
  localization: [
    'src/i18n.js',
    'public/locales',
    'scripts/i18n-audit.mjs',
    'scripts/sync-translation-keys.mjs',
  ],
};

const normalize = (value) => value.replace(/\\/g, '/');

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function getFeatureScopes() {
  if (!(await exists(featuresRoot))) {
    return [];
  }

  const entries = await fs.readdir(featuresRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function parseImports(source) {
  const results = [];
  const importPattern =
    /import\s*\(\s*(?:\/\*[\s\S]*?\*\/\s*)?['"]([^'"]+)['"]\s*\)|from\s+['"]([^'"]+)['"]/g;

  let match = importPattern.exec(source);
  while (match) {
    const value = match[1] || match[2];
    if (value && !value.startsWith('@')) {
      results.push(value);
    }
    match = importPattern.exec(source);
  }
  return results;
}

async function resolveImport(fromFile, importPath) {
  const base = path.resolve(path.dirname(fromFile), importPath);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.css`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function collectFeatureScope(scope) {
  const indexFile = path.join(featuresRoot, scope, 'index.js');
  if (!(await exists(indexFile))) {
    return null;
  }

  const source = await fs.readFile(indexFile, 'utf8');
  const imports = parseImports(source);
  const files = new Set([indexFile, path.join(featuresRoot, 'index.js')]);

  for (const importPath of imports) {
    const resolved = await resolveImport(indexFile, importPath);
    if (resolved) {
      files.add(resolved);
    }
  }

  const currentFiles = [...files];
  for (const filePath of currentFiles) {
    const ext = path.extname(filePath);
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      const cssFile = filePath.slice(0, -ext.length) + '.css';
      if (await exists(cssFile)) {
        files.add(cssFile);
      }
    }
  }

  return [...files]
    .map((absPath) => normalize(path.relative(root, absPath)))
    .sort();
}

async function collectStaticScope(scope) {
  const paths = staticScopes[scope] || [];
  const found = [];

  for (const relPath of paths) {
    if (await exists(path.join(root, relPath))) {
      found.push(normalize(relPath));
    }
  }

  return found.sort();
}

function printUsage(featureScopes) {
  const allScopes = [...featureScopes, ...Object.keys(staticScopes)].join(', ');
  console.log('Usage: npm run scope:files -- <scope>');
  console.log(`Scopes: ${allScopes}`);
  console.log('Tip: use "list" to print available scopes.');
}

async function main() {
  const scope = process.argv[2];
  const featureScopes = await getFeatureScopes();
  const staticScopeNames = Object.keys(staticScopes);
  const allScopes = [...featureScopes, ...staticScopeNames];

  if (!scope || scope === '--help' || scope === 'help') {
    printUsage(featureScopes);
    process.exitCode = 1;
    return;
  }

  if (scope === 'list') {
    console.log(allScopes.join('\n'));
    return;
  }

  let files = null;

  if (featureScopes.includes(scope)) {
    files = await collectFeatureScope(scope);
  } else if (staticScopeNames.includes(scope)) {
    files = await collectStaticScope(scope);
  }

  if (!files) {
    console.error(`Unknown scope: ${scope}`);
    printUsage(featureScopes);
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.log(`[scope:${scope}] no files found`);
    return;
  }

  console.log(`[scope:${scope}] ${files.length} file/path`);
  files.forEach((filePath, index) => {
    console.log(`${index + 1}. ${filePath}`);
  });
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

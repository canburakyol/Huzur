import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const logger = { error: (...args) => console.error(...args) };

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const featuresRoot = path.join(root, 'src', 'features');
const configPath = path.join(scriptDir, 'scope-map.json');
const registryPath = path.join(scriptDir, 'scope-registry.json');

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

function toAbsolute(relPath) {
  return path.join(root, relPath);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value = '') {
  const withSpaces = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_./\\-]+/g, ' ');
  return normalizeText(withSpaces)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      logger.error('[scope-files] Failed to access path', target, error);
    }
    return false;
  }
}

async function loadScopeConfig() {
  const raw = await fs.readFile(configPath, 'utf8');
  return JSON.parse(raw);
}

async function loadScopeRegistry() {
  const raw = await fs.readFile(registryPath, 'utf8');
  return JSON.parse(raw);
}

export async function getFeatureScopes() {
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
    if (value && value.startsWith('.')) {
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
    path.join(base, 'index.tsx')
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function walkLocalImports(entryFile, files) {
  const queue = [entryFile];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    files.add(current);

    const ext = path.extname(current);
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      continue;
    }

    const cssPeer = current.slice(0, -ext.length) + '.css';
    if (await exists(cssPeer)) {
      files.add(cssPeer);
    }

    const source = await fs.readFile(current, 'utf8');
    const imports = parseImports(source);
    for (const importPath of imports) {
      const resolved = await resolveImport(current, importPath);
      if (resolved && !visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }
}

export async function collectFeatureScope(scope) {
  const indexFile = path.join(featuresRoot, scope, 'index.js');
  if (!(await exists(indexFile))) {
    return null;
  }

  const files = new Set([path.join(featuresRoot, 'index.js')]);
  await walkLocalImports(indexFile, files);

  return [...files]
    .map((absPath) => normalizePath(path.relative(root, absPath)))
    .sort();
}

export async function collectStaticScope(scope, config) {
  const relPaths = config.staticScopes?.[scope] || [];
  const found = [];

  for (const relPath of relPaths) {
    if (await exists(toAbsolute(relPath))) {
      found.push(normalizePath(relPath));
    }
  }

  return found.sort();
}

export async function getAllScopes(config) {
  const featureScopes = await getFeatureScopes();
  return [...featureScopes, ...Object.keys(config.staticScopes || {})];
}

export async function getScopeFiles(scope, config) {
  const featureScopes = await getFeatureScopes();
  if (featureScopes.includes(scope)) {
    return collectFeatureScope(scope);
  }

  if (Object.prototype.hasOwnProperty.call(config.staticScopes || {}, scope)) {
    return collectStaticScope(scope, config);
  }

  return null;
}

function addToMap(map, key, value) {
  if (!key) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, new Set());
  }

  map.get(key).add(value);
}

function extractFileTerms(relPath) {
  const normalizedRel = normalizePath(relPath);
  const segments = normalizedRel.split('/');
  const basename = path.basename(normalizedRel, path.extname(normalizedRel));
  const directoryNames = segments.slice(0, -1);
  const rawTerms = new Set();

  rawTerms.add(normalizeText(basename));
  rawTerms.add(normalizeText(directoryNames.join(' ')));
  rawTerms.add(normalizeText(`${directoryNames.join(' ')} ${basename}`));

  for (const token of tokenize(basename)) {
    rawTerms.add(token);
  }

  for (const directory of directoryNames) {
    const normalizedDirectory = normalizeText(directory);
    if (normalizedDirectory) {
      rawTerms.add(normalizedDirectory);
    }
  }

  return [...rawTerms].filter(Boolean);
}

export async function buildScopeIndex(config) {
  const scopes = await getAllScopes(config);
  const termIndex = new Map();
  const scopeFiles = new Map();

  for (const scope of scopes) {
    const files = await getScopeFiles(scope, config);
    if (!files) {
      continue;
    }

    scopeFiles.set(scope, files);
    addToMap(termIndex, normalizeText(scope), scope);

    for (const relPath of files) {
      for (const term of extractFileTerms(relPath)) {
        addToMap(termIndex, term, scope);
      }
    }
  }

  return { scopes, termIndex, scopeFiles };
}

function createReasonStore() {
  return new Map();
}

function pushReason(reasons, scope, reason) {
  if (!reasons.has(scope)) {
    reasons.set(scope, []);
  }
  reasons.get(scope).push(reason);
}

function scoreMatches(scopes, amount, scores, reasons, reason) {
  for (const scope of scopes) {
    scores.set(scope, (scores.get(scope) || 0) + amount);
    pushReason(reasons, scope, reason);
  }
}

function findAliasMatches(taskText, config) {
  const normalizedTask = ` ${normalizeText(taskText)} `;
  const matches = [];

  for (const [alias, scopeList] of Object.entries(config.aliases || {})) {
    const normalizedAlias = normalizeText(alias);
    if (!normalizedAlias) {
      continue;
    }

    const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalizedAlias)}(?=\\s|$)`);
    if (pattern.test(normalizedTask)) {
      matches.push({ alias, scopes: scopeList });
    }
  }

  return matches;
}

export async function resolveTaskScope(taskInput, config, index) {
  const rawTask = taskInput.trim();
  const explicitMatch = rawTask.match(/(?:^|\s)scope:([a-z0-9_-]+)/i);

  if (explicitMatch) {
    const scope = explicitMatch[1].toLowerCase();
    if (index.scopes.includes(scope)) {
      return {
        status: 'resolved',
        scope,
        method: 'explicit',
        reason: `explicit scope:${scope}`,
        scores: new Map([[scope, 100]])
      };
    }

    return {
      status: 'unknown_explicit',
      requestedScope: scope,
      availableScopes: index.scopes
    };
  }

  const scores = new Map();
  const reasons = createReasonStore();
  const aliasMatches = findAliasMatches(rawTask, config);

  for (const match of aliasMatches) {
    scoreMatches(
      match.scopes,
      match.scopes.length > 1 ? 6 : 10,
      scores,
      reasons,
      `alias:${match.alias}`
    );
  }

  const taskTokens = tokenize(rawTask);
  for (const token of taskTokens) {
    const tokenScopes = index.termIndex.get(token);
    if (tokenScopes?.size) {
      scoreMatches(tokenScopes, 2, scores, reasons, `term:${token}`);
    }
  }

  const normalizedTask = normalizeText(rawTask);
  for (const [term, scopes] of index.termIndex.entries()) {
    if (!term || term.length < 4 || !normalizedTask.includes(term)) {
      continue;
    }

    scoreMatches(scopes, 1, scores, reasons, `phrase:${term}`);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (ranked.length === 0) {
    return {
      status: 'unresolved',
      task: rawTask
    };
  }

  const [topScope, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] ?? -1;

  if (topScore === secondScore) {
    return {
      status: 'ambiguous',
      task: rawTask,
      candidates: ranked
        .filter(([, score]) => score === topScore)
        .map(([scope]) => ({
          scope,
          reasons: reasons.get(scope) || []
        }))
    };
  }

  return {
    status: 'resolved',
    scope: topScope,
    method: aliasMatches.length > 0 ? 'alias' : 'index',
    reason: (reasons.get(topScope) || []).join(', '),
    scores
  };
}

function printUsage(scopes) {
  console.log('Usage:');
  console.log('  npm run scope:files -- list');
  console.log('  npm run scope:files -- <scope>');
  console.log('  npm run scope:files -- resolve "<task>"');
  console.log('  npm run scope:files -- task "<task>"');
  console.log('  npm run scope:files -- info <scope>');
  console.log('  npm run scope:files -- scope:<scope-name> <task>');
  console.log('  npm run scope:doctor');
  console.log('');
  console.log(`Scopes: ${scopes.join(', ')}`);
}

function printScopeFiles(scope, files) {
  if (!files || files.length === 0) {
    console.log(`[scope:${scope}] no files found`);
    return;
  }

  console.log(`[scope:${scope}] ${files.length} file/path`);
  files.forEach((filePath, index) => {
    console.log(`${index + 1}. ${filePath}`);
  });
}

function printResolution(resolution) {
  if (resolution.status === 'resolved') {
    console.log(`[resolve] ${resolution.scope}`);
    console.log(`[reason] ${resolution.reason}`);
    return;
  }

  if (resolution.status === 'unknown_explicit') {
    console.log(`[resolve] unknown explicit scope:${resolution.requestedScope}`);
    console.log(`[scopes] ${resolution.availableScopes.join(', ')}`);
    return;
  }

  if (resolution.status === 'ambiguous') {
    console.log('[resolve] ambiguous');
    resolution.candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.scope} (${candidate.reasons.join(', ')})`);
    });
    return;
  }

  console.log('[resolve] unresolved');
}

async function printTaskScope(taskInput, config, index) {
  const resolution = await resolveTaskScope(taskInput, config, index);
  printResolution(resolution);

  if (resolution.status !== 'resolved') {
    return 1;
  }

  const files = index.scopeFiles.get(resolution.scope) || (await getScopeFiles(resolution.scope, config)) || [];
  printScopeFiles(resolution.scope, files);
  return 0;
}

async function printResolvedScope(taskInput, config, index) {
  const resolution = await resolveTaskScope(taskInput, config, index);
  printResolution(resolution);
  return resolution.status === 'resolved' ? 0 : 1;
}

export async function getScopeInfo(scope) {
  const registry = await loadScopeRegistry();
  return registry?.[scope] || null;
}

function printScopeInfo(scope, info) {
  if (!info) {
    console.log(`[info] no registry entry for ${scope}`);
    return;
  }

  console.log(`[scope] ${scope}`);
  console.log(`[summary] ${info.summary}`);

  if (info.entrypoints?.length) {
    console.log('[entrypoints]');
    info.entrypoints.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  }

  if (info.commonFiles?.length) {
    console.log('[common-files]');
    info.commonFiles.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  }

  if (info.sharedRisks?.length) {
    console.log('[shared-risks]');
    info.sharedRisks.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
  }

  if (info.relatedScopes?.length) {
    console.log(`[related] ${info.relatedScopes.join(', ')}`);
  }
}

export async function runDoctor() {
  const locatorCommand = process.platform === 'win32' ? 'where' : 'which';

  try {
    const { stdout } = await execFileAsync(locatorCommand, ['rg'], { cwd: root });
    const executable = stdout.split(/\r?\n/).find(Boolean)?.trim();

    if (!executable) {
      return {
        rg: 'missing',
        fallback: 'scope-map'
      };
    }

    try {
      const versionResult = await execFileAsync(executable, ['--version'], { cwd: root });
      return {
        rg: 'ok',
        executable,
        version: versionResult.stdout.split(/\r?\n/)[0]?.trim() || 'unknown',
        fallback: 'scope-map'
      };
    } catch (error) {
      return {
        rg: 'blocked',
        executable,
        detail: error?.message || 'rg exists but could not run',
        fallback: 'scope-map'
      };
    }
  } catch (error) {
    return {
      rg: 'missing',
      detail: error?.message || 'rg not found',
      fallback: 'scope-map'
    };
  }
}

async function main() {
  const config = await loadScopeConfig();
  const index = await buildScopeIndex(config);
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === 'help') {
    printUsage(index.scopes);
    process.exitCode = 1;
    return;
  }

  if (command === 'list') {
    console.log(index.scopes.join('\n'));
    return;
  }

  if (command === 'doctor') {
    const doctor = await runDoctor();
    console.log(`[rg] ${doctor.rg}`);
    if (doctor.executable) {
      console.log(`[rg:path] ${doctor.executable}`);
    }
    if (doctor.version) {
      console.log(`[rg:version] ${doctor.version}`);
    }
    if (doctor.detail) {
      console.log(`[rg:detail] ${doctor.detail}`);
    }
    console.log(`[fallback] ${doctor.fallback}`);
    return;
  }

  if (command === 'resolve') {
    process.exitCode = await printResolvedScope(args.slice(1).join(' '), config, index);
    return;
  }

  if (command === 'task') {
    process.exitCode = await printTaskScope(args.slice(1).join(' '), config, index);
    return;
  }

  if (command === 'info') {
    const scope = args[1];
    if (!scope) {
      printUsage(index.scopes);
      process.exitCode = 1;
      return;
    }

    const info = await getScopeInfo(scope);
    printScopeInfo(scope, info);
    process.exitCode = info ? 0 : 1;
    return;
  }

  if (index.scopes.includes(command)) {
    const files = await getScopeFiles(command, config);
    printScopeFiles(command, files);
    return;
  }

  process.exitCode = await printTaskScope(args.join(' '), config, index);
}

const scriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (scriptPath && fileURLToPath(import.meta.url) === scriptPath) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  });
}

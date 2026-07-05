import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const cacheDir = path.join(repoRoot, '.codex', '.cache');
const stampFile = path.join(cacheDir, 'huzur-guard.json');
const minIntervalMs = 90_000;

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  }).status ?? 1;
}

function output(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function listChangedFiles() {
  const diff = output('git', [
    '-c',
    'safe.directory=D:/Projem',
    'diff',
    '--name-only',
    'HEAD',
    '--',
  ]);
  const untracked = output('git', [
    '-c',
    'safe.directory=D:/Projem',
    'ls-files',
    '--others',
    '--exclude-standard',
  ]);

  return [...new Set(`${diff}\n${untracked}`
    .split(/\r?\n/)
    .map((file) => file.trim().replaceAll('\\', '/'))
    .filter(Boolean))];
}

function readStamp() {
  if (!existsSync(stampFile)) return null;

  try {
    return JSON.parse(readFileSync(stampFile, 'utf8'));
  } catch {
    return null;
  }
}

function writeStamp(files) {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(stampFile, JSON.stringify({
    at: Date.now(),
    files,
  }, null, 2));
}

const files = listChangedFiles();

if (files.length === 0) {
  process.exit(0);
}

const previous = readStamp();
const now = Date.now();
const sameFileSet = previous && JSON.stringify(previous.files) === JSON.stringify(files);

if (sameFileSet && now - previous.at < minIntervalMs) {
  console.log('[codex:guard] Skipped; guard ran recently for the same changed files.');
  process.exit(0);
}

writeStamp(files);

const touchesFunctionsIndex = files.includes('functions/index.js');
const touchesLocalization = files.some((file) =>
  file.startsWith('public/locales/')
  || file === 'src/config/i18nConfig.ts'
  || file === 'src/i18n.ts'
  || /^android\/app\/src\/main\/res\/values(?:-[^/]+)?\/strings\.xml$/.test(file)
);
const touchesLintableAppCode = files.some((file) =>
  /^(src|scripts|tests|e2e)\//.test(file)
  && /\.(cjs|mjs|js|jsx|ts|tsx)$/.test(file)
);
const changedLintableFiles = files.filter((file) =>
  /^(src|scripts|tests|e2e)\//.test(file)
  && /\.(cjs|mjs|js|jsx|ts|tsx)$/.test(file)
  && existsSync(path.join(repoRoot, file))
);
const touchesNativeOrCapacitor = files.some((file) =>
  file.startsWith('android/')
  || file === 'capacitor.config.ts'
  || file === 'package.json'
  || file === 'package-lock.json'
);

let failed = false;

if (touchesFunctionsIndex) {
  console.log('[codex:guard] Checking Firebase Functions syntax...');
  failed = run('node', ['-c', 'functions/index.js']) !== 0 || failed;
}

if (touchesLocalization) {
  console.log('[codex:guard] Checking localization parity...');
  failed = run('npm', ['run', 'audit:localization', '--silent']) !== 0 || failed;
}

if (touchesLintableAppCode) {
  console.log('[codex:guard] Running ESLint for changed app/script files...');
  failed = run('npx', ['eslint', '--no-warn-ignored', ...changedLintableFiles]) !== 0 || failed;
}

if (touchesNativeOrCapacitor) {
  console.log('[codex:guard] Native or dependency files changed. Run `npx cap sync android` and `android\\gradlew.bat :app:assembleDebug` before release.');
}

if (!touchesFunctionsIndex && !touchesLocalization && !touchesLintableAppCode && !touchesNativeOrCapacitor) {
  console.log('[codex:guard] No fast Huzur checks matched the current changes.');
}

process.exit(failed ? 1 : 0);

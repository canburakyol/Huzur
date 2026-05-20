import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const localesDir = path.join(rootDir, 'public', 'locales');
const i18nConfigCandidates = [
  path.join(rootDir, 'src', 'config', 'i18nConfig.js'),
  path.join(rootDir, 'src', 'config', 'i18nConfig.ts')
];
const i18nConfigPath = i18nConfigCandidates.find((candidate) => fs.existsSync(candidate)) || i18nConfigCandidates[0];
const reportDir = path.join(rootDir, 'reports');
const reportPath = path.join(reportDir, 'localization-audit-report.md');

const fail = (message) => {
  console.error(`[i18n-audit] ${message}`);
  process.exitCode = 1;
};

const log = (message) => {
  console.log(`[i18n-audit] ${message}`);
};

const readJson = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    fail(`JSON read error: ${path.relative(rootDir, filePath)} -> ${error.message}`);
    return null;
  }
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const flattenObjectKeys = (obj, prefix = '') => {
  if (!isObject(obj)) {
    return [];
  }

  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      const nested = flattenObjectKeys(value, nextKey);
      if (nested.length === 0) {
        keys.push(nextKey);
      } else {
        keys.push(...nested);
      }
      continue;
    }

    keys.push(nextKey);
  }

  return keys;
};

const parseArrayLiteral = (source, exportName) => {
  const regex = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
  const match = source.match(regex);

  if (!match) {
    fail(`'${exportName}' export bulunamadı: ${path.relative(rootDir, i18nConfigPath)}`);
    return [];
  }

  const literal = `[${match[1]}]`;
  const matches = literal.match(/'([^']+)'/g) || [];
  return matches.map((item) => item.slice(1, -1));
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const formatList = (items) => {
  if (items.length === 0) {
    return '—';
  }
  return items.map((item) => `\`${item}\``).join(', ');
};

if (!fs.existsSync(localesDir)) {
  fail(`Locales dizini bulunamadı: ${path.relative(rootDir, localesDir)}`);
}

if (!fs.existsSync(i18nConfigPath)) {
  fail(`i18n config bulunamadı: ${path.relative(rootDir, i18nConfigPath)}`);
}

const configSource = fs.readFileSync(i18nConfigPath, 'utf-8');
const supportedLanguages = parseArrayLiteral(configSource, 'SUPPORTED_LANGUAGE_CODES');
const configuredNamespaces = parseArrayLiteral(configSource, 'I18N_NAMESPACES');

const localeLanguages = fs
  .readdirSync(localesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missingLanguageFolders = supportedLanguages.filter((lang) => !localeLanguages.includes(lang));
const extraLanguageFolders = localeLanguages.filter((lang) => !supportedLanguages.includes(lang));

const namespaceInfoByLanguage = new Map();

for (const language of localeLanguages) {
  const languageDir = path.join(localesDir, language);
  const jsonFiles = fs
    .readdirSync(languageDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name.replace(/\.json$/i, ''))
    .sort();

  namespaceInfoByLanguage.set(language, {
    namespaces: jsonFiles,
    missingConfiguredNamespaces: configuredNamespaces.filter((ns) => !jsonFiles.includes(ns)),
    extraNamespaces: jsonFiles.filter((ns) => !configuredNamespaces.includes(ns))
  });
}

const missingFromAllLanguages = new Set();
const extraFromAnyLanguage = new Set();

for (const info of namespaceInfoByLanguage.values()) {
  info.missingConfiguredNamespaces.forEach((ns) => missingFromAllLanguages.add(ns));
  info.extraNamespaces.forEach((ns) => extraFromAnyLanguage.add(ns));
}

const keyDiffTargets = ['translation', 'tajweed'];
const referenceLanguage = 'tr';
const keyDiffSummary = [];

for (const namespaceName of keyDiffTargets) {
  const referencePath = path.join(localesDir, referenceLanguage, `${namespaceName}.json`);
  const referenceJson = readJson(referencePath);
  if (!referenceJson) {
    continue;
  }

  const referenceKeys = flattenObjectKeys(referenceJson);
  const referenceSet = new Set(referenceKeys);

  for (const language of localeLanguages) {
    const filePath = path.join(localesDir, language, `${namespaceName}.json`);
    if (!fs.existsSync(filePath)) {
      keyDiffSummary.push({
        namespace: namespaceName,
        language,
        missingCount: referenceKeys.length,
        extraCount: 0,
        missingSample: referenceKeys.slice(0, 10),
        extraSample: []
      });
      continue;
    }

    const localeJson = readJson(filePath);
    if (!localeJson) {
      continue;
    }

    const localeKeys = flattenObjectKeys(localeJson);
    const localeSet = new Set(localeKeys);

    const missingKeys = referenceKeys.filter((key) => !localeSet.has(key));
    const extraKeys = localeKeys.filter((key) => !referenceSet.has(key));

    keyDiffSummary.push({
      namespace: namespaceName,
      language,
      missingCount: missingKeys.length,
      extraCount: extraKeys.length,
      missingSample: missingKeys.slice(0, 10),
      extraSample: extraKeys.slice(0, 10)
    });
  }
}

const namespaceMismatch =
  missingLanguageFolders.length > 0 ||
  extraLanguageFolders.length > 0 ||
  missingFromAllLanguages.size > 0 ||
  extraFromAnyLanguage.size > 0;

const keyMismatch = keyDiffSummary.some((row) => row.missingCount > 0 || row.extraCount > 0);

ensureDir(reportDir);

const nowIso = new Date().toISOString();

const reportLines = [];
reportLines.push('# Localization Audit Report');
reportLines.push('');
reportLines.push(`Generated: ${nowIso}`);
reportLines.push('');
reportLines.push('## Scope');
reportLines.push('- Namespace integrity: `src/config/i18nConfig.js` vs `public/locales/*/*.json`');
reportLines.push('- Key diff targets: `translation.json`, `tajweed.json` (reference locale: `tr`)');
reportLines.push('');
reportLines.push('## Language Folder Check');
reportLines.push(`- Supported language codes: ${formatList(supportedLanguages)}`);
reportLines.push(`- Locale folders: ${formatList(localeLanguages)}`);
reportLines.push(`- Missing language folders: ${formatList(missingLanguageFolders)}`);
reportLines.push(`- Extra language folders: ${formatList(extraLanguageFolders)}`);
reportLines.push('');
reportLines.push('## Namespace Integrity');
reportLines.push(`- Configured namespaces: ${formatList(configuredNamespaces)}`);
reportLines.push(`- Missing configured namespaces (any locale): ${formatList([...missingFromAllLanguages])}`);
reportLines.push(`- Extra namespaces on disk (any locale): ${formatList([...extraFromAnyLanguage])}`);
reportLines.push('');
reportLines.push('| Locale | Missing configured namespaces | Extra namespaces on disk |');
reportLines.push('|---|---|---|');
for (const language of localeLanguages) {
  const info = namespaceInfoByLanguage.get(language);
  reportLines.push(`| ${language} | ${formatList(info.missingConfiguredNamespaces)} | ${formatList(info.extraNamespaces)} |`);
}
reportLines.push('');
reportLines.push('## Key Diff Summary');
reportLines.push('| Namespace | Locale | Missing Keys | Extra Keys | Missing Sample | Extra Sample |');
reportLines.push('|---|---|---:|---:|---|---|');
for (const row of keyDiffSummary) {
  reportLines.push(
    `| ${row.namespace} | ${row.language} | ${row.missingCount} | ${row.extraCount} | ${formatList(row.missingSample)} | ${formatList(row.extraSample)} |`
  );
}
reportLines.push('');
reportLines.push('## Result');
reportLines.push(`- Namespace mismatch: ${namespaceMismatch ? 'FAIL' : 'PASS'}`);
reportLines.push(`- Key diff mismatch: ${keyMismatch ? 'FAIL' : 'PASS'}`);

fs.writeFileSync(reportPath, `${reportLines.join('\n')}\n`, 'utf-8');

log(`Audit report yazıldı: ${path.relative(rootDir, reportPath)}`);

if (namespaceMismatch) {
  fail('Namespace mismatch tespit edildi.');
}

if (keyMismatch) {
  fail('Translation/Tajweed key mismatch tespit edildi.');
}

if (!namespaceMismatch && !keyMismatch) {
  log('Localization audit başarılı.');
}


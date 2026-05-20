import fs from 'node:fs';
import path from 'node:path';
import { SUPPORTED_LANGUAGE_CODES } from '../src/config/i18nConfig.js';

const rootDir = process.cwd();
const localesDir = path.join(rootDir, 'public', 'locales');
const reportDir = path.join(rootDir, 'reports');
const reportPath = path.join(reportDir, 'translation-sync-report.md');
const namespaceNames = ['translation', 'tajweed'];

const fallbackPriority = ['en', 'tr', ...SUPPORTED_LANGUAGE_CODES];

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const flattenLeaves = (obj, prefix = '', output = new Map()) => {
  if (!isPlainObject(obj)) {
    return output;
  }

  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      flattenLeaves(value, nextKey, output);
    } else {
      output.set(nextKey, value);
    }
  }

  return output;
};

const setByPath = (obj, dottedPath, value) => {
  const parts = dottedPath.split('.');
  const last = parts.pop();
  let current = obj;

  for (const part of parts) {
    if (!isPlainObject(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }

  current[last] = value;
};

const cloneValue = (value) => {
  if (isPlainObject(value) || Array.isArray(value)) {
    return JSON.parse(JSON.stringify(value));
  }
  return value;
};

const readJson = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const syncNamespace = (namespaceName) => {
  const jsonByLanguage = {};
  const flatByLanguage = {};

  for (const languageCode of SUPPORTED_LANGUAGE_CODES) {
    const filePath = path.join(localesDir, languageCode, `${namespaceName}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`[translation-sync] Missing namespace file: ${path.relative(rootDir, filePath)}`);
      process.exit(1);
    }

    const jsonData = readJson(filePath);
    jsonByLanguage[languageCode] = jsonData;
    flatByLanguage[languageCode] = flattenLeaves(jsonData);
  }

  const unionKeys = new Set();
  for (const languageCode of SUPPORTED_LANGUAGE_CODES) {
    for (const key of flatByLanguage[languageCode].keys()) {
      unionKeys.add(key);
    }
  }

  const rows = [];

  for (const languageCode of SUPPORTED_LANGUAGE_CODES) {
    const localeJson = jsonByLanguage[languageCode];
    const localeFlat = flatByLanguage[languageCode];

    let inserted = 0;
    const insertedSamples = [];

    for (const key of unionKeys) {
      if (localeFlat.has(key)) {
        continue;
      }

      const donorLanguage = fallbackPriority.find((candidate) => flatByLanguage[candidate]?.has(key));
      if (!donorLanguage) {
        continue;
      }

      const donorValue = flatByLanguage[donorLanguage].get(key);
      setByPath(localeJson, key, cloneValue(donorValue));
      localeFlat.set(key, donorValue);
      inserted += 1;

      if (insertedSamples.length < 12) {
        insertedSamples.push(`${key} <= ${donorLanguage}`);
      }
    }

    const filePath = path.join(localesDir, languageCode, `${namespaceName}.json`);
    writeJson(filePath, localeJson);

    rows.push({
      namespaceName,
      languageCode,
      inserted,
      finalKeys: localeFlat.size,
      sample: insertedSamples
    });
  }

  return rows;
};

if (!fs.existsSync(localesDir)) {
  console.error(`[translation-sync] Locales directory not found: ${localesDir}`);
  process.exit(1);
}

const reportRows = namespaceNames.flatMap(syncNamespace);

ensureDir(reportDir);

const nowIso = new Date().toISOString();
const reportLines = [
  '# Translation Sync Report',
  '',
  `Generated: ${nowIso}`,
  '',
  '## Scope',
  `- Namespaces: ${namespaceNames.map((name) => `\`${name}\``).join(', ')}`,
  '- Strategy: Union key set across supported locales, fill missing keys with fallback donor order (`en` -> `tr` -> first available locale).',
  '',
  '| Namespace | Locale | Inserted Keys | Final Leaf Key Count | Sample |',
  '|---|---|---:|---:|---|',
  ...reportRows.map((row) => `| ${row.namespaceName} | ${row.languageCode} | ${row.inserted} | ${row.finalKeys} | ${row.sample.length ? row.sample.map((item) => `\`${item}\``).join(', ') : '-' } |`),
  ''
];

fs.writeFileSync(reportPath, `${reportLines.join('\n')}\n`, 'utf-8');

console.log(`[translation-sync] Sync complete. Report: ${path.relative(rootDir, reportPath)}`);

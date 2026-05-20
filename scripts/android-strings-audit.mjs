import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const reportDir = path.join(rootDir, 'reports');
const reportPath = path.join(reportDir, 'android-strings-audit-report.md');

const localeMap = {
  en: 'values',
  tr: 'values-tr',
  id: 'values-id',
  de: 'values-de'
};

const fail = (message) => {
  console.error(`[android-strings-audit] ${message}`);
  process.exitCode = 1;
};

const log = (message) => {
  console.log(`[android-strings-audit] ${message}`);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const parseStringsXml = (xmlContent) => {
  const regex = /<string\s+name="([^"]+)"(?:\s+translatable="([^"]+)")?>([\s\S]*?)<\/string>/g;
  const entries = [];
  let match = null;

  while ((match = regex.exec(xmlContent)) !== null) {
    const [, key, translatable, rawValue] = match;
    entries.push({
      key,
      translatable: translatable ?? null,
      value: rawValue.trim()
    });
  }

  return entries;
};

const formatList = (items) => (items.length ? items.map((item) => `\`${item}\``).join(', ') : '—');

if (!fs.existsSync(resDir)) {
  fail(`Android res dizini bulunamadı: ${path.relative(rootDir, resDir)}`);
}

const defaultPath = path.join(resDir, 'values', 'strings.xml');
if (!fs.existsSync(defaultPath)) {
  fail(`Referans strings.xml bulunamadı: ${path.relative(rootDir, defaultPath)}`);
}

const defaultEntries = parseStringsXml(fs.readFileSync(defaultPath, 'utf-8'));
const defaultKeys = defaultEntries.map((entry) => entry.key);
const defaultKeySet = new Set(defaultKeys);

const defaultTranslatableMap = new Map(
  defaultEntries.map((entry) => [entry.key, entry.translatable])
);

const results = [];

for (const [locale, folderName] of Object.entries(localeMap)) {
  const filePath = path.join(resDir, folderName, 'strings.xml');
  if (!fs.existsSync(filePath)) {
    results.push({
      locale,
      folderName,
      exists: false,
      missingKeys: defaultKeys,
      extraKeys: [],
      translatableMismatchKeys: []
    });
    continue;
  }

  const entries = parseStringsXml(fs.readFileSync(filePath, 'utf-8'));
  const keySet = new Set(entries.map((entry) => entry.key));

  const missingKeys = defaultKeys.filter((key) => !keySet.has(key));
  const extraKeys = [...keySet].filter((key) => !defaultKeySet.has(key));

  const translatableMismatchKeys = entries
    .filter((entry) => defaultKeySet.has(entry.key))
    .filter((entry) => {
      const defaultTranslatable = defaultTranslatableMap.get(entry.key) ?? null;
      return defaultTranslatable !== (entry.translatable ?? null);
    })
    .map((entry) => entry.key);

  results.push({
    locale,
    folderName,
    exists: true,
    missingKeys,
    extraKeys,
    translatableMismatchKeys
  });
}

const hasMismatch = results.some(
  (row) => !row.exists || row.missingKeys.length > 0 || row.extraKeys.length > 0 || row.translatableMismatchKeys.length > 0
);

ensureDir(reportDir);

const nowIso = new Date().toISOString();
const lines = [];

lines.push('# Android Strings Audit Report');
lines.push('');
lines.push(`Generated: ${nowIso}`);
lines.push('');
lines.push('## Scope');
lines.push('- Reference: `android/app/src/main/res/values/strings.xml`');
lines.push('- Compared locales: `tr`, `id`, `de` (+ `en` reference mapping)');
lines.push('');
lines.push('## Reference Keys');
lines.push(`- Total keys: ${defaultKeys.length}`);
lines.push(`- Keys: ${formatList(defaultKeys)}`);
lines.push('');
lines.push('| Locale | Folder | File Exists | Missing Keys | Extra Keys | translatable Mismatch |');
lines.push('|---|---|---|---|---|---|');

for (const row of results) {
  lines.push(
    `| ${row.locale} | ${row.folderName} | ${row.exists ? 'yes' : 'no'} | ${formatList(row.missingKeys)} | ${formatList(row.extraKeys)} | ${formatList(row.translatableMismatchKeys)} |`
  );
}

lines.push('');
lines.push('## Result');
lines.push(`- Android strings consistency: ${hasMismatch ? 'FAIL' : 'PASS'}`);

fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf-8');
log(`Audit report yazıldı: ${path.relative(rootDir, reportPath)}`);

if (hasMismatch) {
  fail('Android strings mismatch tespit edildi.');
} else {
  log('Android strings audit başarılı.');
}


const fs = require('fs');
const path = require('path');
const glob = require('glob'); // I hope glob is available, if not I'll use recursive readdir

// Polyfill for glob if not available (simplified)
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const srcDir = path.join(__dirname, 'src');
const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['tr', 'en', 'ar'];
const namespaces = fs.readdirSync(path.join(localesDir, 'tr')).map(f => f.replace('.json', ''));

console.log('Namespaces:', namespaces);

// 1. Load all JSONs
const localeData = {};
languages.forEach(lang => {
  localeData[lang] = {};
  namespaces.forEach(ns => {
    const filePath = path.join(localesDir, lang, `${ns}.json`);
    if (fs.existsSync(filePath)) {
      try {
        localeData[lang][ns] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error(`Error parsing ${filePath}:`, e.message);
      }
    } else {
      console.warn(`Missing file: ${filePath}`);
      localeData[lang][ns] = {};
    }
  });
});

// Helper to check if key exists in object
function getValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

// 2. Scan Code
const sourceFiles = getAllFiles(srcDir).filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
const usedKeys = new Set();
const rawKeys = []; // Keys that look like variables or constructed keys

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Regex for t('key') or t("key")
  // Also handle t(`key`)
  const regex = /\bt\(['"`]([^'"`]+)['"`]\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
  
  // Check for specific pattern mentioned in prompt: prayerBook.items.X.meaning
  // This might be constructed dynamically like `prayerBook.items.${id}.meaning`
  // We look for usage of such patterns.
  if (content.includes('prayerBook.items')) {
      // console.log(`Potential dynamic key in ${file}: prayerBook.items`);
  }
});

console.log(`Found ${usedKeys.size} unique static keys used in code.`);

// 3. Verify Keys
const missingKeys = {}; // { lang: { key: [namespaces] } }

languages.forEach(lang => {
  missingKeys[lang] = [];
  usedKeys.forEach(key => {
    let found = false;
    let targetNs = 'translation'; // Default
    let keyPath = key;

    if (key.includes(':')) {
      const parts = key.split(':');
      targetNs = parts[0];
      keyPath = parts.slice(1).join('.');
    }

    // Check in the specific namespace
    if (localeData[lang][targetNs] && getValue(localeData[lang][targetNs], keyPath) !== undefined) {
      found = true;
    } else {
        // Fallback: Check all namespaces if no namespace specified
        if (!key.includes(':')) {
            for (const ns of namespaces) {
                if (getValue(localeData[lang][ns], key) !== undefined) {
                    found = true;
                    break;
                }
            }
        }
    }

    if (!found) {
      missingKeys[lang].push(key);
    }
  });
});

// 4. Report Missing
console.log('\n--- Missing Keys Report ---');
languages.forEach(lang => {
  if (missingKeys[lang].length > 0) {
    console.log(`\nLanguage: ${lang} (${missingKeys[lang].length} missing)`);
    missingKeys[lang].slice(0, 20).forEach(k => console.log(`  - ${k}`));
    if (missingKeys[lang].length > 20) console.log('  ...');
  } else {
    console.log(`\nLanguage: ${lang} - OK`);
  }
});

// 5. Check for Empty Values
console.log('\n--- Empty Values Report ---');
languages.forEach(lang => {
  namespaces.forEach(ns => {
    const checkEmpty = (obj, prefix) => {
      for (const k in obj) {
        const val = obj[k];
        const currentPath = prefix ? `${prefix}.${k}` : k;
        if (typeof val === 'string' && val.trim() === '') {
          console.log(`[${lang}][${ns}] Empty value for: ${currentPath}`);
        } else if (typeof val === 'object' && val !== null) {
          checkEmpty(val, currentPath);
        }
      }
    };
    checkEmpty(localeData[lang][ns], '');
  });
});

// 6. Check for specific prayerBook items issue
// The user mentioned "prayerBook.items.X.meaning".
// This implies there are keys like "prayerBook.items.11.meaning" that are missing.
// We need to check if "prayerBook" namespace or key exists and has items.
console.log('\n--- PrayerBook Items Check ---');
languages.forEach(lang => {
    // Assuming it might be in 'prayers.json' or 'translation.json'
    const prayerBook = localeData[lang]['prayers']?.prayerBook || localeData[lang]['translation']?.prayerBook;
    if (prayerBook && prayerBook.items) {
        // console.log(`[${lang}] prayerBook.items found with ${Object.keys(prayerBook.items).length} items.`);
    } else {
        console.log(`[${lang}] prayerBook.items NOT found.`);
    }
});

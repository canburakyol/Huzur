const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['tr', 'en', 'ar'];
const namespaces = ['translation', 'prayers', 'surahs', 'tajweed', 'wordByWord', 'esma', 'hadiths', 'legal', 'multimedia', 'prayerTeacher', 'tespihat'];

// Helper to get value from object by path
function getValue(obj, pathArr) {
  let current = obj;
  for (const key of pathArr) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}

// Helper to set value
function setValue(obj, pathArr, value) {
  let current = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[pathArr[pathArr.length - 1]] = value;
}

// Load TR data for reference
const trData = {};
namespaces.forEach(ns => {
  const filePath = path.join(localesDir, 'tr', `${ns}.json`);
  if (fs.existsSync(filePath)) {
    trData[ns] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    trData[ns] = {};
  }
});

languages.forEach(lang => {
  namespaces.forEach(ns => {
    const filePath = path.join(localesDir, lang, `${ns}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        let modified = false;

        const traverse = (obj, pathArr) => {
          for (const key in obj) {
            const val = obj[key];
            const currentPath = [...pathArr, key];
            
            if (typeof val === 'string') {
              if (val.trim() === '') {
                // Found empty string
                // Look up in TR
                const trVal = getValue(trData[ns], currentPath);
                let newVal = '-';
                if (trVal && typeof trVal === 'string' && trVal.trim() !== '') {
                  newVal = trVal; // Fallback to TR
                }
                
                // Update
                obj[key] = newVal;
                modified = true;
                console.log(`[${lang}][${ns}] Filled empty key: ${currentPath.join('.')} with "${newVal}"`);
              }
            } else if (typeof val === 'object' && val !== null) {
              traverse(val, currentPath);
            }
          }
        };

        traverse(data, []);

        if (modified) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }
      } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
      }
    }
  });
});

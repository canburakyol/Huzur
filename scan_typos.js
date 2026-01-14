const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, fileList);
        } else if (/\.(js|jsx)$/.test(file)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const files = walk('src');
const suspicious = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    const regex = /t\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        if (key.includes('..') || key.includes('prayerbok') || key.includes('categoris')) {
            suspicious.push({ file, key, line: content.substring(0, match.index).split('\n').length });
        }
    }
    
    if (content.indexOf('prayerbok') !== -1 || content.indexOf('categoris') !== -1) {
         if (!suspicious.some(s => s.file === file && s.key === 'TYPO_IN_FILE')) {
             suspicious.push({ file, key: 'TYPO_IN_FILE', line: 0 });
         }
    }
});

console.log('--- Suspicious Keys ---');
if (suspicious.length === 0) {
    console.log('No suspicious keys found.');
} else {
    suspicious.forEach(item => {
        console.log(`${item.file}:${item.line} -> ${item.key}`);
    });
}

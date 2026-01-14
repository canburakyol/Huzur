const fs = require('fs');
const path = require('path');

const trPath = 'public/locales/tr/translation.json';

try {
    const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
    const emptyKeys = [];

    function findEmpty(obj, prefix = '') {
        for (let key in obj) {
            const currentPath = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                findEmpty(obj[key], currentPath);
            } else if (typeof obj[key] === 'string') {
                if (obj[key].trim() === '') {
                    emptyKeys.push(currentPath);
                }
            }
        }
    }

    findEmpty(tr);

    console.log('--- Empty Values in TR JSON ---');
    if (emptyKeys.length === 0) {
        console.log('No empty values found.');
    } else {
        emptyKeys.forEach(k => console.log(k));
    }

} catch (e) {
    console.error('Error:', e.message);
}

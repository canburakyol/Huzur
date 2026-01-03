const fs = require('fs');
const prayers = require('./prayers_backup.cjs');

const items = {};
prayers.forEach(p => {
    items[p.id] = {
        title: p.title,
        meaning: p.meaning
    };
});

fs.writeFileSync('translations_output_utf8.json', JSON.stringify(items, null, 2), 'utf8');
console.log('Done');

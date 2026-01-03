const fs = require('fs');
const path = 'd:/Projem/src/data/prayers.js';

try {
    let content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        // Regex to match the prayer object structure
        // Handles escaped quotes in title and meaning
        const match = line.match(/^\s*\{ id: (\d+), category: '([^']+)', title: '((?:[^'\\]|\\.)*)', (.*?), meaning: '((?:[^'\\]|\\.)*)' \},?/);
        if (match) {
            const id = match[1];
            const category = match[2];
            const middle = match[4];
            // Replace title and meaning with translation keys
            return `    { id: ${id}, category: '${category}', title: 'prayerBook.items.${id}.title', ${middle}, meaning: 'prayerBook.items.${id}.meaning' },`;
        }
        return line;
    });

    fs.writeFileSync(path, newLines.join('\n'), 'utf8');
    console.log('Updated prayers.js successfully');
} catch (err) {
    console.error('Error updating prayers.js:', err);
}

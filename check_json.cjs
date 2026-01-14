const fs = require('fs');
const path = require('path');

function checkJson(dir) {
    const files = fs.readdirSync(dir);
    let hasError = false;
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (checkJson(filePath)) hasError = true;
        } else if (file.endsWith('.json')) {
            try {
                JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`OK: ${filePath}`);
            } catch (e) {
                console.error(`ERROR: ${filePath} - ${e.message}`);
                hasError = true;
            }
        }
    });
    return hasError;
}

if (checkJson('public/locales')) {
    process.exit(1);
} else {
    console.log('All JSON files are valid.');
}

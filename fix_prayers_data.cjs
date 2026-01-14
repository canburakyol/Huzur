const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'prayers.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace 'prayerBook. with 'prayers:prayerBook.
  // We use a regex that matches 'prayerBook. but not preceded by prayers:
  // Since lookbehind support varies, we can just replace all and then fix double prefixes if any, 
  // or use a callback.
  
  const regex = /'prayerBook\./g;
  let count = 0;
  const newContent = content.replace(regex, (match, offset, string) => {
    // Check if preceded by prayers:
    if (offset >= 8 && string.substring(offset - 8, offset) === 'prayers:') {
      return match; // Already prefixed
    }
    count++;
    return "'prayers:prayerBook.";
  });

  if (count > 0) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${count} keys in src/data/prayers.js`);
  } else {
    console.log('No keys needed updating in src/data/prayers.js');
  }
} else {
  console.error('src/data/prayers.js not found');
}

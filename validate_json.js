
import fs from 'fs';

try {
  const tr = fs.readFileSync('./public/locales/tr/translation.json', 'utf8');
  JSON.parse(tr);
  console.log('TR JSON is valid');
} catch (e) {
  console.error('TR JSON error:', e.message);
}

try {
  const en = fs.readFileSync('./public/locales/en/translation.json', 'utf8');
  JSON.parse(en);
  console.log('EN JSON is valid');
} catch (e) {
  console.error('EN JSON error:', e.message);
}

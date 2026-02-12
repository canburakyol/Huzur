import fs from 'fs';
import path from 'path';

const target = path.join(process.cwd(), 'nul');

try {
  if (fs.existsSync(target)) {
    console.log(`Found ${target}. Attempting removal...`);
    fs.rmSync(target, { recursive: true, force: true });
    console.log('Successfully removed.');
  } else {
    console.log('Target "nul" not found by fs.existsSync.');
  }
} catch (err) {
  console.error('Error removing "nul":', err);
}

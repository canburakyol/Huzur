import fs from 'node:fs/promises';
import path from 'node:path';
import { DIRS } from './config.js';

export async function loadApprovedContent(category) {
  const files = (await fs.readdir(DIRS.contentBank)).filter((name) => name.endsWith('.json'));
  const records = [];
  for (const file of files) {
    const data = JSON.parse(await fs.readFile(path.join(DIRS.contentBank, file), 'utf8'));
    for (const item of Array.isArray(data) ? data : [data]) {
      if (item.approved === true && (item.category === category || item.category === 'general')) records.push(item);
    }
  }
  return records;
}

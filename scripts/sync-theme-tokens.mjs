import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const cssPath = path.join(root, 'src', 'styles', 'variables.css');
const lightPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');
const darkPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values-night', 'colors.xml');

const css = await readFile(cssPath, 'utf8');
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
const darkBlock = css.match(/\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

const readToken = (block, name) => {
  const value = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1];
  if (!value) throw new Error(`Missing concrete --${name} token in variables.css`);
  return value.toUpperCase();
};

const buildColors = (block, dark = false) => {
  const primary = readToken(block, 'primary');
  const secondary = readToken(block, 'secondary');
  const surface = readToken(block, 'surface-page');
  const card = readToken(block, 'surface-container-lowest');
  const text = readToken(block, 'on-surface');
  const muted = readToken(block, 'on-surface-variant');
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Generated from src/styles/variables.css by scripts/sync-theme-tokens.mjs. -->
    <color name="colorPrimary">${primary}</color>
    <color name="colorPrimaryDark">${dark ? surface : primary}</color>
    <color name="colorAccent">${secondary}</color>
    <color name="splash_background">${surface}</color>
    <color name="system_bar_background">${surface}</color>
    <color name="widget_background">${card}</color>
    <color name="widget_text_primary">${text}</color>
    <color name="widget_text_secondary">${muted}</color>
    <color name="widget_accent">${secondary}</color>
</resources>
`;
};

const outputs = [[lightPath, buildColors(rootBlock)], [darkPath, buildColors(darkBlock, true)]];
const check = process.argv.includes('--check');

for (const [file, expected] of outputs) {
  if (check) {
    const actual = await readFile(file, 'utf8');
    if (actual.replace(/\r\n/g, '\n') !== expected) {
      throw new Error(`${path.relative(root, file)} is out of sync; run npm run theme:sync`);
    }
  } else {
    await writeFile(file, expected, 'utf8');
  }
}

console.log(check ? 'Theme resources are in sync.' : 'Android theme resources generated.');

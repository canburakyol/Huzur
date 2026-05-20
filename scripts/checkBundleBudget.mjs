import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

const KB = 1024;

const BUDGETS = {
  indexJsMaxKb: 270, // raw size soft cap for app shell bundle
  vendorFirebaseMaxKb: 360,
  vendorLottieMaxKb: 330,
  vendorReactMaxKb: 210,
  vendorHtml2canvasMaxKb: 220,
  vendorMapsMaxKb: 170,
  vendorCapacitorMaxKb: 150,
  vendorI18nMaxKb: 120
};

function getFiles(dir) {
  return readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile());
}

function findLargestByPrefix(files, prefix, { extension = '.js' } = {}) {
  const matched = files.filter(
    (name) => name.startsWith(prefix) && name.endsWith(extension)
  );
  if (matched.length === 0) return null;

  return matched
    .map((name) => ({ name, size: statSync(join(DIST_ASSETS_DIR, name)).size }))
    .sort((a, b) => b.size - a.size)[0];
}

function kb(bytes) {
  return Number((bytes / KB).toFixed(2));
}

function assertUnder(label, fileInfo, maxKb, { optional = false } = {}) {
  if (!fileInfo) {
    if (optional) {
      console.log(`[Budget] ${label}: chunk not found (optional, skipped)`);
      return;
    }

    throw new Error(`[Budget] ${label} not found`);
  }

  const sizeKb = kb(fileInfo.size);
  console.log(`[Budget] ${label}: ${fileInfo.name} => ${sizeKb} kB (max ${maxKb} kB)`);

  if (sizeKb > maxKb) {
    throw new Error(`[BudgetExceeded] ${label} ${sizeKb} kB > ${maxKb} kB`);
  }
}

function run() {
  const files = getFiles(DIST_ASSETS_DIR);

  const indexJs = findLargestByPrefix(files, 'index-');
  const vendorFirebase = findLargestByPrefix(files, 'vendor-firebase-');
  const vendorLottie = findLargestByPrefix(files, 'vendor-lottie-');
  const vendorReact = findLargestByPrefix(files, 'vendor-react-');
  const vendorHtml2canvas = findLargestByPrefix(files, 'vendor-html2canvas-');
  const vendorMaps = findLargestByPrefix(files, 'vendor-maps-');
  const vendorCapacitor = findLargestByPrefix(files, 'vendor-capacitor-');
  const vendorI18n = findLargestByPrefix(files, 'vendor-i18n-');

  assertUnder('index bundle', indexJs, BUDGETS.indexJsMaxKb);
  assertUnder('vendor-firebase', vendorFirebase, BUDGETS.vendorFirebaseMaxKb);
  assertUnder('vendor-lottie', vendorLottie, BUDGETS.vendorLottieMaxKb, { optional: true });
  assertUnder('vendor-react', vendorReact, BUDGETS.vendorReactMaxKb);
  assertUnder('vendor-html2canvas', vendorHtml2canvas, BUDGETS.vendorHtml2canvasMaxKb);
  assertUnder('vendor-maps', vendorMaps, BUDGETS.vendorMapsMaxKb);
  assertUnder('vendor-capacitor', vendorCapacitor, BUDGETS.vendorCapacitorMaxKb);
  assertUnder('vendor-i18n', vendorI18n, BUDGETS.vendorI18nMaxKb);

  console.log('[Budget] All thresholds passed');
}

run();

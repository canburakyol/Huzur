/**
 * Web Codebase Localization Audit Script
 * Scans JavaScript/JSX/TypeScript files for:
 * 1. Hardcoded Turkish texts not wrapped in t() function
 * 2. Incorrect translation key usage (raw keys displayed)
 * 3. Missing translation function calls
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

// Common Turkish words/patterns to detect hardcoded texts
const TURKISH_PATTERNS = [
  // Common UI words
  /["'`](?:Kaydet|Güncelle|İptal|Tamam|Kapat|Geri|İleri|Devam|Sil|Düzenle|Paylaş|Yükle|İndir|Ara|Filtrele)["'`]/g,
  // Greetings and messages
  /["'`](?:Hoş [Gg]eldin|Merhaba|Selam|Teşekkür|Başarılı|Hata|Uyarı|Bilgi|Dikkat)["'`]/g,
  // Islamic terms that should be translated
  /["'`](?:Namaz|Dua|Sure|Ayet|Hadis|Zikir|Tesbih|Kıble|Ezan|İftar|Sahur|Oruç|Zekat)(?:\s+[^"'`]+)?["'`]/g,
  // Date/Time
  /["'`](?:Bugün|Yarın|Dün|Hafta|Ay|Yıl|Saat|Dakika|Saniye)["'`]/g,
  // Common phrases
  /["'`](?:Yükleniyor|Bekleyin|Lütfen|Henüz|Hiç|Bulunamadı|Göster|Gizle)["'`]/g,
  // Settings
  /["'`](?:Ayarlar|Tema|Dil|Bildirimler|Profil|Hesap)["'`]/g,
];

// Patterns that indicate the string is already using translation
const TRANSLATION_PATTERNS = [
  /t\s*\(/,
  /useTranslation/,
  /i18n\./,
  /\{t\(/,
];

// Patterns for raw translation keys appearing in output
const RAW_KEY_PATTERNS = [
  /prayer\.content/,
  /prayerbok\./,
  /prayerbook\./,
  /\.categoris/,
  /\.categori\./,
];

const results = {
  hardcodedTexts: [],
  rawKeys: [],
  potentialIssues: [],
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(__dirname, filePath);
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.includes('import ')) {
      return;
    }
    
    // Check for hardcoded Turkish texts
    TURKISH_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        // Check if it's inside a translation function
        const isTranslated = TRANSLATION_PATTERNS.some(tp => tp.test(line));
        if (!isTranslated) {
          matches.forEach(match => {
            // Skip if it's a key definition in JSON-like structure or object property
            if (!/:\s*["'`]/.test(line.substring(0, line.indexOf(match)))) {
              results.hardcodedTexts.push({
                file: relativePath,
                line: lineNum,
                text: match,
                context: line.trim().substring(0, 100)
              });
            }
          });
        }
      }
    });
    
    // Check for raw translation keys
    RAW_KEY_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        results.rawKeys.push({
          file: relativePath,
          line: lineNum,
          pattern: pattern.toString(),
          context: line.trim().substring(0, 100)
        });
      }
    });
  });
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Only scan JS/JSX/TS/TSX files
      const ext = path.extname(item).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  });
}

function runAudit() {
  console.log('='.repeat(60));
  console.log('WEB CODEBASE LOCALIZATION AUDIT');
  console.log('='.repeat(60));
  console.log('');
  
  console.log('Scanning src/ directory...');
  scanDirectory(SRC_DIR);
  
  console.log('');
  console.log('1. HARDCODED TURKISH TEXTS');
  console.log('-'.repeat(40));
  if (results.hardcodedTexts.length > 0) {
    results.hardcodedTexts.forEach(item => {
      console.log(`  [${item.file}:${item.line}] ${item.text}`);
      console.log(`    Context: ${item.context}`);
    });
  } else {
    console.log('  No hardcoded Turkish texts found.');
  }
  
  console.log('');
  console.log('2. RAW TRANSLATION KEYS');
  console.log('-'.repeat(40));
  if (results.rawKeys.length > 0) {
    results.rawKeys.forEach(item => {
      console.log(`  [${item.file}:${item.line}] Pattern: ${item.pattern}`);
      console.log(`    Context: ${item.context}`);
    });
  } else {
    console.log('  No raw translation keys found.');
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Hardcoded Turkish texts: ${results.hardcodedTexts.length}`);
  console.log(`Raw translation keys: ${results.rawKeys.length}`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'web_localization_audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

runAudit();

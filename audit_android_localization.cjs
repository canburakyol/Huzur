/**
 * Android Native Localization Audit Script
 * Checks strings.xml consistency and hardcoded text in Java/XML files
 */

const fs = require('fs');
const path = require('path');

const ANDROID_RES_PATH = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const ANDROID_JAVA_PATH = path.join(__dirname, 'android', 'app', 'src', 'main', 'java');

// Turkish characters regex
const TURKISH_CHARS = /[ığüşöçİĞÜŞÖÇ]/;
const HARDCODED_STRING_PATTERN = /"([^"]+)"/g;

// Parse strings.xml and extract key-value pairs
function parseStringsXml(filePath) {
    if (!fs.existsSync(filePath)) return null;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const strings = {};
    const regex = /<string name="([^"]+)">(.*?)<\/string>/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
        strings[match[1]] = match[2];
    }
    return strings;
}

// Scan Java files for hardcoded Turkish text
function scanJavaFiles(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanJavaFiles(filePath, results);
        } else if (file.endsWith('.java') || file.endsWith('.kt')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                // Skip comments
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
                
                // Check for Turkish characters
                if (TURKISH_CHARS.test(line)) {
                    results.push({
                        file: path.relative(__dirname, filePath),
                        line: index + 1,
                        content: line.trim(),
                        type: 'turkish_char'
                    });
                }
                
                // Check for hardcoded strings that aren't using getString()
                const strings = line.match(HARDCODED_STRING_PATTERN);
                if (strings) {
                    strings.forEach(str => {
                        // Skip if it's a key reference, import, or package
                        if (str.includes('.') || str.includes('R.') || str.length < 5) return;
                        // Skip if it's a common technical string
                        if (['null', 'true', 'false', 'UTF-8'].some(s => str.includes(s))) return;
                        
                        if (TURKISH_CHARS.test(str)) {
                            results.push({
                                file: path.relative(__dirname, filePath),
                                line: index + 1,
                                content: str,
                                type: 'hardcoded_turkish'
                            });
                        }
                    });
                }
            });
        }
    }
    return results;
}

// Scan XML layout files for hardcoded text
function scanXmlLayouts(dir, results = []) {
    const layoutDir = path.join(dir, 'layout');
    if (!fs.existsSync(layoutDir)) return results;
    
    const files = fs.readdirSync(layoutDir);
    
    for (const file of files) {
        if (!file.endsWith('.xml')) continue;
        
        const filePath = path.join(layoutDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            // Check for android:text with hardcoded value
            const textMatch = line.match(/android:text="([^@][^"]*)"/);
            if (textMatch && textMatch[1].length > 0) {
                results.push({
                    file: path.relative(__dirname, filePath),
                    line: index + 1,
                    content: `android:text="${textMatch[1]}"`,
                    type: 'hardcoded_xml_text'
                });
            }
            
            // Check for android:hint with hardcoded value
            const hintMatch = line.match(/android:hint="([^@][^"]*)"/);
            if (hintMatch && hintMatch[1].length > 0) {
                results.push({
                    file: path.relative(__dirname, filePath),
                    line: index + 1,
                    content: `android:hint="${hintMatch[1]}"`,
                    type: 'hardcoded_xml_hint'
                });
            }
        });
    }
    return results;
}

// Main audit
function runAudit() {
    console.log('============================================================');
    console.log('ANDROID NATIVE LOCALIZATION AUDIT');
    console.log('============================================================\n');
    
    // 1. Check strings.xml files
    console.log('1. STRINGS.XML CONSISTENCY CHECK');
    console.log('----------------------------------------');
    
    const defaultStrings = parseStringsXml(path.join(ANDROID_RES_PATH, 'values', 'strings.xml'));
    const trStrings = parseStringsXml(path.join(ANDROID_RES_PATH, 'values-tr', 'strings.xml'));
    const arStrings = parseStringsXml(path.join(ANDROID_RES_PATH, 'values-ar', 'strings.xml'));
    
    if (!defaultStrings) {
        console.log('  ❌ values/strings.xml not found!');
    } else {
        console.log(`  ✅ values/strings.xml: ${Object.keys(defaultStrings).length} keys`);
    }
    
    if (!trStrings) {
        console.log('  ⚠️ values-tr/strings.xml not found');
    } else {
        console.log(`  ✅ values-tr/strings.xml: ${Object.keys(trStrings).length} keys`);
        
        // Check for missing keys in Turkish
        const missingInTr = Object.keys(defaultStrings || {}).filter(k => !trStrings[k]);
        if (missingInTr.length > 0) {
            console.log(`  ⚠️ Missing in Turkish: ${missingInTr.join(', ')}`);
        }
    }
    
    if (!arStrings) {
        console.log('  ⚠️ values-ar/strings.xml not found');
    } else {
        console.log(`  ✅ values-ar/strings.xml: ${Object.keys(arStrings).length} keys`);
        
        // Check for missing keys in Arabic
        const missingInAr = Object.keys(defaultStrings || {}).filter(k => !arStrings[k]);
        if (missingInAr.length > 0) {
            console.log(`  ⚠️ Missing in Arabic: ${missingInAr.join(', ')}`);
        }
    }
    
    // 2. Check for empty values
    console.log('\n2. EMPTY VALUES CHECK');
    console.log('----------------------------------------');
    
    let emptyCount = 0;
    [defaultStrings, trStrings, arStrings].forEach((strings, idx) => {
        const locale = ['default', 'tr', 'ar'][idx];
        if (!strings) return;
        
        Object.entries(strings).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                console.log(`  ⚠️ Empty value in ${locale}: ${key}`);
                emptyCount++;
            }
        });
    });
    
    if (emptyCount === 0) {
        console.log('  ✅ No empty values found');
    }
    
    // 3. Scan Java/Kotlin for hardcoded text
    console.log('\n3. JAVA/KOTLIN HARDCODED TEXT CHECK');
    console.log('----------------------------------------');
    
    const javaResults = scanJavaFiles(ANDROID_JAVA_PATH);
    if (javaResults.length === 0) {
        console.log('  ✅ No hardcoded Turkish text found in Java/Kotlin files');
    } else {
        javaResults.forEach(r => {
            console.log(`  ⚠️ ${r.file}:${r.line} - ${r.content}`);
        });
    }
    
    // 4. Scan XML layouts for hardcoded text
    console.log('\n4. XML LAYOUT HARDCODED TEXT CHECK');
    console.log('----------------------------------------');
    
    const xmlResults = scanXmlLayouts(ANDROID_RES_PATH);
    if (xmlResults.length === 0) {
        console.log('  ✅ No hardcoded text found in XML layouts');
    } else {
        xmlResults.forEach(r => {
            console.log(`  ⚠️ ${r.file}:${r.line} - ${r.content}`);
        });
    }
    
    // Summary
    console.log('\n============================================================');
    console.log('SUMMARY');
    console.log('============================================================');
    console.log(`String files: ${[defaultStrings, trStrings, arStrings].filter(Boolean).length}/3`);
    console.log(`Empty values: ${emptyCount}`);
    console.log(`Java/Kotlin issues: ${javaResults.length}`);
    console.log(`XML layout issues: ${xmlResults.length}`);
}

runAudit();

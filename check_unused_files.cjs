const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

console.log('Reading source files...');
const allFiles = getAllFiles('./src', []);
const fileContents = {};

allFiles.forEach(f => {
    fileContents[f] = fs.readFileSync(f, 'utf8');
});

console.log('Scanning for unused files...');
const unusedFiles = [];

const entryPoints = ['main.jsx', 'App.jsx', 'index.html', 'firebase-messaging-sw.js'];

allFiles.forEach(targetFile => {
    const fileName = path.basename(targetFile);
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, "");
    
    // Skip entry points and some specific files
    if (entryPoints.some(ep => targetFile.endsWith(ep)) || fileName.startsWith('vite') || fileName.startsWith('setupTests')) {
        return;
    }

    let isUsed = false;
    for (const [sourceFile, content] of Object.entries(fileContents)) {
        if (sourceFile === targetFile) continue;

        // Check for import by filename (naive check)
        // We check for:
        // 1. "import ... from './FileName'"
        // 2. "import ... from './FileName.jsx'"
        // 3. "<FileName" (usage in JSX)
        if (content.includes(fileName) || content.includes(fileNameNoExt)) {
            isUsed = true;
            break;
        }
    }

    if (!isUsed) {
        unusedFiles.push(targetFile);
    }
});

console.log('Potential unused files:');
unusedFiles.forEach(f => console.log(`- ${f}`));

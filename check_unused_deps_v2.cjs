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

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
// const devDependencies = Object.keys(packageJson.devDependencies || {}); // Focus on runtime deps for now
const allDeps = [...dependencies];

console.log('Reading source files...');
const allFiles = getAllFiles('./src', []);
const allContent = allFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

console.log('Scanning for unused dependencies...');
const unusedDeps = [];

allDeps.forEach(dep => {
    // Simple heuristic: check if the package name is present in the code
    // This handles "import ... from 'package'" and "require('package')"
    if (!allContent.includes(dep)) {
        unusedDeps.push(dep);
    }
});

console.log('Potential unused dependencies:');
unusedDeps.forEach(dep => console.log(`- ${dep}`));

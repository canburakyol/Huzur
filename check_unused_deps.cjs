const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});
const allDeps = [...dependencies, ...devDependencies];

console.log('Scanning for unused dependencies...');

const unusedDeps = [];

allDeps.forEach(dep => {
    // Skip some known dev tools or types that might not be explicitly imported in src
    if (dep.startsWith('@types/') || dep.includes('eslint') || dep.includes('vite') || dep === 'typescript' || dep === 'globals') {
        return;
    }

    try {
        // Grep for the package name in src directory
        // -r: recursive
        // -q: quiet (exit 0 if found, 1 if not)
        // --include=*.{js,jsx,ts,tsx}: only search these files
        execSync(`grep -r "${dep}" src --include=*.{js,jsx,ts,tsx}`, { stdio: 'ignore' });
    } catch (e) {
        // grep returns exit code 1 if not found
        unusedDeps.push(dep);
    }
});

console.log('Potential unused dependencies:');
unusedDeps.forEach(dep => console.log(`- ${dep}`));

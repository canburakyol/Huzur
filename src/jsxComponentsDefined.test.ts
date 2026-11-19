import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// ESLint here has no React plugin, so <Foo /> with Foo never imported only fails at runtime
// (a header swap once crashed Huzur Mode this way). This catches it in the test run.
const listJsx = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return listJsx(full);
  return entry.name.endsWith('.jsx') && !entry.name.includes('.test.') ? [full] : [];
});

const undefinedComponents = (source: string): string[] => {
  const used = new Set([...source.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map((m) => m[1]));
  return [...used].filter((name) => {
    const declared = new RegExp(
      `import[^;]*\\b${name}\\b[^;]*from|\\b(const|let|var|function|class)\\s+${name}\\b|[{,]\\s*(\\w+\\s*:\\s*)?${name}\\s*[,}=]`
    );
    return !declared.test(source);
  });
};

describe('JSX components', () => {
  it('are all imported or declared where they are used', () => {
    const problems = listJsx('src').flatMap((file) =>
      undefinedComponents(fs.readFileSync(file, 'utf8')).map((name) => `${file}: <${name}>`)
    );
    expect(problems).toEqual([]);
  });

  it('detects a missing import', () => {
    expect(undefinedComponents("const A = () => <PageHeader title='x' />;")).toEqual(['PageHeader']);
  });
});

import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildScopeIndex,
  collectFeatureScope,
  collectStaticScope,
  getScopeInfo,
  resolveTaskScope,
  runDoctor
} from './scope-files.js';

const root = process.cwd();
const configPath = path.join(root, 'scripts', 'scope-map.json');

async function loadConfig() {
  const raw = await fs.readFile(configPath, 'utf8');
  return JSON.parse(raw);
}

describe('scope-files', () => {
  it('collects family scope files from feature imports', async () => {
    const files = await collectFeatureScope('family');

    expect(files).toContain('src/features/family/index.js');
    expect(files).toContain('src/components/family/FamilyDashboard.jsx');
  });

  it('collects notifications static scope files', async () => {
    const config = await loadConfig();
    const files = await collectStaticScope('notifications', config);

    expect(files).toContain('android');
    expect(files).toContain('src/services/smartNotificationService.js');
  });

  it('resolves explicit scope requests deterministically', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('scope:family davet akisi bozuk', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('family');
    expect(result.method).toBe('explicit');
  });

  it('resolves assistant tasks to ai scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('assistant ekraninda cevap tonu sorunlu', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('ai');
  });

  it('resolves monetization aliases to monetization scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('premium abonelik restore sorunu', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('monetization');
  });

  it('resolves notification aliases to notifications scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('bildirim izni ve push ayari bozuk', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('notifications');
  });

  it('reports ambiguous generic dua requests instead of forcing a scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('dua bozuk', config, index);

    expect(result.status).toBe('ambiguous');
    expect(result.candidates.map((candidate) => candidate.scope)).toEqual(['ibadet', 'social']);
  });

  it('returns scope registry details for maintenance guidance', async () => {
    const info = await getScopeInfo('family');

    expect(info.summary).toContain('Aile');
    expect(info.entrypoints).toContain('src/features/family/index.js');
    expect(info.relatedScopes).toContain('social');
  });

  it('resolves app shell aliases to the app-shell scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('app shell tab router takiliyor', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('app-shell');
  });

  it('resolves home aliases to the home scope', async () => {
    const config = await loadConfig();
    const index = await buildScopeIndex(config);
    const result = await resolveTaskScope('ana sayfa home hero karti bozuk', config, index);

    expect(result.status).toBe('resolved');
    expect(result.scope).toBe('home');
  });

  it('detects rg availability or fallback state', async () => {
    const doctor = await runDoctor();

    expect(['ok', 'blocked', 'missing']).toContain(doctor.rg);
    expect(doctor.fallback).toBe('scope-map');
  });
});

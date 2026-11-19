// Library content is authored in Turkish; en/de/id overlays map "SECTION.index.field" paths to translated text.
const OVERLAYS: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  en: () => import('./en.json'),
  de: () => import('./de.json'),
  id: () => import('./id.json'),
};

/** Returns a translated copy of `data`; Turkish or unsupported languages get `data` back unchanged. */
export const localizeLibraryData = async <T extends object>(data: T, language: string): Promise<T> => {
  const load = OVERLAYS[language.slice(0, 2)];
  if (!load) return data;
  const overlay = (await load()).default;
  const copy = structuredClone(data) as Record<string, unknown>;
  for (const [path, value] of Object.entries(overlay)) {
    const parts = path.split('.');
    const last = parts.pop() as string;
    let node: unknown = copy;
    for (const part of parts) node = (node as Record<string, unknown> | undefined)?.[part];
    if (node && typeof (node as Record<string, unknown>)[last] === 'string') (node as Record<string, unknown>)[last] = value;
  }
  return copy as T;
};

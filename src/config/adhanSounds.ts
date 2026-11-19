// Adhan recordings bundled in android/app/src/main/res/raw/<id>.mp3 (lower-case, letters, digits, _).
// The adhan picker in notification settings stays hidden while this list is empty.
// Add an entry only together with its file and its license note in LicensesCredits.
export type AdhanSound = { id: string; labelKey: string; fallback: string };

export const ADHAN_SOUNDS: AdhanSound[] = [];

export const isKnownAdhanSound = (id: string | null | undefined): boolean =>
  Boolean(id) && ADHAN_SOUNDS.some((sound) => sound.id === id);

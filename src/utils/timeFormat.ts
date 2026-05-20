export const formatPrayerTime = (timeStr: string | undefined | null): string => {
  if (!timeStr || typeof timeStr !== 'string') return '--:--';

  const parts = timeStr.split(':');
  if (parts.length !== 2) return '--:--';

  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');

  if (isNaN(Number(hours)) || isNaN(Number(minutes))) return '--:--';

  return `${hours}:${minutes}`;
};

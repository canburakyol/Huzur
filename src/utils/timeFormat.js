/**
 * Namaz vakti formatını HH:mm şeklinde düzenler.
 * Örn: "5:7" -> "05:07", "13:45" -> "13:45"
 * 
 * @param {string} timeStr - Formatlanacak saat dizesi
 * @returns {string} - Formatlanmış saat dizesi
 */
export const formatPrayerTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return '--:--';

  const parts = timeStr.split(':');
  if (parts.length !== 2) return '--:--';

  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');

  // Geçerli sayı olup olmadığını kontrol et
  if (isNaN(hours) || isNaN(minutes)) return '--:--';

  return `${hours}:${minutes}`;
};

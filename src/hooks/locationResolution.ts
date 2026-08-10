export type PrayerCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Prayer calculations need only coordinates. Start them immediately and leave
 * network-backed city/weather enrichment off the critical path.
 */
export const forwardCoordinatesBeforeEnrichment = async <T>(
  coordinates: PrayerCoordinates,
  forward: (coordinates: PrayerCoordinates) => void,
  enrich: () => Promise<T>,
): Promise<T> => {
  forward(coordinates);
  return enrich();
};

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

export const normalizeHeading = (degrees: number): number => ((degrees % 360) + 360) % 360;

/** Great-circle initial bearing from a point to the Kaaba, degrees clockwise from true north. */
export const calculateQiblaDirection = (latitude: number, longitude: number): number => {
  const lat1 = toRad(latitude);
  const lat2 = toRad(KAABA_LAT);
  const dLng = toRad(KAABA_LNG - longitude);
  return normalizeHeading(
    (Math.atan2(Math.sin(dLng), Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng)) * 180) / Math.PI,
  );
};

/** Haversine distance to the Kaaba in kilometres. */
export const distanceToKaabaKm = (latitude: number, longitude: number): number => {
  const dLat = toRad(KAABA_LAT - latitude);
  const dLng = toRad(KAABA_LNG - longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(latitude)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

/** Signed shortest turn from the current heading to the qibla: positive = turn right (clockwise). */
export const turnToQibla = (heading: number, qibla: number): number => ((qibla - heading + 540) % 360) - 180;

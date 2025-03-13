type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Calculate the azimuth between two geographic coordinates
 * @param lat1 - Latitude of the first point
 * @param long1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param long2 - Longitude of the second point
 * @returns Azimuth in degrees (0° to 360°)
 */
const calculateAzimuth = (
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
): number => {
  console.log('input: ' + lat1 + ' ' + long1 + ' ' + lat2 + ' ' + long2);
  
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const toDegrees = (radians: number): number => radians * (180 / Math.PI);

  // Convert coordinates to radians
  const lat1Rad = toRadians(lat1);
  const long1Rad = toRadians(long1);
  const lat2Rad = toRadians(lat2);
  const long2Rad = toRadians(long2);

  // Calculate differences in longitude
  const deltaLong = long2Rad - long1Rad;

  // Calculate X and Y components
  const X = Math.cos(lat2Rad) * Math.sin(deltaLong);
  const Y =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLong);

  // Calculate azimuth in radians and convert to degrees
  let azimuthDeg = toDegrees(Math.atan2(X, Y));

  // Ensure azimuth is in the range [0, 360]
  azimuthDeg = (azimuthDeg + 360) % 360;

  console.log('output: ' + azimuthDeg);

  return azimuthDeg;
};

/**
 * Calculate both Azimuth NE to FE and Azimuth FE to NE
 * @param ne - Near End coordinates
 * @param fe - Far End coordinates
 * @returns Object with azimuths in both directions
 */
export const calculateAzimuths = (ne: Coordinates, fe: Coordinates) => {
  const azimuthNEToFE = calculateAzimuth(
    ne.latitude,
    ne.longitude,
    fe.latitude,
    fe.longitude
  );

  return azimuthNEToFE.toFixed(1);
};



export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = toRadians(coord1.latitude);
    const lat2 = toRadians(coord2.latitude);
    const deltaLat = toRadians(coord2.latitude - coord1.latitude);
    const deltaLon = toRadians(coord2.longitude - coord1.longitude);
  
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance in kilometers
  }
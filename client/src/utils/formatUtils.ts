/**
 * Utility functions for formatting data
 */

/**
 * Safely format coordinates to display string
 * @param lat - Latitude value (number or string)
 * @param lng - Longitude value (number or string)
 * @returns Formatted coordinate string or error message
 */
export const formatCoordinates = (lat: number | string, lng: number | string): string => {
  try {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return 'Invalid coordinates';
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    return 'Invalid coordinates';
  }
};

/**
 * Format time to locale string
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

/**
 * Format order ID for display (show first 8 characters)
 * @param orderId - Full order ID
 * @returns Truncated order ID
 */
export const formatOrderId = (orderId: string): string => {
  return `${orderId.substring(0, 8)}...`;
};

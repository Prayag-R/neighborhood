// src/lib/neighborhoodService.js
// Helper functions that call your secure Express backend for geocoding tasks.

const BACKEND_URL = 'http://localhost:3001'; // your backend server URL (adjust if deployed)

/**
 * Finds neighborhood and city name from coordinates (lat/lng)
 * by calling the secure backend reverse-geocoding endpoint.
 */
export const getNeighborhoodFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/reverse-geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend reverse geocoding error');
    }

    return await response.json(); // { name, city, lat, lng, geometry, address }
  } catch (error) {
    console.error('Error fetching neighborhood from backend:', error);
    return null;
  }
};

/**
 * Converts an address string into coordinates (lat/lng)
 * by calling the secure backend forward-geocoding endpoint.
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/geocode-address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend forward geocoding error');
    }

    return await response.json(); // { lat, lng, address }
  } catch (error) {
    console.error('Error geocoding address via backend:', error);
    return null;
  }
};

/**
 * Gets user's current location via browser.
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  });
};

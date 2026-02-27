/**
 * API Configuration
 * 
 * Centralized API configuration file.
 * Change the API_BASE_URL here to update it across the entire application.
 */

// Change this URL when your IP changes
export const API_BASE_URL = 'http://10.4.31.121:3000';

/**
 * Helper function to build API endpoint URLs
 * @param endpoint - The API endpoint path (e.g., '/api/businesses')
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  BUSINESSES: '/api/businesses',
  BUSINESSES_BY_USER: '/api/businesses/user', // Get user's own businesses (authenticated)
  CARS: '/api/cars',
  CARS_AVAILABLE_SEARCH: '/api/cars/available/search',
  CARS_ADVANCED_SEARCH: '/api/cars/search/advanced',
  BUSINESS_CARS_SORTED: '/api/cars/business',
  USERS_LOGIN: '/api/users/login',
  USERS_REGISTER: '/api/users/register',
  BOOKINGS: '/api/bookings',
  USERS: '/api/users',
  UPGRADE_TO_BUSINESS: '/api/users/:userId/upgrade-to-business',
  CAR_BLOCKS: '/api/car-blocks',
} as const;

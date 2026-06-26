export const OMDB_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_OMDB_API_KEY || "a30f0041",
  BASE_URL: process.env.EXPO_PUBLIC_OMDB_BASE_URL || "https://www.omdbapi.com",
};

export const API_CONFIG = {
  // Retry configuration for failed API calls
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  
  // Cache configuration
  CACHE_DURATION: 3600, // 1 hour in seconds
  
  // Request timeout
  REQUEST_TIMEOUT: 10000, // 10 seconds
};

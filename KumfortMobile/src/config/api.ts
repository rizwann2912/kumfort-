// API Configuration
const getBaseUrl = () => {
  if (__DEV__) {
    // Use only the working IP address for all platforms
    return 'http://192.168.88.103:8000/api';
  }
  return 'https://your-production-api.com/api'; // Production
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  
  ENDPOINTS: {
    CHECK_USER: '/auth/check-user/',
    SEND_OTP: '/auth/send-otp/',
    VERIFY_OTP: '/auth/verify-otp/',
    RESEND_OTP: '/auth/resend-otp/',
    LOGOUT: '/auth/logout/',
    PROFILE: '/auth/profile/',
    UPDATE_PROFILE: '/auth/update-profile/',
    TEST_CONNECTION: '/auth/test/',
    // Location endpoints
    UPDATE_LOCATION: '/locations/update-location/',
    DRIVER_LOCATION: '/locations/driver-location/',
    VAN_LOCATION: '/locations/van-location/',
    LOCATION_HISTORY: '/locations/location-history/',
    TOGGLE_GPS: '/locations/toggle-gps/',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};



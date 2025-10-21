// Environment Configuration
export const ENV_CONFIG = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || "https://your-api-domain.com/api",
  IS_DEVELOPMENT: __DEV__,
  IS_PRODUCTION: !__DEV__,
};

// Update the API config to use environment variable
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  ENDPOINTS: {
    USER: {
      CREATE: "/user/create",
      GET_BY_ID: "/user",
      UPDATE: "/user",
      CHECK_CRON_ID: "/user/cron-id/check",
      REGISTER_CRON_ID: "/user/cron-id/register",
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

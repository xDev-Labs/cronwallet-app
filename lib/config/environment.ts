// Environment Configuration
export const ENV_CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "",
  TOKEN_API_URL: process.env.EXPO_PUBLIC_TOKEN_API_URL || "",
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
      GET_BY_PHONE_NUMBER: "/user/phone",
      GET_BY_ADDRESS: "/user/address",
      ONBOARD: "/user/onboard",
      UPDATE: "/user",
      UPLOAD_AVATAR: "/user",
      CHECK_CRON_ID: "/user/cron-id/check",
      REGISTER_CRON_ID: "/user/cron-id/register",
      TRANSFER_SPL: "/user/transfer-spl",
      GET_AIRDROP: "/user/airdrop",
      GET_TOKENS: "/user",
    },
    TRANSACTION: {
      GET_BY_HASH: "/transaction",
      GET_BY_USER_ID: "/transaction/user",
      CREATE: "/transaction",
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

export const TOKEN_API_URL = ENV_CONFIG.TOKEN_API_URL;

import { API_CONFIG } from "./environment";

// Re-export API_CONFIG from environment
export { API_CONFIG };

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserCreateResponse {
  user: {
    user_id: string;
    phone_number: string;
    cron_id: string;
    primary_address: string;
    wallet_address: string[];
    avatar_url?: string;
    preferred_currency: string;
    local_currency: string;
    face_id_enabled: boolean;
    created_at: string;
    updated_at?: string;
  };
  isNewUser: boolean;
}

export interface CronIdCheckResponse {
  cronId: string;
  available: boolean;
}

export interface CronIdRegisterResponse {
  user: {
    user_id: string;
    phone_number: string;
    cron_id: string;
    primary_address: string;
    wallet_address: string[];
    avatar_url?: string;
    preferred_currency: string;
    local_currency: string;
    face_id_enabled: boolean;
    created_at: string;
    updated_at?: string;
  };
}

export interface UserUpdateResponse {
  user: {
    user_id: string;
    phone_number: string;
    cron_id: string;
    primary_address: string;
    wallet_address: string[];
    avatar_url?: string;
    preferred_currency: string;
    local_currency: string;
    face_id_enabled: boolean;
    created_at: string;
    updated_at?: string;
  };
}

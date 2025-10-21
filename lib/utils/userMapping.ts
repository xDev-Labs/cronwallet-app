import type { User } from "@/lib/types/user.types";

/**
 * Maps backend user response to our User model
 * Handles both old and new backend response formats
 */
export function mapBackendUserToUser(backendUser: any): User {
  console.log("Backend User Data:", backendUser);

  // Handle case where backendUser is undefined or null
  if (!backendUser) {
    console.error("Backend user data is undefined or null");
    throw new Error("Backend user data is missing");
  }

  return {
    user_id: backendUser.user_id,
    phone_number: backendUser.phone_number,
    cron_id: backendUser.cron_id || "",
    primary_address: backendUser.primary_address || "",
    wallet_address: backendUser.wallet_address || [],
    avatar_url: backendUser.avatar_url,
    preferred_currency: backendUser.preferred_currency || "USD",
    local_currency: backendUser.local_currency || "USD",
    face_id_enabled: backendUser.face_id_enabled || false,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
  };
}

/**
 * Maps our User model to backend update format
 */
export function mapUserToBackendUpdate(user: Partial<User>): any {
  const updateData: any = {};

  if (user.phone_number !== undefined)
    updateData.phone_number = user.phone_number;
  if (user.cron_id !== undefined) updateData.cron_id = user.cron_id;
  if (user.primary_address !== undefined)
    updateData.primary_address = user.primary_address;
  if (user.wallet_address !== undefined)
    updateData.wallet_address = user.wallet_address;
  if (user.avatar_url !== undefined) updateData.avatar_url = user.avatar_url;
  if (user.preferred_currency !== undefined)
    updateData.preferred_currency = user.preferred_currency;
  if (user.local_currency !== undefined)
    updateData.local_currency = user.local_currency;
  if (user.face_id_enabled !== undefined)
    updateData.face_id_enabled = user.face_id_enabled;

  return updateData;
}

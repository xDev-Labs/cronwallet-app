import {
  API_CONFIG,
  UserByAddressResponse,
  UserByPhoneNumberResponse,
  UserOnboardResponse,
  type ApiResponse,
  type CronIdCheckResponse,
  type CronIdRegisterResponse,
  type UserCreateResponse,
  type UserUpdateResponse,
} from "@/lib/config/api";
import type {
  CreateTransactionDto,
  Transaction,
} from "@/lib/types/transaction.types";

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout");
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error occurred"
      );
    }
  }

  // Create or find user by phone number
  async createUser(
    phoneNumber: string
  ): Promise<ApiResponse<UserCreateResponse>> {
    return this.makeRequest<UserCreateResponse>(
      API_CONFIG.ENDPOINTS.USER.CREATE,
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber }),
      }
    );
  }

  // Get user by ID
  async getUserById(
    userId: string
  ): Promise<ApiResponse<UserCreateResponse["user"]>> {
    return this.makeRequest<UserCreateResponse["user"]>(
      `${API_CONFIG.ENDPOINTS.USER.GET_BY_ID}/${userId}`,
      {
        method: "GET",
      }
    );
  }

  // Get user by Phone Number
  async getUserByPhoneNumber(
    phoneNumber: string
  ): Promise<ApiResponse<UserByPhoneNumberResponse["user"]>> {
    return this.makeRequest<UserByPhoneNumberResponse["user"]>(
      `${API_CONFIG.ENDPOINTS.USER.GET_BY_PHONE_NUMBER}/${phoneNumber}`,
      {
        method: "GET",
      }
    );
  }
  // Get user by address
  async getUserByAddress(
    address: string
  ): Promise<ApiResponse<UserByAddressResponse["user"]>> {
    return this.makeRequest<UserByAddressResponse["user"]>(
      `${API_CONFIG.ENDPOINTS.USER.GET_BY_ADDRESS}/${address}`,
      {
        method: "GET",
      }
    );
  }
  // Check if cron ID is available
  async checkCronIdAvailability(
    cronId: string
  ): Promise<ApiResponse<CronIdCheckResponse>> {
    return this.makeRequest<CronIdCheckResponse>(
      `${API_CONFIG.ENDPOINTS.USER.CHECK_CRON_ID}/${cronId}`,
      {
        method: "GET",
      }
    );
  }

  // Register cron ID for a user
  async registerCronId(
    userId: string,
    cronId: string
  ): Promise<ApiResponse<CronIdRegisterResponse>> {
    return this.makeRequest<CronIdRegisterResponse>(
      API_CONFIG.ENDPOINTS.USER.REGISTER_CRON_ID,
      {
        method: "POST",
        body: JSON.stringify({ userId, cronId }),
      }
    );
  }

  // Update user during onboarding
  async updateUser(
    userId: string,
    updateData: any
  ): Promise<ApiResponse<UserUpdateResponse>> {
    return this.makeRequest<UserUpdateResponse>(
      `${API_CONFIG.ENDPOINTS.USER.UPDATE}/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
  }

  // Upload avatar
  async uploadAvatar(
    userId: string,
    imageUri: string,
    fileName: string
  ): Promise<ApiResponse<{ user: any; avatarUrl: string }>> {
    const formData = new FormData();

    // For React Native, create proper file object with URI
    const fileObject = {
      uri: imageUri,
      type: "image/jpeg",
      name: fileName,
    };

    formData.append("avatar", fileObject as any);

    const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.USER.UPLOAD_AVATAR}/${userId}/avatar`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "PUT",
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let browser handle it for FormData
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout");
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error occurred"
      );
    }
  }

  // Onboard user
  async onboardUser(
    userId: string,
    walletAddress: string,
    smartWalletAddress: string,
    encodedTransaction: string
  ): Promise<ApiResponse<UserOnboardResponse>> {
    return this.makeRequest<UserOnboardResponse>(
      `${API_CONFIG.ENDPOINTS.USER.ONBOARD}`,
      {
        method: "POST",
        body: JSON.stringify({
          userId,
          walletAddress,
          smartWalletAddress,
          encodedTransaction,
        }),
      }
    );
  }

  async transferSpl(
    encodedTransaction: string,
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `${API_CONFIG.ENDPOINTS.USER.TRANSFER_SPL}`,
      {
        method: "POST",
        body: JSON.stringify({ encodedTransaction }),
      }
    );
  }

  // Transaction methods
  async getTransactionByHash(hash: string): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>(
      `${API_CONFIG.ENDPOINTS.TRANSACTION.GET_BY_HASH}/${hash}`,
      {
        method: "GET",
      }
    );
  }

  async getTransactionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    receiver?: string
  ): Promise<
    ApiResponse<{
      userId: string;
      transactions: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    let url = `${API_CONFIG.ENDPOINTS.TRANSACTION.GET_BY_USER_ID}/${userId}?page=${page}&limit=${limit}`;

    if (receiver) {
      url += `&receiver=${encodeURIComponent(receiver)}`;
    }

    return this.makeRequest(url, {
      method: "GET",
    });
  }

  async createTransaction(
    transactionData: CreateTransactionDto
  ): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>(
      API_CONFIG.ENDPOINTS.TRANSACTION.CREATE,
      {
        method: "POST",
        body: JSON.stringify(transactionData),
      }
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();
export { ApiError };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
}

export interface RouteParams {
  [key: string]: string | number | boolean | undefined;
}

import { ApiResponse, ApiErrorResponse, ApiErrorDetail } from '@/types/api';

export function createApiResponse<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export function createApiError(
  code: string,
  message: string,
  details?: ApiErrorDetail[],
  requestId?: string
): ApiResponse<never> {
  const errorObj: ApiErrorResponse = {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  return {
    success: false,
    error: errorObj,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

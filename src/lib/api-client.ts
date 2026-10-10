export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
}

export async function safeFetch<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        'Accept': 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await res.text();
      let errorMsg = `Server returned invalid non-JSON response (HTTP ${res.status}).`;
      if (res.status === 404) errorMsg = 'Requested API endpoint was not found (404).';
      else if (res.status === 401) errorMsg = 'Session expired or unauthenticated. Please log in.';
      else if (res.status === 403) errorMsg = 'Access denied. You do not have permission to perform this action.';
      else if (res.status >= 500) errorMsg = 'Server experienced an error processing your request. Please try again.';

      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: errorMsg,
        },
      };
    }

    const data: ApiResponse<T> = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Network request failed.',
      },
    };
  }
}

/**
 * ─────────────────────────────────────────────────────────
 *  BASE HTTP CLIENT
 *  Wraps fetch with JSON headers, error handling, and typed responses.
 *  All domain modules use this internally.
 * ─────────────────────────────────────────────────────────
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: Record<string, unknown> | unknown[] | null;
  method?: HttpMethod;
}

export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, method = body ? 'POST' : 'GET', ...rest } = options;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...(body !== undefined && body !== null ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const error = isJson ? await response.json() : { message: `HTTP ${response.status}` };
    throw new ApiError(error.message || 'API request failed', response.status, error);
  }

  return isJson ? response.json() : ({} as T);
}

// Convenience shortcuts
export const apiGet  = <T = unknown>(url: string, opts?: ApiRequestOptions) =>
  apiRequest<T>(url, { ...opts, method: 'GET' });

export const apiPost = <T = unknown>(url: string, body?: ApiRequestOptions['body'], opts?: ApiRequestOptions) =>
  apiRequest<T>(url, { ...opts, method: 'POST', body });

export const apiPatch = <T = unknown>(url: string, body?: ApiRequestOptions['body'], opts?: ApiRequestOptions) =>
  apiRequest<T>(url, { ...opts, method: 'PATCH', body });

export const apiPut = <T = unknown>(url: string, body?: ApiRequestOptions['body'], opts?: ApiRequestOptions) =>
  apiRequest<T>(url, { ...opts, method: 'PUT', body });

export const apiDelete = <T = unknown>(url: string, opts?: ApiRequestOptions) =>
  apiRequest<T>(url, { ...opts, method: 'DELETE' });

import axios, { AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';
import type { ApiEnvelope, ApiError } from '@/types/api';

export interface ExecuteOptions {
  action: string;
  parameters?: Record<string, unknown>;
}

function normalizeError(errors: ApiError | AxiosError<unknown> | null): ApiError {
  const fallback: ApiError = { message: 'Something went wrong. Please try again.', status: 500 };

  if (!errors) return fallback;

  if (errors instanceof AxiosError) {
    const status = errors.response?.status ?? 500;
    const data = errors.response?.data as ApiEnvelope<unknown> | undefined;
    if (data) {
      const message = data.Message ?? data.message;
      if (message) return { message, status };
      if (status === 400 && typeof data === 'object' && data !== null && 'title' in data) {
        const title = (data as { title?: string }).title;
        if (title) return { message: title, status };
      }
    }
    if (status === 401 || status === 403) return { message: 'You are not authorized to perform this action.', status };
    return { message: errors.message || fallback.message, status };
  }

  if (errors.status === 401 || errors.status === 403) {
    return { message: 'You are not authorized to perform this action.', status: errors.status };
  }

  return errors;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeError(error as AxiosError<unknown> | ApiError | null);
    if (apiError.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.dispatchEvent(new Event('pc:unauthorized'));
    }
    return Promise.reject(apiError);
  },
);

export async function execute<T>({ action, parameters = {} }: ExecuteOptions): Promise<T> {
  const { data } = await client.post<ApiEnvelope<T>>('/api/execute', {
    Action: action,
    Parameters: parameters,
  });

  const statusCode = data.StatusCode ?? data.statusCode ?? 0;
  const message = data.Message ?? data.message ?? '';

  if (statusCode === 0) {
    const payload = data.Data ?? data.data;
    if (payload !== undefined) {
      return payload;
    }
    return undefined as T;
  }

  throw { message: message || `Request failed (${statusCode}).`, status: statusCode } as ApiError;
}

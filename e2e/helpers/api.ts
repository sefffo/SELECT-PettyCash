import { APIRequestContext } from '@playwright/test';

export const API_BASE_URL = process.env.E2E_API_BASE_URL ?? 'https://pcapi.selecteg.com';

export interface ApiLoginResult {
  token: string;
  role: string;
  raw: Record<string, unknown>;
}

type PostOptions = NonNullable<Parameters<APIRequestContext['post']>[1]>;

/**
 * POSTs to the API with retries for transient network/DNS errors and 5xx
 * responses. Legitimate 4xx responses are returned as-is so tests can assert
 * on them.
 */
async function postWithRetry(
  request: APIRequestContext,
  url: string,
  options: PostOptions,
): Promise<import('@playwright/test').APIResponse> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await request.post(url, options);
      if (response.status() < 500) return response;
      lastError = new Error(`HTTP ${response.status()}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Calls Auth/Login against the real API and returns the token + role. */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<ApiLoginResult> {
  const response = await postWithRetry(request, `${API_BASE_URL}/api/execute`, {
    data: { Action: 'Auth/Login', Parameters: { Email: email, Password: password } },
  });
  const body = await response.json();
  const data = (body.data ?? body.Data ?? {}) as Record<string, unknown>;
  const token = (data.token ?? data.Token) as string | undefined;
  if (!token) {
    const message = (body.message ?? body.Message) as string | undefined;
    const status = (body.statusCode ?? body.StatusCode ?? response.status()) as number;
    return { token: '', role: '', raw: { status, message } };
  }
  const role = (data.role ?? data.Role ?? '') as string;
  return { token, role, raw: body };
}

/**
 * Executes an arbitrary API action with an optional bearer token.
 * Returns the parsed envelope so tests can assert on StatusCode / Data.
 */
export async function apiExecute(
  request: APIRequestContext,
  action: string,
  parameters: Record<string, unknown> = {},
  token?: string,
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await postWithRetry(request, `${API_BASE_URL}/api/execute`, {
    data: { Action: action, Parameters: parameters },
    headers,
  });
  return response.json();
}

/** Reads the status code from a response envelope regardless of casing. */
export function envelopeStatus(envelope: Record<string, unknown>): number {
  const value = (envelope.StatusCode as number | undefined) ?? (envelope.statusCode as number | undefined) ?? 500;
  return Number(value);
}

/** Reads the message from a response envelope regardless of casing. */
export function envelopeMessage(envelope: Record<string, unknown>): string {
  return String((envelope.Message as string | undefined) ?? (envelope.message as string | undefined) ?? '');
}

/** Decodes a JWT payload without verifying its signature. */
export function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1] ?? '';
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}
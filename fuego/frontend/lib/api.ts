import { getToken } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado');
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) throw new UnauthorizedError();
  return res;
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await apiFetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data as T;
}

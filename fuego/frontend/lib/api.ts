export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado');
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, { ...options, credentials: 'include' });
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

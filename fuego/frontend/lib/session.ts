import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'fuego_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

function subscribeToToken(): () => void {
  return () => {};
}

function getServerToken(): string | null {
  return null;
}

/** Reads the auth token without causing a hydration mismatch (localStorage isn't available during SSR). */
export function useToken(): string | null {
  return useSyncExternalStore(subscribeToToken, getToken, getServerToken);
}

import { useEffect, useState } from 'react';

export interface Session {
  restaurantId: number;
}

export async function fetchSession(): Promise<Session | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

/** Consulta /api/auth/me; recibe `key` (el pathname) porque el layout que la usa persiste entre rutas y necesita re-consultar tras un login. */
export function useSession(key: string): Session | null | 'loading' {
  const [session, setSession] = useState<Session | null | 'loading'>('loading');

  useEffect(() => {
    fetchSession().then(setSession);
  }, [key]);

  return session;
}

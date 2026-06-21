'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiJson } from '@/lib/api';

export default function SystemLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiJson('/api/system/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/system');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-10 text-stone-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-stone-800 bg-white p-6 shadow-xl sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Sistema</p>
          <h1 className="text-2xl font-semibold tracking-tight">Panel interno</h1>
          <p className="text-sm leading-6 text-stone-600">Acceso privado para administrar los negocios registrados en Fuego.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-stone-800">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-stone-800">Contraseña</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-stone-950 px-4 py-3 font-medium text-white hover:bg-stone-800 focus:outline-2 focus:outline-stone-950 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Ingresando...' : 'Ingresar al sistema'}
        </button>
      </form>
    </main>
  );
}

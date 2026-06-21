'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiJson } from '@/lib/api';

export default function LoginPage() {
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
      await apiJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Acceso administrador</h1>
          <p className="text-sm leading-6 text-stone-600">
            Entrá para actualizar platos, precios, disponibilidad e imágenes de tu menú.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-stone-800">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-950 placeholder:text-stone-400 focus:border-orange-600 focus:outline-2 focus:outline-orange-600"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-stone-800">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-950 placeholder:text-stone-400 focus:border-orange-600 focus:outline-2 focus:outline-orange-600"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-700 px-4 py-3 font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-2 focus:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}

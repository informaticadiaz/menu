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
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="brand-card w-full max-w-md space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="brand-eyebrow">Sistema</p>
          <h1 className="brand-title text-2xl">Panel interno</h1>
          <p className="brand-copy">Acceso privado para administrar los negocios registrados en Fuego.</p>
        </div>
        <div className="field-group">
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" />
        </div>
        <div className="field-group">
          <label htmlFor="password" className="field-label">Contraseña</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" />
        </div>
        {error && <p className="notice notice-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
          {loading ? 'Ingresando...' : 'Ingresar al sistema'}
        </button>
      </form>
    </main>
  );
}

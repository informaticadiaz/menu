'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, apiJson } from '@/lib/api';
import type { SystemRestaurant } from '@/lib/types';

interface CreateRestaurantResponse {
  restaurant: SystemRestaurant;
}

export default function SystemPanel({ initialRestaurants }: { initialRestaurants: SystemRestaurant[] }) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<SystemRestaurant[]>(initialRestaurants);
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleLogout() {
    await apiFetch('/api/system/auth/logout', { method: 'POST' });
    router.push('/system/login');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const data = await apiJson<CreateRestaurantResponse>('/api/system/restaurants', {
        method: 'POST',
        body: JSON.stringify({ restaurantName, slug: slug || undefined, email, password }),
      });
      setRestaurants((prev) => [data.restaurant, ...prev]);
      setRestaurantName('');
      setSlug('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear negocio');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(restaurant: SystemRestaurant, status: SystemRestaurant['status']) {
    const action = status === 'paused' ? 'pause' : 'reactivate';
    await apiJson(`/api/system/restaurants/${restaurant.id}/${action}`, { method: 'POST' });
    setRestaurants((prev) => prev.map((item) => (item.id === restaurant.id ? { ...item, status } : item)));
  }

  async function handleDelete(restaurant: SystemRestaurant) {
    if (!window.confirm(`¿Eliminar el negocio "${restaurant.name}"? Esta acción no se puede deshacer.`)) return;
    await apiJson(`/api/system/restaurants/${restaurant.id}`, { method: 'DELETE' });
    setRestaurants((prev) => prev.filter((item) => item.id !== restaurant.id));
  }

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white p-5 text-stone-950 shadow-xl sm:p-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Sistema</p>
            <h1 className="text-2xl font-semibold tracking-tight">Negocios registrados</h1>
            <p className="text-sm leading-6 text-stone-600">Panel interno para crear, pausar, reactivar o eliminar negocios.</p>
          </div>
          <button onClick={handleLogout} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-2 focus:outline-stone-950">
            Cerrar sesión
          </button>
          <form onSubmit={handleCreate} className="space-y-3 border-t border-stone-200 pt-4">
            <h2 className="font-semibold tracking-tight">Crear negocio</h2>
            <input required placeholder="Nombre del negocio" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
            <input placeholder="slug opcional" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
            <input required type="email" placeholder="Email admin del negocio" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
            <input required type="password" placeholder="Contraseña inicial" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-stone-950 focus:outline-2 focus:outline-stone-950" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={saving} className="w-full rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 focus:outline-2 focus:outline-stone-950 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear negocio'}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white text-stone-950 shadow-xl">
          <div className="border-b border-stone-200 px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-stone-600">Total: {restaurants.length}</p>
          </div>
          <ul className="divide-y divide-stone-200">
            {restaurants.map((restaurant) => (
              <li key={restaurant.id} className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-semibold tracking-tight">{restaurant.name}</h2>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${restaurant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {restaurant.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="break-words text-sm text-stone-600">/{restaurant.slug}</p>
                  <p className="break-words text-sm text-stone-600">Admin: {restaurant.admin_email || 'Sin admin'}</p>
                  <p className="text-xs text-stone-500">Creado: {new Date(restaurant.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                  {restaurant.status === 'active' ? (
                    <button onClick={() => updateStatus(restaurant, 'paused')} className="rounded-full border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-2 focus:outline-amber-600">
                      Pausar
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(restaurant, 'active')} className="rounded-full border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-2 focus:outline-green-600">
                      Reactivar
                    </button>
                  )}
                  <button onClick={() => handleDelete(restaurant)} className="rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-2 focus:outline-red-600">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

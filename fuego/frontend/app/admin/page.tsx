'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiJson, UnauthorizedError } from '@/lib/api';
import { clearToken } from '@/lib/session';
import type { MenuItem } from '@/lib/types';
import MenuItemForm from './components/MenuItemForm';

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearToken();
    router.replace('/admin/login');
  }, [router]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ items: MenuItem[] }>('/api/admin/menu');
      setItems(data.items);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        handleUnauthorized();
        return;
      }
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function handleLogout() {
    clearToken();
    router.push('/admin/login');
  }

  function handleSaved(item: MenuItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
    setShowForm(false);
    setEditingItem(null);
  }

  async function handleToggleAvailable(item: MenuItem) {
    try {
      await apiJson(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ available: !item.available }),
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: !item.available } : i))
      );
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    try {
      await apiJson(`/api/menu-items/${item.id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      if (err instanceof UnauthorizedError) handleUnauthorized();
    }
  }

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category || 'General';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-3xl flex-1 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <button onClick={handleLogout} className="rounded border px-3 py-2 text-sm">
          Cerrar sesión
        </button>
      </div>

      {showForm ? (
        <MenuItemForm
          initial={editingItem}
          onSaved={handleSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      ) : (
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="rounded bg-black px-3 py-2 text-white"
        >
          Nuevo item
        </button>
      )}

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="space-y-2">
          <h2 className="text-lg font-medium">{category}</h2>
          <ul className="space-y-2">
            {categoryItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price}</p>
                  <span className={`text-xs ${item.available ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggleAvailable(item)} className="rounded border px-2 py-1 text-sm">
                    {item.available ? 'Marcar no disponible' : 'Marcar disponible'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowForm(true);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item)} className="rounded border px-2 py-1 text-sm text-red-600">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

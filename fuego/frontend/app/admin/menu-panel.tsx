'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, apiJson, UnauthorizedError } from '@/lib/api';
import type { MenuItem } from '@/lib/types';
import MenuItemForm from './components/MenuItemForm';

export default function MenuPanel({ initialItems }: { initialItems: MenuItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleUnauthorized() {
    router.replace('/admin/login');
  }

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
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
    <>
      <div className="brand-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-2">
          <p className="brand-eyebrow">Admin</p>
          <h1 className="brand-title text-2xl">Panel de administración</h1>
          <p className="brand-copy">Gestioná items, precios y disponibilidad del menú público.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary self-start text-sm sm:self-center">
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
          className="btn btn-primary px-5 py-3"
        >
          Nuevo item
        </button>
      )}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="space-y-3">
          <h2 className="border-b border-stone-200 pb-2 text-xl font-semibold tracking-tight text-stone-950">{category}</h2>
          <ul className="space-y-3">
            {categoryItems.map((item) => (
              <li key={item.id} className="brand-panel flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-semibold text-stone-950">{item.name}</p>
                  <p className="text-sm font-medium text-orange-800">${item.price}</p>
                  <span className={`badge ${item.available ? 'badge-success' : 'badge-muted'}`}>
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <button onClick={() => handleToggleAvailable(item)} className="btn btn-secondary px-3 py-2 text-sm">
                    {item.available ? 'Marcar no disponible' : 'Marcar disponible'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowForm(true);
                    }}
                    className="btn btn-secondary px-3 py-2 text-sm"
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(item)} className="btn btn-danger px-3 py-2 text-sm">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

'use client';

import { useState } from 'react';
import { apiFetch, apiJson } from '@/lib/api';
import type { MenuItem } from '@/lib/types';

interface Props {
  initial?: MenuItem | null;
  onSaved: (item: MenuItem) => void;
  onCancel: () => void;
}

export default function MenuItemForm({ initial, onSaved, onCancel }: Props) {
  const isEditing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'General');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [available, setAvailable] = useState(initial ? Boolean(initial.available) : true);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !price || Number(price) <= 0) {
      setError('Nombre y precio válido son requeridos');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || 'General',
        description,
        price: Number(price),
        image_url: imageUrl || null,
        available,
      };
      const item = initial
        ? await apiJson<MenuItem>(`/api/menu-items/${initial.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          }).then(() => ({ ...initial, ...payload }) as MenuItem)
        : await apiJson<MenuItem>('/api/menu-items', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      onSaved(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
          {isEditing ? 'Editar item' : 'Nuevo item'}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">
          {isEditing ? 'Actualizar plato' : 'Cargar plato al menú'}
        </h2>
        <p className="text-sm leading-6 text-stone-600">
          Completá la información visible para clientes y definí si el item está disponible.
        </p>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-800">Nombre</label>
        <input className="w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-2 focus:outline-orange-600" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-800">Categoría</label>
        <input className="w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-2 focus:outline-orange-600" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-800">Descripción</label>
        <textarea className="min-h-24 w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-2 focus:outline-orange-600" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-stone-800">Precio</label>
        <input type="number" min="0" step="0.01" className="w-full rounded-xl border border-stone-300 px-3 py-2.5 focus:border-orange-600 focus:outline-2 focus:outline-orange-600" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
        <label className="block text-sm font-medium text-stone-800">Imagen</label>
        <input className="w-full text-sm text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-60" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={uploading} />
        {uploading && <p className="text-sm text-stone-600">Subiendo imagen…</p>}
        {imageUrl && <p className="text-sm font-medium text-green-700">Imagen cargada correctamente</p>}
      </div>
      <label className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm font-medium text-stone-800">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4 accent-orange-700" />
        Disponible
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" disabled={saving || uploading} className="rounded-full bg-orange-700 px-5 py-3 font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-2 focus:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-stone-300 px-5 py-3 font-medium text-stone-700 hover:bg-stone-50 focus:outline-2 focus:outline-orange-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}

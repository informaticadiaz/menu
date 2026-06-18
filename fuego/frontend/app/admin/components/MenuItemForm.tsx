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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium">Nombre</label>
        <input className="w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">Categoría</label>
        <input className="w-full rounded border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">Descripción</label>
        <textarea className="w-full rounded border px-3 py-2" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">Precio</label>
        <input type="number" min="0" step="0.01" className="w-full rounded border px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium">Imagen</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={uploading} />
        {uploading && <p className="text-sm text-gray-500">Subiendo…</p>}
        {imageUrl && <p className="text-sm text-gray-500">Imagen cargada</p>}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
        Disponible
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving || uploading} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}

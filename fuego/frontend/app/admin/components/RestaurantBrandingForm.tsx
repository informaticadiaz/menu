'use client';

import { useState } from 'react';
import { apiFetch, apiJson } from '@/lib/api';
import type { Restaurant } from '@/lib/types';
import { PALETTES, DEFAULT_PALETTE_ID } from '@/lib/palettes';

interface Props {
  initial: Restaurant;
}

export default function RestaurantBrandingForm({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? '');
  const [logoUrl, setLogoUrl] = useState(initial.logo_url ?? '');
  const [paletteId, setPaletteId] = useState(initial.palette_id || DEFAULT_PALETTE_ID);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
      setLogoUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del negocio es requerido');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiJson('/api/admin/restaurant', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          description: description || null,
          logo_url: logoUrl || null,
          palette_id: paletteId,
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="brand-panel space-y-5 p-5 sm:p-6">
      <div className="space-y-2">
        <p className="brand-eyebrow">Tu negocio</p>
        <h2 className="brand-title text-xl">Datos del negocio</h2>
        <p className="brand-copy">Personalizá cómo aparece tu negocio en el menú público.</p>
      </div>
      <div className="field-group">
        <label className="field-label">Nombre del negocio</label>
        <input className="field-input" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
      </div>
      <div className="field-group">
        <label className="field-label">Descripción</label>
        <textarea
          className="field-textarea"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setSaved(false); }}
          placeholder="Descripción breve del negocio (opcional)"
        />
      </div>
      <div className="space-y-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
        <label className="field-label">Logo</label>
        {logoUrl && (
          <img src={logoUrl} alt="Logo del negocio" className="h-16 w-16 rounded-lg object-cover" />
        )}
        <input
          className="w-full text-sm text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-60"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleLogoChange}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-stone-600">Subiendo imagen…</p>}
        {logoUrl && !uploading && <p className="text-sm font-medium text-green-700">Logo cargado</p>}
      </div>
      <div className="field-group">
        <label className="field-label">Paleta de colores</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PALETTES.map((palette) => (
            <button
              key={palette.id}
              type="button"
              onClick={() => { setPaletteId(palette.id); setSaved(false); }}
              className={`rounded-xl border p-3 text-left transition ${
                paletteId === palette.id ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200'
              }`}
            >
              <div className="flex gap-1.5">
                <span className="h-6 w-6 rounded-full" style={{ background: palette.brand }} />
                <span className="h-6 w-6 rounded-full" style={{ background: palette.brandStrong }} />
                <span className="h-6 w-6 rounded-full border border-stone-200" style={{ background: palette.background }} />
              </div>
              <p className="mt-2 text-sm font-medium text-stone-800">{palette.name}</p>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">Datos guardados correctamente</p>}
      <button type="submit" disabled={saving || uploading} className="btn btn-primary px-5 py-3">
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}

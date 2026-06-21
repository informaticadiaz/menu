'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiJson } from '@/lib/api';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface FieldErrors {
  restaurantName?: string;
  slug?: string;
  email?: string;
  password?: string;
  form?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const publicMenuPath = slug ? `/menu/${slug}` : '/menu/tu-restaurante';

  function handleRestaurantNameChange(value: string) {
    setRestaurantName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (slug && !SLUG_PATTERN.test(slug)) {
      setErrors({ slug: 'El slug solo puede tener minúsculas, números y guiones' });
      return;
    }

    setLoading(true);
    try {
      await apiJson('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ restaurantName, slug: slug || undefined, email, password }),
      });
      router.push('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      if (message.toLowerCase().includes('slug')) {
        setErrors({ slug: message });
      } else if (message.toLowerCase().includes('email')) {
        setErrors({ email: message });
      } else {
        setErrors({ form: message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="brand-card w-full max-w-md space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="brand-eyebrow">Nuevo menú</p>
          <h1 className="brand-title text-2xl">Crear tu restaurante</h1>
          <p className="brand-copy">
            Estos datos crean tu cuenta admin y la dirección pública que vas a compartir con tus clientes.
          </p>
        </div>

        <div className="field-group">
          <label htmlFor="restaurantName" className="field-label">
            Nombre del restaurante
          </label>
          <input
            id="restaurantName"
            type="text"
            required
            value={restaurantName}
            onChange={(e) => handleRestaurantNameChange(e.target.value)}
            className="field-input"
          />
          {errors.restaurantName && <p className="text-sm text-red-600">{errors.restaurantName}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="slug" className="field-label">
            Slug (URL del menú)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="field-input"
          />
          <p className="notice bg-stone-50 text-stone-600">
            Tu menú público quedará en <span className="font-medium text-stone-900">{publicMenuPath}</span>.
          </p>
          {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="password" className="field-label">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>

        {errors.form && <p className="notice notice-error">{errors.form}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3"
        >
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  );
}

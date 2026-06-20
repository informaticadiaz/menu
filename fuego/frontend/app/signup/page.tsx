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
    <main className="flex flex-1 items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Crear tu restaurante</h1>

        <div className="space-y-1">
          <label htmlFor="restaurantName" className="block text-sm font-medium">
            Nombre del restaurante
          </label>
          <input
            id="restaurantName"
            type="text"
            required
            value={restaurantName}
            onChange={(e) => handleRestaurantNameChange(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errors.restaurantName && <p className="text-sm text-red-600">{errors.restaurantName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="slug" className="block text-sm font-medium">
            Slug (URL del menú)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  );
}

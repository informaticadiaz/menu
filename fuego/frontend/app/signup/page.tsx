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
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Nuevo menú</p>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Crear tu restaurante</h1>
          <p className="text-sm leading-6 text-stone-600">
            Estos datos crean tu cuenta admin y la dirección pública que vas a compartir con tus clientes.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="restaurantName" className="block text-sm font-medium text-stone-800">
            Nombre del restaurante
          </label>
          <input
            id="restaurantName"
            type="text"
            required
            value={restaurantName}
            onChange={(e) => handleRestaurantNameChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-950 placeholder:text-stone-400 focus:border-orange-600 focus:outline-2 focus:outline-orange-600"
          />
          {errors.restaurantName && <p className="text-sm text-red-600">{errors.restaurantName}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="slug" className="block text-sm font-medium text-stone-800">
            Slug (URL del menú)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-950 placeholder:text-stone-400 focus:border-orange-600 focus:outline-2 focus:outline-orange-600"
          />
          <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
            Tu menú público quedará en <span className="font-medium text-stone-900">{publicMenuPath}</span>.
          </p>
          {errors.slug && <p className="text-sm text-red-600">{errors.slug}</p>}
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
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
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
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>

        {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-orange-700 px-4 py-3 font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-2 focus:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  );
}

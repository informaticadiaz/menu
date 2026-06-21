import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { MenuItem } from '@/lib/types';
import MenuCategorySection from './components/MenuCategorySection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RestaurantMenu {
  restaurant_id: number;
  restaurant_name?: string;
  items: MenuItem[];
}

async function getRestaurantMenu(slug: string): Promise<RestaurantMenu | null> {
  const res = await fetch(`${API_URL}/api/menu/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al cargar el menú');
  return res.json();
}

function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items
    .filter((item) => !!item.available)
    .reduce<Record<string, MenuItem[]>>((acc, item) => {
      const key = item.category || 'General';
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const menu = await getRestaurantMenu(slug);
    if (!menu) return {};
    return { title: menu.restaurant_name || slug };
  } catch {
    return {};
  }
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let menu: RestaurantMenu | null;
  try {
    menu = await getRestaurantMenu(slug);
  } catch {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Fuego</p>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Algo salió mal</h1>
        <p className="leading-6 text-stone-600">No pudimos cargar el menú. Probá de nuevo más tarde.</p>
      </main>
    );
  }

  if (!menu) notFound();

  const grouped = groupByCategory(menu.items);
  const categories = Object.entries(grouped);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-10">
      <header className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Menú digital</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          {menu.restaurant_name || slug}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
          Elegí tu plato y consultá al equipo del restaurante para confirmar disponibilidad.
        </p>
      </header>
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-stone-600">
          No hay items disponibles en este momento.
        </div>
      ) : (
        categories.map(([category, items]) => (
          <MenuCategorySection key={category} category={category} items={items} />
        ))
      )}
    </main>
  );
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { MenuItem, Restaurant } from '@/lib/types';
import { paletteCssVars } from '@/lib/palettes';
import MenuPanel from './menu-panel';
import RestaurantBrandingForm from './components/RestaurantBrandingForm';
import MenuQrCode from './components/MenuQrCode';

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

async function getMenuItems(cookieHeader: string): Promise<MenuItem[] | null> {
  const res = await fetch(`${BACKEND_INTERNAL_URL}/api/admin/menu`, {
    headers: { Cookie: cookieHeader },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Error al cargar el menú');
  const data = await res.json();
  return data.items;
}

async function getRestaurant(cookieHeader: string): Promise<Restaurant | null> {
  const res = await fetch(`${BACKEND_INTERNAL_URL}/api/admin/restaurant`, {
    headers: { Cookie: cookieHeader },
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return data.restaurant;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [items, restaurant] = await Promise.all([
    getMenuItems(cookieHeader),
    getRestaurant(cookieHeader),
  ]);

  if (!items) redirect('/admin/login');

  return (
    <main
      className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-10"
      style={restaurant ? paletteCssVars(restaurant.palette_id) : undefined}
    >
      {restaurant && <RestaurantBrandingForm initial={restaurant} />}
      {restaurant && <MenuQrCode slug={restaurant.slug} />}
      <MenuPanel initialItems={items} />
    </main>
  );
}

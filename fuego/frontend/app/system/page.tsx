import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SystemRestaurant } from '@/lib/types';
import SystemPanel from './system-panel';

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

async function getRestaurants(): Promise<SystemRestaurant[] | null> {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_INTERNAL_URL}/api/system/restaurants`, {
    headers: { Cookie: cookieStore.toString() },
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error('Error al cargar los negocios');
  const data = await res.json();
  return data.restaurants;
}

export default async function SystemPage() {
  const restaurants = await getRestaurants();
  if (!restaurants) redirect('/system/login');

  return <SystemPanel initialRestaurants={restaurants} />;
}

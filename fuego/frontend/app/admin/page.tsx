import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { MenuItem } from '@/lib/types';
import MenuPanel from './menu-panel';

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

async function getMenuItems(): Promise<MenuItem[] | null> {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_INTERNAL_URL}/api/admin/menu`, {
    headers: { Cookie: cookieStore.toString() },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Error al cargar el menú');
  const data = await res.json();
  return data.items;
}

export default async function AdminPage() {
  const items = await getMenuItems();
  if (!items) redirect('/admin/login');

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <MenuPanel initialItems={items} />
    </main>
  );
}

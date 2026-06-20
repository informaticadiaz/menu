'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToken } from '@/lib/session';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const token = useToken();
  const ready = isLoginPage || token !== null;

  useEffect(() => {
    if (!isLoginPage && !token) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, token, router]);

  if (!ready) return null;
  return <>{children}</>;
}

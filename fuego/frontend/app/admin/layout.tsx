'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const session = useSession(pathname);
  const ready = isLoginPage || session !== 'loading';

  useEffect(() => {
    if (!isLoginPage && session === null) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, session, router]);

  if (!ready) return null;
  return <>{children}</>;
}

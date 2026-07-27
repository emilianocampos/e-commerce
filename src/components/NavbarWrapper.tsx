'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { AdminNavbar } from './AdminNavbar';
import { User } from '@supabase/supabase-js';

interface NavbarWrapperProps {
  user: User | null;
  role: string | null;
  settings?: any;
}

export function NavbarWrapper({ user, role, settings }: NavbarWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminNavbar userEmail={user?.email} />;
  }

  return <Navbar user={user} role={role} settings={settings} />;
}

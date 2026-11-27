'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { AdminNavbar } from './AdminNavbar';
import { User } from '@supabase/supabase-js';
import { Brand } from '@/types/product';
import { createClient } from '@/lib/supabase-client';

interface NavbarWrapperProps {
  user?: User | null;
  role?: string | null;
  settings?: any;
  brands?: Brand[];
}

export function NavbarWrapper({ user: initialUser, role: initialRole, settings, brands }: NavbarWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [role, setRole] = useState<string | null>(initialRole ?? null);

  useEffect(() => {
    if (initialUser !== undefined) return;

    const supabase = createClient();
    const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('-auth-token');

    const syncUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser ?? null);
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();
        setRole(profile?.role || 'user');
      } else {
        setRole(null);
      }
    };

    if (hasAuthCookie) {
      syncUser();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUser();
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser]);

  if (isAdminRoute) {
    return <AdminNavbar userEmail={user?.email} settings={settings} />;
  }

  return <Navbar user={user} role={role} settings={settings} initialBrands={brands} />;
}

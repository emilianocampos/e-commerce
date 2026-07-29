'use client';

import Link from 'next/link';
import { logout } from '@/actions/auth';
import { LogOut } from 'lucide-react';

export function AdminNavbar({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/admin" className="font-black text-2xl tracking-tighter text-zinc-900 flex items-center">
          DRAVENIX <span className="text-sm font-normal text-zinc-500 ml-2">Admin Panel</span>
        </Link>
        <div className="flex items-center gap-4">
          {userEmail && <span className="text-sm font-medium text-zinc-600 hidden sm:inline-block">{userEmail}</span>}
          <form action={logout}>
            <button type="submit" className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

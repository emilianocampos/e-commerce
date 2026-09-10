'use client';

import Link from 'next/link';
import { logout } from '@/actions/auth';
import { LogOut } from 'lucide-react';

export function AdminNavbar({ userEmail, settings }: { userEmail?: string; settings?: any }) {
  const storeName = settings?.store_logo_text || 'KLONFARK';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950 text-white shadow-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/admin" className="font-black text-xl sm:text-2xl tracking-tighter text-white flex items-center gap-2 group">
          <span className="text-white group-hover:text-zinc-200 transition-colors">{storeName}</span>
          <span className="text-xs sm:text-sm font-semibold text-white bg-zinc-800/90 border border-zinc-700 px-2.5 py-0.5 rounded-full">
            Admin Panel
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          {userEmail && (
            <span className="text-xs sm:text-sm font-medium text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl hidden sm:inline-block shadow-xs">
              {userEmail}
            </span>
          )}
          <form action={logout}>
            <button 
              type="submit" 
              className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 text-xs sm:text-sm font-bold transition-all border border-zinc-700 shadow-sm cursor-pointer"
            >
              <LogOut size={16} className="text-zinc-200" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}


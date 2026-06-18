/**
 * Archivo: src/components/Navbar.tsx
 * Responsabilidad: Es el componente de navegación principal de la app.
 * Al usar estado (como para abrir/cerrar menú móvil) se declara como 'use client'.
 * Recibe por props los datos de la sesión obtenidos del servidor para mostrar menús condicionalmente.
 */
'use client';

import Link from 'next/link';
import { ShoppingCart, LogOut, User as UserIcon, Menu, X, ShieldAlert } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { User } from '@supabase/supabase-js';
import { logout } from '@/actions/auth';
import { useState } from 'react';
import { Button } from './Button';

interface NavbarProps {
  user: User | null; // El usuario actualmente autenticado (o null si es anónimo)
  role: string | null; // El rol de este usuario (ej. 'admin')
}

export function Navbar({ user, role }: NavbarProps) {
  // 1. Usamos nuestro Store global de Zustand para contar cuántos elementos hay en el carrito
  const cartItems = useCartStore((state) => state.items);
  // Reducimos el array de items a un solo número sumando sus cantidades
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 2. Estado local para saber si el menú móvil (hamburguesa) está abierto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Lado izquierdo: Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            E
          </div>
          <span>Commerce</span>
        </Link>

        {/* Lado derecho: Acciones (Carrito, Login/Perfil, Menú Móvil) */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Lógica si es Admin: Mostrar un botón rojo hacia el Panel */}
          {role === 'admin' && (
            <Link href="/admin" className="hidden md:flex">
              <Button variant="danger" size="sm" className="gap-2">
                <ShieldAlert className="h-4 w-4" />
                Panel Admin
              </Button>
            </Link>
          )}

          {/* Icono del Carrito (Solo visible si no es admin) */}
          {role !== 'admin' && (
            <Link
              href="/carrito"
              className="relative rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* Si hay items, renderizamos la "burbuja" roja con la cantidad */}
              {totalItems > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Lógica de sesión: Si está logueado mostramos su email y botón de logout */}
          {user ? (
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                <UserIcon className="h-4 w-4" />
                <span className="hidden lg:inline">{user.email}</span>
              </div>
              {/* Al hacer clic en salir, llamamos a la Server Action 'logout' */}
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="gap-2 text-zinc-500 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </form>
            </div>
          ) : (
            /* Si NO está logueado, mostramos el botón de iniciar sesión */
            <div className="hidden md:flex">
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}

          {/* Botón menú hamburguesa en mobile */}
          <button
            className="md:hidden rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú Móvil Expandido */}
      {isMobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {role === 'admin' && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="danger" className="w-full justify-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Panel Administrador
                </Button>
              </Link>
            )}

            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 text-sm text-zinc-600">
                  <UserIcon className="h-4 w-4" />
                  {user.email}
                </div>
                <form action={logout} className="w-full" onSubmit={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" type="submit" className="w-full justify-center gap-2 text-zinc-600">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  DollarSign,
  ShoppingBag,
  Users,
  Tag,
  FolderTree,
  QrCode,
  Palette,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/crear', label: 'Crear Producto', icon: PlusCircle },
  { href: '/admin/ventas', label: 'Ventas', icon: DollarSign },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/marcas', label: 'Marcas', icon: Tag },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { href: '/admin/qr', label: 'Código QR', icon: QrCode, badge: 'Nuevo' },
  { href: '/admin/personalizar', label: 'Personalizar Web', icon: Palette, highlight: true },
];

export function AdminNavigation({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const activeItem = NAV_ITEMS.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)));

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* HEADER MOBILE (Visibilidad solo en dispositivos móviles) */}
      <header className="md:hidden sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-800 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">Panel Admin</span>
              <span className="text-[10px] font-semibold text-emerald-400 block -mt-0.5">
                {activeItem?.label || 'Dravenix'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Abrir Menú de Administración"
          >
            {isOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Barra de Acceso Rápido Scrollable Horizontal en Mobile */}
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-t border-zinc-800/80 no-scrollbar text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* DRAWER SLIDE-OVER PARA MOBILE */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop con desenfoque */}
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-zinc-950 text-white border-r border-zinc-800 z-10 shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm tracking-tight text-white">Menú Principal</span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                        : item.highlight
                        ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40 hover:bg-blue-900/40'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-600'}`} />
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 text-center">
              <Link
                href="/"
                className="block text-xs font-semibold text-emerald-400 hover:underline"
              >
                &larr; Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR PARA PANTALLAS MEDIANAS / DESKTOP (md+) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 bg-white shrink-0">
        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-emerald-400 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-zinc-900 text-sm">Panel Admin</h2>
            <p className="text-[11px] font-medium text-zinc-500">Gestión de E-Commerce</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm font-bold'
                    : item.highlight
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100/70'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <Link
            href="/"
            className="block text-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline"
          >
            &larr; Ir a la Tienda
          </Link>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL ADAPTABLE */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

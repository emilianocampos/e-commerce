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
  Crown,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/crear', label: 'Crear Producto', icon: PlusCircle },
  { href: '/admin/vip', label: 'Tarjetas VIP', icon: Crown, badge: 'VIP' },
  { href: '/admin/ventas', label: 'Ventas', icon: DollarSign },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/marcas', label: 'Marcas', icon: Tag },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { href: '/admin/qr', label: 'Código QR', icon: QrCode, badge: 'Nuevo' },
  { href: '/admin/personalizar', label: 'Personalizar Web', icon: Palette, highlight: true },
];

export function AdminNavigation({ children, themeMode = 'light' }: { children: React.ReactNode; themeMode?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isDark = themeMode === 'dark';

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const activeItem = NAV_ITEMS.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)));

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-[#f1f4f9] text-slate-900'}`}>
      {/* HEADER MOBILE (Visibilidad solo en dispositivos móviles) */}
      <header className={`md:hidden sticky top-0 z-40 border-b shadow-xs ${isDark ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-white text-slate-900 border-slate-200/80'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-blue-50 border border-blue-100 text-blue-600'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className={`font-bold text-sm tracking-tight block ${isDark ? 'text-white' : 'text-slate-900'}`}>Panel Admin</span>
              <span className={`text-[10px] font-semibold block -mt-0.5 ${isDark ? 'text-emerald-400' : 'text-blue-600'}`}>
                {activeItem?.label || 'Klonfark'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}
            aria-label="Abrir Menú de Administración"
          >
            {isOpen ? <X className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-slate-900'}`} /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Barra de Acceso Rápido Scrollable Horizontal en Mobile */}
        <div className={`flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-t no-scrollbar text-xs ${isDark ? 'border-zinc-800/80 bg-zinc-950' : 'border-slate-100 bg-slate-50/80'}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? (isDark ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs' : 'bg-blue-600 text-white font-bold shadow-xs')
                    : (isDark ? 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:bg-zinc-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100')
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMenu}
          />

          <div className={`relative flex-1 flex flex-col max-w-xs w-full border-r z-10 shadow-2xl ${isDark ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-white text-slate-900 border-slate-200'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/60'}`}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-blue-600'}`} />
                <span className="font-bold text-sm tracking-tight">Menú Principal</span>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className={`p-1.5 rounded-xl ${isDark ? 'text-zinc-400 hover:text-white bg-zinc-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? (isDark ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md' : 'bg-blue-50 text-blue-600 font-bold shadow-xs')
                        : (isDark ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-zinc-950' : 'text-blue-600') : (isDark ? 'text-zinc-400' : 'text-slate-400')}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isActive
                            ? (isDark ? 'bg-zinc-950 text-emerald-400' : 'bg-blue-600 text-white')
                            : (isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-100 text-blue-700')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className={`p-4 border-t text-center ${isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
              <Link
                href="/"
                className={`block text-xs font-semibold hover:underline ${isDark ? 'text-emerald-400' : 'text-blue-600'}`}
              >
                &larr; Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR FLOTANTE REDONDEADA PARA DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 p-4 shrink-0">
        <div className={`flex flex-col h-full rounded-3xl shadow-sm border transition-all ${
          isDark 
            ? 'bg-zinc-900/90 border-zinc-800 text-white' 
            : 'bg-white border-slate-200/80 text-slate-800'
        }`}>
          {/* Header del Sidebar */}
          <div className={`p-5 flex items-center gap-3 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${
              isDark ? 'bg-zinc-800 border border-zinc-700 text-emerald-400' : 'bg-blue-50 border border-blue-100 text-blue-600'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight leading-tight">Panel Admin</h2>
              <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>Gestión E-Commerce</p>
            </div>
          </div>

          {/* Lista de Navegación */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? (isDark 
                          ? 'bg-zinc-800 text-white shadow-xs font-bold border border-zinc-700' 
                          : 'bg-blue-50 text-blue-600 shadow-xs font-bold border border-blue-100')
                      : item.highlight
                      ? (isDark 
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50' 
                          : 'bg-slate-50 text-slate-700 border border-slate-200/60 hover:bg-blue-50/50 hover:text-blue-600')
                      : (isDark 
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? (isDark ? 'text-emerald-400' : 'text-blue-600') 
                        : (isDark ? 'text-zinc-500' : 'text-slate-400')
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isActive 
                        ? (isDark ? 'bg-zinc-700 text-white' : 'bg-blue-600 text-white') 
                        : (isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Pie del Sidebar */}
          <div className={`p-4 border-t text-center ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
            <Link
              href="/"
              className={`block text-xs font-semibold hover:underline ${
                isDark ? 'text-zinc-400 hover:text-emerald-400' : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              &larr; Ir a la Tienda
            </Link>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL ADAPTABLE */}
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden ${
        isDark ? 'bg-zinc-950 text-white' : 'bg-[#f1f4f9] text-slate-900'
      }`}>
        {children}
      </main>
    </div>
  );
}

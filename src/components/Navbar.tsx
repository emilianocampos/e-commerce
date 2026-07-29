'use client';

import Link from 'next/link';
import { ShoppingBag, User as UserIcon, Menu, X, Search, ShieldAlert } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { User } from '@supabase/supabase-js';
import { logout } from '@/actions/auth';
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';

interface NavbarProps {
  user: User | null;
  role: string | null;
  settings?: any;
}

export function Navbar({ user, role, settings }: NavbarProps) {
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {showBanner && (
        <div className={styles.banner}>
          {settings?.top_banner_text || 'Sign up and get 20% off to your first order.'}
          <button className={styles.bannerClose} onClick={() => setShowBanner(false)}>
            <X size={16} />
          </button>
        </div>
      )}
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.container}>
          
          {/* Left: Hamburger (Mobile) + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className={styles.logo}>
              {settings?.store_logo_url ? (
                <img src={settings.store_logo_url} alt={settings?.store_logo_text || 'Logo'} style={{ height: '48px', objectFit: 'contain' }} />
              ) : (
                settings?.store_logo_text || 'DRAVENIX'
              )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            <Link href="/shop?type=SUPPLEMENT" className={styles.navLink}>Suplementos</Link>
            <Link href="/shop?gender=MEN" className={styles.navLink}>Hombre</Link>
            <Link href="/shop?gender=WOMEN" className={styles.navLink}>Mujer</Link>
            <Link href="/shop?category_name=urbano" className={styles.navLink}>Urbano</Link>
          </nav>

          {/* Center: Search */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className={styles.searchInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value;
                  if (val.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(val.trim())}`;
                  }
                }
              }}
            />
          </div>

          {/* Right: Actions */}
          <div className={styles.actions}>
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} hidden md:flex`}>
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            )}
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} hidden md:flex`}>
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
            )}

            {role === 'admin' && (
              <Link href="/admin" className={styles.actionBtn} style={{ color: 'var(--shop-red)' }}>
                <ShieldAlert size={24} />
              </Link>
            )}

            {user ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={styles.actionBtn}
                >
                  <UserIcon size={24} />
                </button>
                {isUserMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '40px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', width: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
                      {user.email}
                    </div>
                    {role === 'admin' && (
                      <Link href="/admin" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: 'black' }}>
                        Panel de Administrador
                      </Link>
                    )}
                    {role !== 'admin' && (
                      <Link href="/mis-pedidos" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: 'black' }}>
                        Mis Pedidos
                      </Link>
                    )}
                    <form action={logout}>
                      <button type="submit" style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Cerrar Sesión
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.actionBtn}>
                <UserIcon size={24} />
              </Link>
            )}

            {role !== 'admin' && (
              <Link
                href="/carrito"
                className={styles.actionBtn}
                aria-label="Ver carrito"
              >
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                  <span className={styles.badge}>{totalItems}</span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setIsMobileMenuOpen(false)}></div>
            <div style={{ width: '80%', maxWidth: '300px', backgroundColor: 'white', height: '100%', position: 'absolute', left: 0, top: 0, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span className={styles.logo}>
                  {settings?.store_logo_url ? (
                    <img src={settings.store_logo_url} alt={settings?.store_logo_text || 'Logo'} style={{ height: '36px', objectFit: 'contain' }} />
                  ) : (
                    settings?.store_logo_text || 'DRAVENIX'
                  )}
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <div className={styles.mobileSearchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Buscar productos..." 
                  className={styles.searchInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value;
                      if (val.trim()) {
                        setIsMobileMenuOpen(false);
                        window.location.href = `/shop?q=${encodeURIComponent(val.trim())}`;
                      }
                    }
                  }}
                />
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link href="/shop?type=SUPPLEMENT" onClick={() => setIsMobileMenuOpen(false)} className={styles.navLink}>Suplementos</Link>
                <Link href="/shop?gender=MEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.navLink}>Hombre</Link>
                <Link href="/shop?gender=WOMEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.navLink}>Mujer</Link>
                <Link href="/shop?category_name=urbano" onClick={() => setIsMobileMenuOpen(false)} className={styles.navLink}>Urbano</Link>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

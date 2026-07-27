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
                <img src={settings.store_logo_url} alt={settings?.store_logo_text || 'Logo'} style={{ height: '32px', objectFit: 'contain' }} />
              ) : (
                settings?.store_logo_text || 'SHOP.CO'
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
                    <img src={settings.store_logo_url} alt={settings?.store_logo_text || 'Logo'} style={{ height: '24px', objectFit: 'contain' }} />
                  ) : (
                    settings?.store_logo_text || 'SHOP.CO'
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

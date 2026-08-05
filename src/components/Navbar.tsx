'use client';

import Link from 'next/link';
import { ShoppingBag, User as UserIcon, Menu, X, Search, ShieldAlert, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { User } from '@supabase/supabase-js';
import { logout } from '@/actions/auth';
import { useState, useEffect, useRef } from 'react';
import { getBrands } from '@/actions/brands';
import { Brand } from '@/types/product';
import { NotificationBell } from './NotificationBell';
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
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [mobileSuplementosOpen, setMobileSuplementosOpen] = useState(false);
  const [mobileUrbanoOpen, setMobileUrbanoOpen] = useState(false);

  useEffect(() => {
    getBrands().then(setBrands);
  }, []);

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
            <div className={styles.dropdown}>
              <Link href="/shop?type=SUPPLEMENT" className={styles.navLink}>Suplementos <ChevronDown size={14} /></Link>
              <div className={styles.dropdownContent}>
                <Link href="/shop?type=SUPPLEMENT" className={styles.dropdownItem}>Todos los suplementos</Link>
                {brands.map(brand => (
                  <Link key={brand.id} href={`/shop?type=SUPPLEMENT&brand_id=${brand.id}`} className={styles.dropdownItem}>{brand.name}</Link>
                ))}
              </div>
            </div>
            
            <Link href="/shop?gender=MEN" className={styles.navLink}>Hombre</Link>
            <Link href="/shop?gender=WOMEN" className={styles.navLink}>Mujer</Link>
            
            <div className={styles.dropdown}>
              <Link href="/shop?category_name=urbano" className={styles.navLink}>Urbano <ChevronDown size={14} /></Link>
              <div className={styles.dropdownContent}>
                <Link href="/shop?category_name=urbano" className={styles.dropdownItem}>Todos</Link>
                <Link href="/shop?category_name=urbano&urbano_category=UNISEX" className={styles.dropdownItem}>Unisex</Link>
                <Link href="/shop?category_name=urbano&urbano_category=MEN" className={styles.dropdownItem}>Hombre</Link>
                <Link href="/shop?category_name=urbano&urbano_category=WOMEN" className={styles.dropdownItem}>Mujer</Link>
              </div>
            </div>
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
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} hidden md:flex`} aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} hidden md:flex`} aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}

            {role === 'admin' && (
              <Link href="/admin" className={styles.actionBtn} style={{ color: 'var(--shop-red)' }}>
                <ShieldAlert size={24} />
              </Link>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <NotificationBell />
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
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className={styles.mobileAccordeon}>
                  <button onClick={() => setMobileSuplementosOpen(!mobileSuplementosOpen)} className={styles.mobileAccordeonHeader}>
                    Suplementos <ChevronDown size={16} style={{ transform: mobileSuplementosOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                  {mobileSuplementosOpen && (
                    <div className={styles.mobileAccordeonContent}>
                      <Link href="/shop?type=SUPPLEMENT" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>Todos los suplementos</Link>
                      {brands.map(brand => (
                        <Link key={brand.id} href={`/shop?type=SUPPLEMENT&brand_id=${brand.id}`} onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>{brand.name}</Link>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link href="/shop?gender=MEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonHeader} style={{ paddingLeft: '0' }}>Hombre</Link>
                <Link href="/shop?gender=WOMEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonHeader} style={{ paddingLeft: '0' }}>Mujer</Link>
                
                <div className={styles.mobileAccordeon}>
                  <button onClick={() => setMobileUrbanoOpen(!mobileUrbanoOpen)} className={styles.mobileAccordeonHeader}>
                    Urbano <ChevronDown size={16} style={{ transform: mobileUrbanoOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                  {mobileUrbanoOpen && (
                    <div className={styles.mobileAccordeonContent}>
                      <Link href="/shop?category_name=urbano" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>Todos</Link>
                      <Link href="/shop?category_name=urbano&urbano_category=UNISEX" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>Unisex</Link>
                      <Link href="/shop?category_name=urbano&urbano_category=MEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>Hombre</Link>
                      <Link href="/shop?category_name=urbano&urbano_category=WOMEN" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileAccordeonItem}>Mujer</Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

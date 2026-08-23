'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export function ClearCartOnSuccess() {
  useEffect(() => {
    // Vaciar el carrito en zustand y en localStorage
    useCartStore.getState().clearCart();
    try {
      localStorage.removeItem('ecommerce-cart');
    } catch (e) {
      // ignore
    }
  }, []);

  return null;
}

'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export function ClearCartOnSuccess() {
  useEffect(() => {
    useCartStore.getState().clearCart();
  }, []);

  return null;
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { createCheckoutPreference } from '@/actions/mercadopago';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';
import { ArrowRight } from 'lucide-react';
import styles from './Cart.module.css';

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { items } = useCartStore();
  const router = useRouter();

  const handleBuy = async () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    try {
      const cartItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));
      
      const response = await createCheckoutPreference(cartItems);

      if (response.requireLogin) {
        showToast.warning('Debes iniciar sesión para poder continuar con la compra.', { position: 'top-center' });
        router.push('/login');
        return;
      }

      if (response.error) {
        showToast.error(response.error, { position: 'top-center' });
        return;
      }

      if (response.init_point) {
        // Redirigir al usuario al flujo de pago seguro de Mercado Pago
        window.location.href = response.init_point;
      }
    } catch (error) {
      console.error(error);
      showToast.error('Hubo un problema al inicializar la compra.', { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={isLoading || items.length === 0}
      className={styles.checkoutBtn}
    >
      {isLoading ? 'Conectando...' : (
        <>
          Pagar con Mercado Pago <ArrowRight size={20} />
        </>
      )}
    </button>
  );
}

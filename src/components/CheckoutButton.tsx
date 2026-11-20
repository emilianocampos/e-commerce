'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { createCheckoutPreference } from '@/actions/mercadopago';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';
import { ArrowRight } from 'lucide-react';
import styles from './Cart.module.css';
import { trackMetaEvent } from '@/lib/meta-pixel';

interface CheckoutButtonProps {
  vipCardCode?: string;
  isTransferPromo?: boolean;
  promoCode?: string;
}

export function CheckoutButton({ vipCardCode, isTransferPromo, promoCode }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { items } = useCartStore();
  const router = useRouter();

  const handleBuy = async (overridePhone?: string) => {
    if (items.length === 0) return;

    if (!overridePhone) {
      const contents = items.map((item) => {
        const unitPrice = item.product.sale_price && item.product.sale_price < item.product.price
          ? item.product.sale_price
          : item.product.price;
        return {
          id: item.product.id,
          quantity: item.quantity,
          item_price: Number(unitPrice),
        };
      });
      const totalValue = contents.reduce((acc, c) => acc + c.item_price * c.quantity, 0);
      const numItems = contents.reduce((acc, c) => acc + c.quantity, 0);

      trackMetaEvent('InitiateCheckout', {
        content_ids: contents.map((c) => c.id),
        contents,
        content_type: 'product',
        num_items: numItems,
        value: totalValue,
        currency: 'ARS',
      });
    }
    
    setIsLoading(true);
    try {
      const cartItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));
      
      const response = await createCheckoutPreference(cartItems, {
        vipCardCode,
        isTransferPromo,
        promoCode,
        phone: overridePhone,
      });

      if (response.requireLogin) {
        showToast.warning('Debes iniciar sesión para poder continuar con la compra.', { position: 'top-center' });
        router.push('/login');
        return;
      }

      if (response.requirePhone) {
        setIsLoading(false);
        const Swal = (await import('sweetalert2')).default;
        const { value: phone, isConfirmed } = await Swal.fire({
          title: '📱 Teléfono requerido',
          text: response.message || 'Ingresa tu número de teléfono o WhatsApp para coordinar el despacho antes de pagar:',
          input: 'tel',
          inputPlaceholder: 'Ej: 2804123456',
          showCancelButton: true,
          confirmButtonText: 'Guardar y Pagar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#71717a',
          inputValidator: (val) => {
            const digits = (val || '').replace(/\D/g, '');
            if (!digits || digits.length < 6) {
              return 'Por favor ingresa un número de teléfono válido (mínimo 6 dígitos).';
            }
          }
        });

        if (isConfirmed && phone) {
          setIsLoading(true);
          const { updateUserPhone } = await import('@/actions/profile');
          const saveRes = await updateUserPhone(phone);
          if (!saveRes.success) {
            showToast.error(saveRes.error || 'Error al guardar el teléfono', { position: 'top-center' });
            setIsLoading(false);
            return;
          }
          showToast.success('¡Teléfono guardado! Conectando...', { position: 'top-center' });
          return handleBuy(phone);
        }
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
      onClick={() => handleBuy()}
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

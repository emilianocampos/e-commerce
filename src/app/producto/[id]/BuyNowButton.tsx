'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { createCheckoutPreference } from '@/actions/mercadopago';
import { showToast } from 'nextjs-toast-notify';

interface BuyNowButtonProps {
  productId: string;
}

export function BuyNowButton({ productId }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const response = await createCheckoutPreference([{ productId, quantity: 1 }]);

      if (response.requireLogin) {
        showToast.warning('Debes iniciar sesión para comprar este producto.', { position: 'top-center' });
        window.location.href = '/login';
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
          return handleBuy();
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
    <Button
      size="lg"
      onClick={handleBuy}
      disabled={isLoading}
      // Se utiliza un color similar al branding de Mercado Pago para mayor confianza
      className="w-full bg-[#009ee3] hover:bg-[#0086c9] text-white transition-colors"
    >
      {isLoading ? 'Conectando con Mercado Pago...' : 'Comprar con Mercado Pago'}
    </Button>
  );
}

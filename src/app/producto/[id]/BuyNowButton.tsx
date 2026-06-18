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

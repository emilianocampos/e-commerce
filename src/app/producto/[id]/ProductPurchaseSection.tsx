'use client';

import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { MercadoPagoLogo } from '@/components/MercadoPagoLogo';
import { Truck } from 'lucide-react';

interface ProductPurchaseSectionProps {
  product: any;
  initialCurrentPrice: number;
  initialOriginalPrice: number | null;
  initialHasDiscount: boolean;
  initialDiscountPercent: number;
}

export function ProductPurchaseSection({
  product,
  initialCurrentPrice,
  initialOriginalPrice,
  initialHasDiscount,
  initialDiscountPercent,
}: ProductPurchaseSectionProps) {
  const transferPrice = Math.round(initialCurrentPrice * 0.9);
  const installmentPrice = Math.round(initialCurrentPrice / 3);

  return (
    <div className="flex flex-col">
      {/* Price Display */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-white">{formatCurrency(initialCurrentPrice)}</span>
          {initialHasDiscount && initialOriginalPrice && (
            <>
              <span className="text-2xl font-bold text-zinc-500 line-through">{formatCurrency(initialOriginalPrice)}</span>
              <span className="bg-[#FF3333]/20 text-[#FF5555] px-3 py-1 rounded-full text-sm font-bold border border-[#FF3333]/30">
                -{initialDiscountPercent}%
              </span>
            </>
          )}
        </div>

        {/* 10% por Transferencia */}
        <div className="inline-flex items-center bg-amber-500 text-zinc-950 font-extrabold text-sm sm:text-base px-4 py-2 rounded-xl shadow-md w-fit tracking-tight">
          {formatCurrency(transferPrice)} por Transferencia
        </div>

        {/* 3 cuotas con Mercado Pago */}
        <div className="flex flex-col gap-1 text-sm text-zinc-300 mt-1">
          <span>3 cuotas de <strong className="text-white font-bold">{formatCurrency(installmentPrice)}</strong> sin interés</span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
            <span>con</span>
            <MercadoPagoLogo height={16} />
          </div>
        </div>
      </div>

      <AddToCartButton product={product} />

      {/* Shipping Box info */}
      <div className="mt-6 mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-zinc-100 text-sm">
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Tiempos de Envío y Entrega</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400 pt-1">
          <li>🚀 <strong>Trelew:</strong> Envíos en el día</li>
          <li>🚚 <strong>Zonas aledañas:</strong> 1 día de demora</li>
          <li>📦 <strong>Resto de Chubut:</strong> 2 a 5 días</li>
          <li>✈️ <strong>Interior del país:</strong> 3 a 7 días</li>
        </ul>
      </div>
    </div>
  );
}

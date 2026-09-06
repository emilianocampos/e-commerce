'use client';

import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';

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
  return (
    <div className="flex flex-col">
      {/* Price Display */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-zinc-900">{formatCurrency(initialCurrentPrice)}</span>
          {initialHasDiscount && initialOriginalPrice && (
            <>
              <span className="text-3xl font-bold text-zinc-400 line-through">{formatCurrency(initialOriginalPrice)}</span>
              <span className="bg-[#FF3333]/10 text-[#FF3333] px-3 py-1 rounded-full text-sm font-medium">
                -{initialDiscountPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      <AddToCartButton product={product} />
    </div>
  );
}

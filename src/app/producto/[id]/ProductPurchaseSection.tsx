'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { validateDiscountCode } from '@/actions/settings';
import { Tag } from 'lucide-react';

interface ProductPurchaseSectionProps {
  product: any; // Using any for simplicity as it includes relations in the query
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
  const [currentPrice, setCurrentPrice] = useState(initialCurrentPrice);
  const [originalPrice, setOriginalPrice] = useState(initialOriginalPrice);
  const [hasDiscount, setHasDiscount] = useState(initialHasDiscount);
  const [discountPercent, setDiscountPercent] = useState(initialDiscountPercent);
  
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountMessage, setDiscountMessage] = useState({ text: '', isError: false });

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage({ text: 'Ingresa un código', isError: true });
      return;
    }

    setDiscountLoading(true);
    setDiscountMessage({ text: '', isError: false });

    const res = await validateDiscountCode(discountCode);
    
    if (res.success && res.percentage) {
      setDiscountApplied(true);
      setDiscountMessage({ text: `¡Descuento del ${res.percentage}% aplicado!`, isError: false });
      
      const newDiscountPercent = res.percentage;
      const priceToDiscount = initialOriginalPrice || initialCurrentPrice;
      const calculatedCurrentPrice = priceToDiscount - (priceToDiscount * (newDiscountPercent / 100));
      
      setCurrentPrice(calculatedCurrentPrice);
      setOriginalPrice(priceToDiscount);
      setHasDiscount(true);
      setDiscountPercent(newDiscountPercent);
      setShowDiscountInput(false);
    } else {
      setDiscountMessage({ text: res.error || 'Código inválido', isError: true });
    }
    
    setDiscountLoading(false);
  };

  const handleRemoveDiscount = () => {
    setCurrentPrice(initialCurrentPrice);
    setOriginalPrice(initialOriginalPrice);
    setHasDiscount(initialHasDiscount);
    setDiscountPercent(initialDiscountPercent);
    setDiscountApplied(false);
    setDiscountCode('');
    setDiscountMessage({ text: '', isError: false });
    setShowDiscountInput(true);
  };

  // Preparamos un product actualizado para el carrito si se aplicó un código
  const productForCart = {
    ...product,
    price: currentPrice // Modificamos el precio para que el cartStore lo tome como nuevo precio
  };

  return (
    <div className="flex flex-col">
      {/* Price Display */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-zinc-900">{formatCurrency(currentPrice)}</span>
          {hasDiscount && originalPrice && (
            <>
              <span className="text-3xl font-bold text-zinc-400 line-through">{formatCurrency(originalPrice)}</span>
              <span className="bg-[#FF3333]/10 text-[#FF3333] px-3 py-1 rounded-full text-sm font-medium">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Discount Code Section */}
      <div className="mb-6">
        {!showDiscountInput && !discountApplied ? (
          <button 
            onClick={() => setShowDiscountInput(true)}
            className="text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Tag size={16} className="text-emerald-400" /> Añadir código descuento
          </button>
        ) : !discountApplied ? (
          <div className="flex flex-col gap-2 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Ingresa tu código</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="OFERTA20"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm uppercase font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={discountLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyDiscount();
                  }
                }}
              />
              <button 
                onClick={handleApplyDiscount}
                disabled={discountLoading}
                className="bg-white text-black px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-zinc-200 transition"
              >
                {discountLoading ? '...' : 'Aplicar'}
              </button>
            </div>
            {discountMessage.text && (
              <span className={`text-xs font-medium ${discountMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                {discountMessage.text}
              </span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center justify-between gap-3 bg-emerald-950/40 text-emerald-300 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-800/60 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-emerald-400" />
              <span>{discountMessage.text}</span>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-xs font-bold text-emerald-400 hover:text-red-400 underline ml-2"
              title="Quitar o cambiar código"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Description and other components from the parent should ideally be placed outside, 
          so we let the parent render them, we just replaced the price block. 
          But wait, AddToCartButton needs the updated product! 
          So we render AddToCartButton here. */}
      
      <AddToCartButton product={productForCart} />
    </div>
  );
}

'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/product';
import { ShoppingCart, Flame, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { showToast } from 'nextjs-toast-notify';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  // Obtener colores disponibles para el talle actualmente seleccionado
  const availableColorsForSize: string[] = selectedSize
    ? Array.from(
        new Set(
          (product.product_variants || [])
            .filter((v: any) => v.size === selectedSize && v.color)
            .map((v: any) => v.color as string)
        )
      )
    : [];

  // Calculamos cuánto stock queda realmente
  const sizeToUse = selectedSize || '';
  const itemInCart = cartItems.find(
    (item) => item.product.id === product.id && item.selectedSize === sizeToUse && item.selectedColor === (selectedColor || undefined)
  );
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  const availableStock = Math.max(0, (product.stock || 0) - quantityInCart);

  // Si no hay stock general, marcamos agotado
  const isOutOfStock = product.stock === 0;
  
  // Si no hay stock disponible (considerando carrito) para el talle actual
  const isMaxReached = quantity > availableStock;

  const handleAdd = () => {
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        showToast.error('Debes seleccionar un talle antes de continuar.', {
          position: 'top-center',
          duration: 3000,
        });
        return;
      }
      if (availableColorsForSize.length > 0 && !selectedColor) {
        showToast.error('Debes seleccionar un color para el talle elegido.', {
          position: 'top-center',
          duration: 3000,
        });
        return;
      }
    }

    if (quantity > availableStock) {
      showToast.error('No hay suficiente stock disponible.', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    addItem(product, sizeToUse, quantity, selectedColor || undefined);
    
    showToast.success('Producto agregado al carrito', {
      position: 'bottom-right',
      duration: 3000,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (availableStock - quantity > 0) {
      setQuantity(1);
    }
  };

  if (isOutOfStock) {
    return (
      <div className="w-full bg-zinc-800 text-zinc-400 rounded-full font-bold text-sm h-14 flex items-center justify-center border border-zinc-700">
        Agotado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Selector de talles y colores */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-4 pb-6 border-b border-zinc-200/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400 font-medium">Elegir Talle</span>
            {selectedSize && (
              <span className="text-xs text-zinc-400">
                Talle seleccionado: <strong className="text-white">{selectedSize}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSize(size);
                  const colors = Array.from(
                    new Set(
                      (product.product_variants || [])
                        .filter((v: any) => v.size === size && v.color)
                        .map((v: any) => v.color as string)
                    )
                  );
                  if (colors.length > 0) {
                    setSelectedColor(colors[0]);
                  } else {
                    setSelectedColor(null);
                  }
                }}
                className={`flex px-6 h-12 cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-all ${
                  selectedSize === size
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Muestra los colores del talle seleccionado */}
          {selectedSize ? (
            availableColorsForSize.length > 0 ? (
              <div className="pt-2 space-y-3">
                <div className="text-sm text-zinc-300">
                  Color: <span className="font-bold text-white">{selectedColor || 'Seleccionar...'}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableColorsForSize.map((color) => {
                    const isSelectedColor = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                          isSelectedColor
                            ? 'border-2 border-emerald-400 text-white bg-zinc-800 shadow-sm'
                            : 'border border-zinc-700 text-zinc-300 bg-zinc-900 hover:border-zinc-500'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="pt-2 text-xs text-zinc-400 italic">
                No hay colores registrados para el talle {selectedSize}.
              </div>
            )
          ) : (
            <div className="pt-2 text-xs text-zinc-400 italic">
              Haz clic en un talle para ver sus colores disponibles.
            </div>
          )}
        </div>
      )}

      {/* Botones de cantidad y agregar */}
      <div className="flex gap-4 pt-2">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between bg-zinc-800/90 border border-zinc-700 rounded-full px-5 w-[140px] h-14 shrink-0">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-zinc-200 hover:text-white transition-colors p-1"
            aria-label="Disminuir cantidad"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
          <span className="font-bold text-base text-white">{quantity}</span>
          <button 
            type="button"
            onClick={() => {
              if (quantity < availableStock) {
                setQuantity(quantity + 1);
              }
            }}
            disabled={quantity >= availableStock}
            className={`p-1 transition-colors ${
              quantity >= availableStock ? 'text-zinc-500 cursor-not-allowed' : 'text-zinc-200 hover:text-white'
            }`}
            aria-label="Aumentar cantidad"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        <button 
          onClick={handleAdd}
          disabled={availableStock === 0 || isMaxReached}
          className={`flex-1 rounded-full font-black text-base tracking-wide transition-all h-14 flex items-center justify-center gap-2 shadow-lg ${
            availableStock === 0 || isMaxReached
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {added ? '¡Agregado al Carrito!' : availableStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>

      {/* Alerta de poco stock */}
      {availableStock > 0 && availableStock < 5 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-950/40 py-3 text-amber-300 text-sm font-semibold border border-amber-800/60 shadow-sm">
          <Flame size={18} className="text-amber-400" />
          <span>¡Solo quedan {availableStock} en stock!</span>
        </div>
      )}
    </div>
  );
}

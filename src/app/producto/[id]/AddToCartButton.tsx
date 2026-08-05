'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/product';
import { Button } from '@/components/Button';
import { ShoppingCart, Flame } from 'lucide-react';
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

  const [quantity, setQuantity] = useState(1);

  // Calculamos cuánto stock queda realmente (restando lo que ya está en el carrito para ese talle)
  const sizeToUse = selectedSize || 'Único';
  const itemInCart = cartItems.find(
    (item) => item.product.id === product.id && item.selectedSize === sizeToUse
  );
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  const availableStock = Math.max(0, (product.stock || 0) - quantityInCart);

  // Si no hay stock general, marcamos agotado
  const isOutOfStock = product.stock === 0;
  
  // Si no hay stock disponible (considerando carrito) para el talle actual
  const isMaxReached = quantity > availableStock;

  // Color asignado al talle seleccionado
  const selectedVariant = product.product_variants?.find((v: any) => v.size === selectedSize);
  const currentColor = selectedVariant?.color || undefined;

  const handleAdd = () => {
    // Si el producto tiene talles y el usuario no seleccionó ninguno
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast.error('Debes seleccionar un talle antes de continuar.', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    if (quantity > availableStock) {
      showToast.error('No hay suficiente stock disponible.', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    addItem(product, sizeToUse, quantity, currentColor);
    
    showToast.success('Producto agregado al carrito', {
      position: 'bottom-right',
      duration: 3000,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    // Reiniciar cantidad a 1, pero verificar que quede stock
    if (availableStock - quantity > 0) {
      setQuantity(1);
    }
  };

  if (isOutOfStock) {
    return (
      <div className="w-full bg-zinc-200 text-zinc-500 rounded-full font-medium text-sm h-14 flex items-center justify-center">
        Agotado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Selector de talles */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-zinc-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Elegir Talle</span>
            {selectedSize && currentColor && (
              <span className="text-zinc-900 font-semibold bg-zinc-100 px-3 py-1 rounded-full text-xs">
                Color: {currentColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <label
                key={size}
                className={`relative flex px-6 h-12 cursor-pointer items-center justify-center rounded-full text-sm transition-all ${
                  selectedSize === size
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-[#F0F0F0] text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={size}
                  className="sr-only"
                  onChange={() => setSelectedSize(size)}
                  checked={selectedSize === size}
                />
                {size}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Botones de cantidad y agregar */}
      <div className="flex gap-4 pt-2">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between bg-[#F0F0F0] rounded-full px-5 w-[140px] h-14">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-2xl font-medium text-zinc-900 leading-none pb-1"
          >
            -
          </button>
          <span className="font-medium text-zinc-900">{quantity}</span>
          <button 
            onClick={() => {
              if (quantity < availableStock) {
                setQuantity(quantity + 1);
              }
            }}
            disabled={quantity >= availableStock}
            className={`text-2xl font-medium leading-none pb-1 ${
              quantity >= availableStock ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-900'
            }`}
          >
            +
          </button>
        </div>

        <button 
          onClick={handleAdd}
          disabled={availableStock === 0 || isMaxReached}
          className={`flex-1 rounded-full font-medium text-sm transition-colors h-14 flex items-center justify-center gap-2 ${
            availableStock === 0 || isMaxReached
              ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          {added ? '¡Agregado!' : availableStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>

      {/* Alerta de poco stock */}
      {availableStock > 0 && availableStock < 5 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-red-500 text-sm font-medium border border-red-100">
          <Flame size={16} />
          <span>¡Solo quedan {availableStock} en stock!</span>
        </div>
      )}
    </div>
  );
}

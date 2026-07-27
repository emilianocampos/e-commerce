'use client';

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/product';
import { Button } from '@/components/Button';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { showToast } from 'nextjs-toast-notify';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    // Si el producto tiene talles y el usuario no seleccionó ninguno
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast.error('Debes seleccionar un talle antes de continuar.', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }

    const sizeToUse = selectedSize || 'Único';
    addItem(product, sizeToUse, quantity);
    
    showToast.success('Producto agregado al carrito', {
      position: 'bottom-right',
      duration: 3000,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector de talles */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-zinc-200">
          <label className="text-zinc-500 text-sm">Elegir Talle</label>
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
            onClick={() => setQuantity(quantity + 1)}
            className="text-2xl font-medium text-zinc-900 leading-none pb-1"
          >
            +
          </button>
        </div>

        <button 
          onClick={handleAdd}
          className="flex-1 bg-zinc-900 text-white rounded-full font-medium text-sm transition-colors hover:bg-zinc-800 h-14 flex items-center justify-center gap-2"
        >
          {added ? '¡Agregado!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

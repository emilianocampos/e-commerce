/**
 * Archivo: src/app/producto/[id]/AddToCartButton.tsx
 * Responsabilidad: Es un "Client Component" que renderiza un botón interactivo para agregar el
 * producto seleccionado al estado global de Zustand.
 */
'use client'; // Requerido para componentes que manejan estado de React (useState) o hooks como Zustand.

import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types/product';
import { Button } from '@/components/Button';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

// 1. Definimos las props que recibirá el componente desde la página del servidor
interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  // 2. Extraemos ÚNICAMENTE la función 'addItem' de nuestro store global
  // Hacerlo así asegura que el botón solo se vuelva a renderizar si cambia 'addItem'
  const addItem = useCartStore((state) => state.addItem);
  
  // 3. Estado local para dar un feedback visual de que el producto se agregó
  const [added, setAdded] = useState(false);

  // 4. Función manejadora del clic del botón
  const handleAdd = () => {
    // a. Agregamos 1 unidad del producto al carrito global
    addItem(product, 1);
    
    // b. Cambiamos el estado local para cambiar el texto del botón a "¡Agregado!"
    setAdded(true);
    
    // c. Después de 2 segundos, volvemos el botón a su texto original "Agregar al carrito"
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button 
      size="lg" 
      onClick={handleAdd} // Vinculamos nuestro evento onClick
      variant={added ? 'secondary' : 'primary'} // Si ya se agregó, cambiamos el color a modo secundario
      className="w-full gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {/* 5. Renderizado condicional del texto del botón */}
      {added ? '¡Agregado!' : 'Agregar al carrito'}
    </Button>
  );
}

/**
 * Archivo: src/components/Cart.tsx
 * Responsabilidad: Mostrar una lista interactiva de todos los items en el carrito actual.
 * Provee controles para cambiar la cantidad de cada producto y calcular el total en tiempo real.
 */
'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export function Cart() {
  // 1. Extraemos las propiedades y funciones que necesitamos de nuestro estado global (Zustand)
  const { items, removeItem, increaseQuantity, decreaseQuantity, subtotal, total } = useCartStore();

  // 2. Si el carrito está vacío, devolvemos una vista "vacía" en lugar de la tabla de checkout
  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400">
          <ShoppingCartIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900">Tu carrito está vacío</h2>
        <p className="mt-2 mb-6 text-zinc-500">Parece que aún no has agregado nada.</p>
        <Link href="/">
          <Button variant="primary">Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  // 3. Si hay productos en el carrito, mostramos el layout completo
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* 4. Columna Izquierda: Listado de todos los productos en el carrito */}
      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <ul className="divide-y divide-zinc-200">
            {/* Iteramos sobre la lista de items */}
            {items.map((item) => (
              <li key={item.product.id} className="flex flex-col p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                
                {/* 4.a: Imagen miniatura */}
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {item.product.image && (
                    <Image src={item.product.image} alt={item.product.title} fill className="object-cover" />
                  )}
                </div>

                {/* 4.b: Datos principales del producto (Título, Precio) */}
                <div className="mt-4 flex flex-1 flex-col justify-between sm:mt-0">
                  <div>
                    <h3 className="font-semibold text-zinc-900">{item.product.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{formatCurrency(item.product.price)}</p>
                  </div>

                  {/* 4.c: Controles interactivos (Menos, Más, Eliminar) */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-zinc-200 p-1">
                      {/* Botón para restar cantidad */}
                      <button
                        onClick={() => decreaseQuantity(item.product.id)}
                        className="rounded-md p-1 hover:bg-zinc-100 disabled:opacity-50"
                        disabled={item.quantity <= 1} // No permitimos restar si es 1
                      >
                        <Minus className="h-4 w-4 text-zinc-500" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      {/* Botón para sumar cantidad */}
                      <button
                        onClick={() => increaseQuantity(item.product.id)}
                        className="rounded-md p-1 hover:bg-zinc-100"
                        disabled={item.quantity >= item.product.stock} // No podemos superar el stock
                      >
                        <Plus className="h-4 w-4 text-zinc-500" />
                      </button>
                    </div>
                    {/* Botón para eliminar totalmente del carrito */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 4.d: Subtotal de la fila (Precio unitario * cantidad) */}
                <div className="mt-4 sm:mt-0 sm:text-right">
                  <p className="text-lg font-bold text-zinc-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Columna Derecha: Tarjeta de Resumen de Compra (Total) */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">Resumen de compra</h2>
          
          <dl className="mt-6 space-y-4 text-sm text-zinc-600">
            {/* Llama a subtotal() para mostrar la sumatoria pura de los productos */}
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-medium text-zinc-900">{formatCurrency(subtotal())}</dd>
            </div>
            
            {/* Gastos de envío fijados gratis como ejemplo */}
            <div className="flex justify-between border-b border-zinc-200 pb-4">
              <dt>Envío</dt>
              <dd className="font-medium text-green-600">Gratis</dd>
            </div>
            
            {/* Llama a total() para calcular el final definitivo */}
            <div className="flex justify-between pt-2 text-base font-bold text-zinc-900">
              <dt>Total a pagar</dt>
              <dd>{formatCurrency(total())}</dd>
            </div>
          </dl>

          {/* Botón de Checkout (Solo UI, no funcional en este ejemplo) */}
          <Button className="mt-6 w-full" size="lg">
            Proceder al pago
          </Button>
          <div className="mt-4 text-center text-xs text-zinc-500">
            Pagos seguros. SSL Encriptado.
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

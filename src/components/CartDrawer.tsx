'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '@/lib/utils';
import { CheckoutButton } from './CheckoutButton';
import { showToast } from 'nextjs-toast-notify';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, subtotal, total, isOpen, closeCart } = useCartStore();

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="relative z-[100]" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        aria-hidden="true" 
        onClick={closeCart}
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            
            {/* Drawer Panel */}
            <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out sm:duration-700 translate-x-0">
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-100">
                  <h2 className="text-xl font-bold text-zinc-900" id="slide-over-title">Tu Carrito</h2>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="relative -m-2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      onClick={closeCart}
                    >
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Cerrar panel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {items.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                      <div className="rounded-full bg-zinc-50 p-6">
                        <ShoppingBag className="h-12 w-12 text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-zinc-900">Tu carrito está vacío</p>
                        <p className="mt-1 text-sm text-zinc-500">Aún no has agregado productos.</p>
                      </div>
                      <Button variant="outline" className="mt-4" onClick={closeCart}>
                        Seguir comprando
                      </Button>
                    </div>
                  ) : (
                    <ul role="list" className="-my-6 divide-y divide-zinc-100">
                      {items.map((item) => (
                        <li key={item.product.id} className="flex py-6">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                            {item.product.image ? (
                              <Image 
                                src={item.product.image} 
                                alt={item.product.title} 
                                fill 
                                unoptimized 
                                className="object-cover object-center" 
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">Sin imagen</div>
                            )}
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-zinc-900">
                                <h3>
                                  <a href={`/producto/${item.product.id}`} className="hover:underline line-clamp-1">{item.product.title}</a>
                                </h3>
                                <p className="ml-4 font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                              </div>
                              <p className="mt-1 text-sm text-zinc-500 capitalize">
                                {item.product.category} {item.selectedSize && `• Talle: ${item.selectedSize}`}
                              </p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              
                              <div className="flex items-center rounded-lg border border-zinc-200 p-1">
                                <button
                                  onClick={() => decreaseQuantity(item.product.id, item.selectedSize)}
                                  className="rounded-md p-1 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3 text-zinc-600" />
                                </button>
                                <span className="w-8 text-center font-medium text-zinc-900">{item.quantity}</span>
                                <button
                                  onClick={() => increaseQuantity(item.product.id, item.selectedSize)}
                                  className="rounded-md p-1 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                  disabled={item.quantity >= item.product.stock}
                                >
                                  <Plus className="h-3 w-3 text-zinc-600" />
                                </button>
                              </div>

                              <div className="flex">
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeItem(item.product.id, item.selectedSize);
                                    showToast.error('Producto eliminado', { position: 'top-center', duration: 3000 });
                                  }}
                                  className="font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer (Total & Checkout) */}
                {items.length > 0 && (
                  <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-6">
                    <div className="flex justify-between text-base font-medium text-zinc-900">
                      <p>Subtotal</p>
                      <p>{formatCurrency(total())}</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">Envío calculado en el checkout.</p>
                    <div className="mt-6">
                      <CheckoutButton />
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-zinc-500">
                      <p>
                        o{' '}
                        <button
                          type="button"
                          className="font-medium text-zinc-900 hover:underline"
                          onClick={closeCart}
                        >
                          Seguir comprando
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

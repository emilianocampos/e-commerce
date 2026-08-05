/**
 * Archivo: src/store/cartStore.ts
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types/product';
import { showToast } from 'nextjs-toast-notify';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedSize: string, quantity?: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedSize: string) => void;
  increaseQuantity: (productId: string, selectedSize: string) => void;
  decreaseQuantity: (productId: string, selectedSize: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  total: () => number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: (product, selectedSize, quantity = 1, selectedColor?: string) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
          );
          
          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
              showToast.warning('Límite de stock alcanzado', { position: 'top-center' });
              return { items: state.items };
            }
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          if (quantity > product.stock) {
            showToast.warning('Límite de stock alcanzado', { position: 'top-center' });
            return { items: state.items };
          }

          return { items: [...state.items, { product, selectedSize, selectedColor, quantity }] };
        });
      },
      
      removeItem: (productId, selectedSize) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize)),
        }));
      },
      
      increaseQuantity: (productId, selectedSize) => {
        set((state) => {
          let reachedLimit = false;
          const newItems = state.items.map((item) => {
            if (item.product.id === productId && item.selectedSize === selectedSize) {
              if (item.quantity + 1 > item.product.stock) {
                reachedLimit = true;
                return item;
              }
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          });

          if (reachedLimit) {
            showToast.warning('Límite de stock alcanzado', { position: 'top-center' });
          }

          return { items: newItems };
        });
      },
      
      decreaseQuantity: (productId, selectedSize) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedSize === selectedSize && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      subtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
      
      total: () => {
        return get().subtotal();
      },
    }),
    {
      name: 'ecommerce-cart', 
    }
  )
);

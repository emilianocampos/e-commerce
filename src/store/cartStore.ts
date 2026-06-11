/**
 * Archivo: src/store/cartStore.ts
 * Responsabilidad: Definir y gestionar el estado global del carrito de compras en el cliente.
 * Al usar Zustand, este estado se puede leer y modificar desde cualquier componente de React.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types/product';

// 1. Definimos la interfaz TypeScript que describe cómo se ve nuestro estado global
interface CartState {
  items: CartItem[]; // Lista de items en el carrito
  addItem: (product: Product, quantity?: number) => void; // Función para agregar producto
  removeItem: (productId: string) => void; // Función para eliminar producto por su ID
  increaseQuantity: (productId: string) => void; // Función para aumentar la cantidad
  decreaseQuantity: (productId: string) => void; // Función para reducir la cantidad
  clearCart: () => void; // Función para vaciar completamente el carrito
  subtotal: () => number; // Función para calcular el subtotal
  total: () => number; // Función para calcular el total (subtotal + envíos o impuestos futuros)
}

// 2. Creamos el "Store" global usando Zustand y exportamos el hook personalizado "useCartStore"
export const useCartStore = create<CartState>()(
  // 3. Envolvemos todo el estado en el middleware "persist"
  // Esto hace que cada vez que el estado cambie, se guarde automáticamente en el localStorage del navegador.
  persist(
    (set, get) => ({
      // Estado inicial: un carrito vacío
      items: [],
      
      // Lógica para agregar un ítem
      addItem: (product, quantity = 1) => {
        // La función "set" nos permite modificar el estado actual
        set((state) => {
          // Buscamos si el producto ya existe en nuestro carrito
          const existingItem = state.items.find((item) => item.product.id === product.id);
          
          if (existingItem) {
            // Si ya existe, en lugar de duplicarlo, actualizamos su 'quantity' sumando la nueva cantidad
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          // Si no existe, creamos un nuevo array con todos los items anteriores y agregamos el nuevo al final
          return { items: [...state.items, { product, quantity }] };
        });
      },
      
      // Lógica para eliminar un ítem completamente
      removeItem: (productId) => {
        set((state) => ({
          // Usamos 'filter' para dejar solo los items que NO tengan el ID que queremos borrar
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      // Lógica para incrementar cantidad de a 1
      increaseQuantity: (productId) => {
        set((state) => ({
          // Recorremos los items y le sumamos 1 a la cantidad del producto que coincida
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }));
      },
      
      // Lógica para disminuir cantidad de a 1
      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            // Solo restamos 1 si la cantidad actual es mayor a 1 (para evitar cantidades negativas o 0)
            item.product.id === productId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }));
      },
      
      // Lógica para vaciar carrito simplemente restableciendo el array de items
      clearCart: () => set({ items: [] }),
      
      // Función utilitaria para calcular subtotal
      subtotal: () => {
        // "get()" nos permite leer el estado actual sin modificarlo
        // Usamos reduce para sumar (precio * cantidad) de cada producto iterativamente
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
      
      // Función utilitaria para calcular total
      total: () => {
        // En el futuro se pueden agregar impuestos o envíos aquí, por ahora retorna lo mismo que subtotal
        return get().subtotal();
      },
    }),
    {
      // Configuración de persistencia: nombre bajo el que se guardará en localStorage
      name: 'ecommerce-cart', 
    }
  )
);

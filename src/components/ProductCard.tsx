/**
 * Archivo: src/components/ProductCard.tsx
 * Responsabilidad: Representa visualmente un único producto dentro de una grilla.
 * Muestra su imagen, título, precio e incluye un enlace para ver sus detalles.
 */
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

// 1. Definimos que este componente recibe como 'prop' un objeto Product
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    // 2. Envolvemos la tarjeta en un Link de Next.js. Al hacer clic, navega a /producto/[id]
    // Usamos el id del producto para crear la URL dinámica
    <Link
      href={`/producto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md"
    >
      {/* 3. Contenedor de la imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {product.image ? (
          // Si el producto tiene imagen, usamos el componente <Image> de Next.js
          <Image
            src={product.image}
            alt={product.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Si no tiene imagen, mostramos un recuadro gris como placeholder
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>

      {/* 4. Contenedor de la información (texto y precio) */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">{product.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{product.category}</p>
        <div className="mt-auto pt-4">
          <p className="text-base font-semibold text-zinc-900">{formatCurrency(product.price)}</p>
        </div>
      </div>
    </Link >
  );
}

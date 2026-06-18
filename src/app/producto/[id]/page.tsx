/**
 * Archivo: src/app/producto/[id]/page.tsx
 * Responsabilidad: Renderizar la página de detalle de un producto específico.
 * Usa Dynamic Routing de Next.js (la carpeta [id]) para capturar el ID de la URL y consultar la BD.
 */
import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { Metadata } from 'next';

// 1. Exportamos metadatos dinámicos para SEO (Search Engine Optimization)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('title, description').eq('id', resolvedParams.id).single();

  return {
    title: product ? `${product.title} | E-Commerce` : 'Producto no encontrado',
    description: product?.description || 'Detalles del producto',
  };
}

// 2. Componente principal de la página de producto
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // a. Extraemos el 'id' que viene en la URL asincrónicamente (Next.js 15)
  const resolvedParams = await params;
  const supabase = await createClient();
  
  // b. Buscamos el producto en la base de datos usando ese 'id'
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  // c. Si no existe, usamos notFound() de Next.js que redirige a la página 404
  if (!product) {
    notFound();
  }

  // d. Renderizamos el layout con la información obtenida
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Columna Izquierda: Imagen del producto */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Columna Derecha: Título, Precio y Botón de Compra */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-sm font-medium tracking-wider text-zinc-500 uppercase">
            {product.category}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-medium text-zinc-900">
            {formatCurrency(product.price)}
          </p>
          
          <div className="mt-8 prose prose-zinc">
            <p className="text-zinc-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-10">
            {/* Si el stock es mayor a 0, mostramos los botones de compra */}
            {product.stock > 0 ? (
              <div className="flex flex-col gap-4">
                <AddToCartButton product={product as any} />
              </div>
            ) : (
              // Si no hay stock, mostramos un botón deshabilitado
              <div className="rounded-lg bg-zinc-100 px-4 py-3 text-center text-sm font-medium text-zinc-500">
                Agotado temporalmente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

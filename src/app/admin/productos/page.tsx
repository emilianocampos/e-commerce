/**
 * Archivo: src/app/admin/productos/page.tsx
 * Responsabilidad: Mostrar una tabla con todos los productos actuales para el administrador.
 * Al ser Server Component, obtiene la data segura y velozmente desde el backend.
 */
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Product } from '@/types/product';
import { DeleteProductButton } from './DeleteProductButton';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

// 1. Invalidar la cache siempre en el panel admin para ver los cambios instantáneos
export const revalidate = 0;

export default async function AdminProductsPage() {
  // 2. Conectamos con Supabase
  const supabase = await createClient();
  
  // 3. Traemos todos los productos más recientes primero
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // 4. Manejo de error de base de datos
  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* 5. Cabecera con título y botón para agregar un nuevo producto */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <Link href="/admin/crear">
          <Button variant="primary">Nuevo Producto</Button>
        </Link>
      </div>

      {/* 6. Contenedor de la tabla con estilos para hacerla scrollable en pantallas chicas */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            {/* Cabecera de la tabla */}
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Acciones</th>
              </tr>
            </thead>
            
            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-zinc-200 bg-white">
              {products.map((product: Product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  {/* Celda: Título e Imagen */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                        {product.image && (
                          <Image src={product.image} alt={product.title} fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">{product.title}</div>
                        <div className="text-sm text-zinc-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  {/* Celda: Precio */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900">
                    {formatCurrency(product.price)}
                  </td>
                  {/* Celda: Stock visual */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} unid.
                    </span>
                  </td>
                  {/* Celda: Botones de Editar y Eliminar */}
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/editar/${product.id}`} className="text-blue-600 hover:text-blue-900">
                        Editar
                      </Link>
                      {/* DeleteProductButton usa un Server Action por debajo para eliminar sin JS si es necesario */}
                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Si no hay productos, mostramos este estado vacío */}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

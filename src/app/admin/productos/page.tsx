import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { DeleteAllProductsButton } from './DeleteAllProductsButton';
import { DeleteProductButton } from './DeleteProductButton';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { PlusCircle, Trash2, Edit, Package, Layers } from 'lucide-react';

export const revalidate = 0;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort as string;

  const supabase = await createClient();
  
  let query = supabase.from('products').select('*');

  if (sort === 'category_asc') {
    query = query.order('type', { ascending: true }).order('created_at', { ascending: false });
  } else if (sort === 'category_desc') {
    query = query.order('type', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  const getCategoryLabel = (product: any) => {
    if (product.type === 'SUPPLEMENT') return 'Suplemento';
    if (product.type === 'CLOTHES') {
      if (product.gender === 'MEN') return 'Ropa - Hombre';
      if (product.gender === 'WOMEN') return 'Ropa - Mujer';
      return 'Ropa - Urbano';
    }
    return product.type || 'Sin categoría';
  };

  const getNextSort = () => {
    if (sort === 'category_asc') return 'category_desc';
    if (sort === 'category_desc') return '';
    return 'category_asc';
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Adaptable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-600" />
            Productos ({products?.length || 0})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Administrá el catálogo, precios, stock y variaciones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DeleteAllProductsButton />
          <Link href="/admin/crear">
            <Button variant="primary" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3.5">
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* VISTA MOBILE: Tarjetas Táctiles (Visibles solo en mobile: block md:hidden) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products?.map((product: any) => (
          <div key={product.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {product.image ? (
                  <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">Sin foto</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-zinc-900 text-sm truncate">{product.title}</h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    {getCategoryLabel(product)}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                    product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                    'bg-rose-100 text-rose-800'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="text-base font-extrabold text-zinc-900 mt-2">
                  {formatCurrency(product.price)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <Link
                href={`/admin/editar/${product.id}`}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Link>
              <DeleteProductButton id={product.id} title={product.title} />
            </div>
          </div>
        ))}

        {(!products || products.length === 0) && (
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center text-sm text-zinc-500">
            No hay productos registrados en la base de datos.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla Tradicional (Visible solo en pantallas md+) */}
      <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <Link href={`/admin/productos${getNextSort() ? `?sort=${getNextSort()}` : ''}`} className="flex items-center gap-1 hover:text-zinc-800 transition-colors">
                    Categoría
                    {sort === 'category_asc' && <span>↑</span>}
                    {sort === 'category_desc' && <span>↓</span>}
                    {!sort && <span className="opacity-50 text-zinc-400">↕</span>}
                  </Link>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-200 bg-white">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                        {product.image && (
                          <Image src={product.image} alt={product.title} fill unoptimized className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <div className="font-medium text-zinc-900">{product.title}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-zinc-700">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {getCategoryLabel(product)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-zinc-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      product.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 
                      product.stock > 0 ? 'bg-amber-100 text-amber-800' : 
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {product.stock} unid.
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/editar/${product.id}`} className="text-blue-600 hover:text-blue-900 font-semibold text-xs">
                        Editar
                      </Link>
                      <DeleteProductButton id={product.id} title={product.title} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
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

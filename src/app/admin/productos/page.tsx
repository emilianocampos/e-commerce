import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { DeleteAllProductsButton } from './DeleteAllProductsButton';
import { AdminProductsList } from './AdminProductsList';
import { PlusCircle, Package } from 'lucide-react';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-600" />
            Productos ({products?.length || 0})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Buscá y administrá el catálogo, precios, stock y variaciones.
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

      {/* Lista con Buscador Interactivo */}
      <AdminProductsList initialProducts={products || []} />
    </div>
  );
}


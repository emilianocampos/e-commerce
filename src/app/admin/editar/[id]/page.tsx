import { createClient } from '@/lib/supabase-server';
import { ProductForm } from '@/components/ProductForm';
import { notFound } from 'next/navigation';
import { Product } from '@/types/product';

export const metadata = {
  title: 'Editar Producto | Admin',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Editar Producto</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <ProductForm initialData={product as Product} />
      </div>
    </div>
  );
}

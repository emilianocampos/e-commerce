import { createClient } from '@/lib/supabase-server';
import { ProductForm } from '@/components/ProductForm';
import { updateProduct } from '@/actions/products';
import { notFound } from 'next/navigation';
import { Product } from '@/types/product';
import { getBrands } from '@/actions/brands';
import { getCategories, getSubcategories } from '@/actions/categories';

export const metadata = {
  title: 'Editar Producto | Admin',
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*, supplement_information(*)').eq('id', id).single();

  if (!product) {
    notFound();
  }

  const brands = await getBrands();
  const categories = await getCategories();
  const subcategories = await getSubcategories();

  const productData = {
    ...product,
    supplement_information: Array.isArray(product.supplement_information) ? product.supplement_information[0] : product.supplement_information
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Editar Producto</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <ProductForm 
          action={updateProduct.bind(null, product.id)} 
          initialData={productData as Product} 
          brands={brands}
          categories={categories}
          subcategories={subcategories}
        />
      </div>
    </div>
  );
}

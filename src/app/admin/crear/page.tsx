import { ProductForm } from '@/components/ProductForm';
import { createProduct } from '@/actions/products';

export const metadata = {
  title: 'Crear Producto | Admin',
};

export default function CreateProductPage() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Crear Producto</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <ProductForm action={createProduct} />
      </div>
    </div>
  );
}

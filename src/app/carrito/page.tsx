import { Cart } from '@/components/Cart';

export const metadata = {
  title: 'Carrito de Compras | E-commerce',
  description: 'Revisa tus productos y finaliza tu compra.',
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900">Carrito de Compras</h1>
      <Cart />
    </div>
  );
}

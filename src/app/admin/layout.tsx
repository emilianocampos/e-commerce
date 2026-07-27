import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col md:flex-row">
      <aside className="w-full border-r border-zinc-200 bg-white md:w-64">
        <nav className="flex flex-col space-y-1 p-4">
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/productos"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Productos
          </Link>
          <Link
            href="/admin/crear"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Crear Producto
          </Link>
          <Link
            href="/admin/ventas"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Ventas
          </Link>
          <Link
            href="/admin/marcas"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Marcas
          </Link>
          <Link
            href="/admin/categorias"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Categorías
          </Link>
          <Link
            href="/admin/personalizar"
            className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 bg-blue-50/50 mt-4 border border-blue-100"
          >
            Personalizar Web
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

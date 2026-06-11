export const metadata = {
  title: 'Panel de Administración | E-commerce',
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
      <p className="mt-2 text-zinc-500">
        Bienvenido al panel de administración. Selecciona una opción del menú para comenzar.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-zinc-900">Gestión de Productos</h3>
          <p className="mt-2 text-sm text-zinc-500">Crea, edita o elimina productos del catálogo.</p>
        </div>
      </div>
    </div>
  );
}

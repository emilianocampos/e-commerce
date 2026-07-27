import { getBrands } from '@/actions/brands';

export default async function MarcasPage() {
  const brands = await getBrands();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Marcas</h1>
        {/* Aquí iría un modal o página para crear nueva marca manualmente */}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 border-b">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{brand.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${brand.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {brand.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-zinc-500">
                  No hay marcas cargadas. Puedes crear marcas automáticamente subiendo un Excel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

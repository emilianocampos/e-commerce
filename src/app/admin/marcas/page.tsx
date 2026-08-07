import { getBrands } from '@/actions/brands';
import { Tag, CheckCircle2, XCircle } from 'lucide-react';

export default async function MarcasPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
          <Tag className="w-7 h-7 text-blue-600" />
          Marcas ({brands?.length || 0})
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Marcas comerciales asociadas a tus productos.
        </p>
      </div>

      {/* VISTA MOBILE: Tarjetas Táctiles */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
            <h3 className="font-extrabold text-zinc-900 text-sm">{brand.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              brand.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {brand.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {brand.active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center text-sm text-zinc-500">
            No hay marcas cargadas. Podés crear marcas automáticamente importando un Excel.
          </div>
        )}
      </div>

      {/* VISTA DESKTOP: Tabla */}
      <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Nombre de la Marca</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 font-bold text-zinc-900">{brand.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    brand.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {brand.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-zinc-500">
                  No hay marcas cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

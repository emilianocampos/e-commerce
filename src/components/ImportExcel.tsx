'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ImportRow, processExcelImport } from '@/actions/import';

export function ImportExcel() {
  const [dataPreview, setDataPreview] = useState<ImportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Selector de categoría para la importación
  const [productType, setProductType] = useState<string>('CLOTHES');
  const [gender, setGender] = useState<string>('MEN');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const transformedData: ImportRow[] = data.map((row) => {
        const getVal = (keyStr: string) => {
          const key = Object.keys(row).find(k => k.toLowerCase().includes(keyStr.toLowerCase()));
          return key ? row[key] : undefined;
        };

        const priceStr = getVal('precio');
        let parsedPrice = 0;
        if (typeof priceStr === 'number') {
          parsedPrice = priceStr;
        } else if (typeof priceStr === 'string') {
          const cleanStr = priceStr.replace('$', '').replace(/\./g, '').replace(',', '.').trim();
          parsedPrice = parseFloat(cleanStr) || 0;
        }

        return {
          producto: getVal('producto') || getVal('product') || '',
          marca: getVal('marca') || getVal('brand') || '',
          entrada: Number(getVal('entrada')) || 0,
          salida: Number(getVal('salida')) || 0,
          stock: Number(getVal('stock')) || 0,
          precio: parsedPrice,
        };
      }).filter(r => r.producto);

      setDataPreview(transformedData);
      setResult(null);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (dataPreview.length === 0) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await processExcelImport(dataPreview, productType, productType === 'CLOTHES' ? gender : null);
      setResult(res);
      if (res.errors.length === 0) {
        setDataPreview([]); // Limpiar tras importación exitosa
      }
    } catch (error: any) {
      setResult({ errors: [error.message], created: 0, updated: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
        <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2">Opciones de Importación Masiva</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-900">Categoría destino</label>
            <select 
              value={productType} 
              onChange={(e) => setProductType(e.target.value)} 
              className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white"
            >
              <option value="CLOTHES">Ropa</option>
              <option value="SUPPLEMENT">Suplementos</option>
            </select>
          </div>
          
          {productType === 'CLOTHES' && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-zinc-900">Subcategoría</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="w-full rounded-md border border-zinc-300 p-2 text-zinc-900 bg-white"
              >
                <option value="MEN">Hombre</option>
                <option value="WOMEN">Mujer</option>
                <option value="UNISEX">Urbano (Unisex)</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-blue-200">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Subir archivo .xlsx
          </label>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-blue-50 border border-zinc-300 bg-white rounded-md p-1"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Columnas esperadas: PRODUCTO, MARCA, ENTRADA, SALIDA, STOCK, PRECIO
          </p>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${result.errors.length > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <h3 className="font-bold mb-2">Resultado de Importación:</h3>
          <p>✅ Creados: {result.created}</p>
          <p>🔄 Actualizados: {result.updated}</p>
          {result.errors.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-red-600">Errores ({result.errors.length}):</p>
              <ul className="list-disc pl-5 text-sm text-red-600 max-h-40 overflow-y-auto mt-2">
                {result.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {dataPreview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
            <h2 className="font-bold text-lg">Vista Previa ({dataPreview.length} productos)</h2>
            <button 
              onClick={handleImport}
              disabled={isLoading}
              className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-zinc-800 disabled:opacity-50"
            >
              {isLoading ? 'Importando...' : 'Confirmar Importación'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                  <th className="px-4 py-3">Stock Final</th>
                  <th className="px-4 py-3">Precio</th>
                </tr>
              </thead>
              <tbody>
                {dataPreview.slice(0, 100).map((row, i) => (
                  <tr key={i} className="border-b hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium">{row.producto}</td>
                    <td className="px-4 py-3">{row.marca}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">+{row.entrada}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">-{row.salida}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.stock > 5 ? 'bg-green-100 text-green-800' : row.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {row.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">${row.precio.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dataPreview.length > 100 && (
              <p className="text-center p-4 text-zinc-500 text-sm">Mostrando solo los primeros 100 registros.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

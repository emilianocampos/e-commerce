'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';

export default function AdminQRPage() {
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('DRAVENIX');
  const [subtitle, setSubtitle] = useState<string>('¡Escaneá este código QR y mirá todo nuestro catálogo online!');
  const [posterTheme, setPosterTheme] = useState<'dark' | 'light' | 'gradient'>('dark');
  const [copied, setCopied] = useState<boolean>(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Cargar URL por defecto
  useEffect(() => {
    const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setStoreUrl(defaultUrl);
  }, []);

  // Renderizar QR Code en el canvas
  useEffect(() => {
    if (!storeUrl || !qrCanvasRef.current) return;

    const darkColor = posterTheme === 'light' ? '#000000' : '#ffffff';
    const lightColor = posterTheme === 'light' ? '#ffffff' : '#09090b';

    QRCode.toCanvas(
      qrCanvasRef.current,
      storeUrl,
      {
        width: 280,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('Error generando QR:', error);
      }
    );
  }, [storeUrl, posterTheme]);

  // Copiar URL al portapapeles
  const handleCopyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    showToast.success('URL copiada al portapapeles', { position: 'top-center' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Descargar solo la imagen del código QR (PNG)
  const downloadQRImage = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qr_${storeName.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
    showToast.success('Imagen QR descargada correctamente', { position: 'top-center' });
  };

  // Imprimir Cartel
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Estilos específicos para Impresión (imprime solo el cartel sin la UI del admin) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-poster-card, #print-poster-card * {
            visibility: visible;
          }
          #print-poster-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.1);
            width: 100% !important;
            max-width: 500px !important;
            box-shadow: none !important;
            border: 2px solid #18181b !important;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-emerald-600" />
            Código QR del Negocio
          </h1>
          <p className="text-zinc-500 mt-1">
            Generá, personalizá, descargá e imprimí el cartel con el código QR oficial de tu tienda online.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadQRImage}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar Solo QR
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cartel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna de Configuración / Opciones */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Personalización del Cartel
          </h2>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              URL de la Tienda
            </label>
            <div className="relative">
              <input
                type="text"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full pl-3 pr-20 py-2.5 border border-zinc-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="https://tudominio.com"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Nombre de la Marca / Local
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ej: DRAVENIX"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Mensaje / Llamado a la Acción
            </label>
            <textarea
              rows={3}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Escribí una frase para alentar a los clientes a escanear"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Estilo del Cartel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPosterTheme('dark')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  posterTheme === 'dark'
                    ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-emerald-500'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                Modo Oscuro
              </button>
              <button
                type="button"
                onClick={() => setPosterTheme('light')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  posterTheme === 'light'
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-300 ring-2 ring-emerald-500'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Modo Claro
              </button>
              <button
                type="button"
                onClick={() => setPosterTheme('gradient')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  posterTheme === 'gradient'
                    ? 'bg-gradient-to-br from-emerald-600 to-zinc-900 text-white border-emerald-500 ring-2 ring-emerald-500'
                    : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                Degradado
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
            <span>Visitar enlace actual:</span>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Abrir Web <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Columna de Previsualización del Cartel Imprimible */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Vista Previa del Cartel Imprimible
          </div>

          {/* Cartel Imprimible */}
          <div
            id="print-poster-card"
            ref={posterRef}
            className={`w-full max-w-sm rounded-3xl p-8 shadow-xl text-center relative overflow-hidden transition-all duration-300 border ${
              posterTheme === 'dark'
                ? 'bg-zinc-950 text-white border-zinc-800 shadow-zinc-950/40'
                : posterTheme === 'light'
                ? 'bg-white text-zinc-900 border-zinc-300 shadow-zinc-300/40'
                : 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-emerald-950 text-white border-emerald-800/60 shadow-emerald-950/40'
            }`}
          >
            {/* Adorno Glow de Fondo */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header del Negocio */}
            <div className="mb-6 relative z-10">
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-extrabold tracking-widest uppercase mb-2">
                TIENDA OFICIAL
              </div>
              <h2 className="text-3xl font-black tracking-tight">{storeName}</h2>
              <p className="text-xs mt-2 opacity-80 max-w-xs mx-auto font-medium leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Canvas QR Code Centrado */}
            <div className="my-6 flex items-center justify-center w-full relative z-10">
              <div className={`p-4 rounded-2xl border shadow-inner inline-flex items-center justify-center mx-auto ${
                posterTheme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}>
                <canvas ref={qrCanvasRef} className="rounded-lg shadow-sm block mx-auto max-w-full" />
              </div>
            </div>

            {/* Footer con instrucciones para el cliente */}
            <div className="mt-4 pt-4 border-t border-current/10 relative z-10 space-y-1">
              <p className="text-xs font-bold tracking-wide uppercase">
                Aunténtico & Directo
              </p>
              <p className="text-[11px] font-mono opacity-60 truncate px-2">
                {storeUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

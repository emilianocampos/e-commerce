'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle2, AlertCircle, Send, MessageCircle } from 'lucide-react';

export default function ArrepentimientoPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !fullName || !email) {
      return;
    }
    const code = `ARR-${Date.now().toString().slice(-6)}`;
    setTrackingCode(code);
    setSubmitted(true);
  };

  const getWhatsAppMessage = () => {
    const text = `Hola KLONFARK, solicito la revocación/arrepentimiento de mi compra con código ${trackingCode}.\n\n*Pedido:* ${orderNumber}\n*Nombre:* ${fullName}\n*Email:* ${email}\n*Teléfono:* ${phone || 'No especificado'}\n*Motivo:* ${reason || 'Revocación dentro de los 10 días legales'}`;
    return `https://wa.me/5492804350717?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-white min-h-screen py-12 md:py-16 text-zinc-900">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/ayuda/devoluciones" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver a Políticas de Cambios y Devoluciones
          </Link>
        </div>

        {/* Encabezado */}
        <div className="border-b border-zinc-200 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/20">
            <RotateCcw className="w-3.5 h-3.5" /> Resolución 424/2020 Secretaría de Comercio Interior
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-950">
            Botón de Arrepentimiento
          </h1>
          <p className="mt-3 text-sm md:text-base text-zinc-600 leading-relaxed">
            Conforme a la Ley 24.240 de Defensa del Consumidor, tenés derecho a revocar la aceptación del producto adquirido dentro del plazo de <strong>10 (diez) días corridos</strong> contados a partir de la fecha de entrega, sin costo alguno.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-emerald-950">
              Solicitud de Revocación Registrada
            </h2>
            <p className="text-sm text-emerald-800 leading-relaxed max-w-lg mx-auto">
              Tu solicitud ha sido generada bajo el código de trámite:
            </p>
            <div className="inline-block px-4 py-2 bg-emerald-200/60 rounded-xl font-mono text-lg font-bold text-emerald-950">
              {trackingCode}
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
              Nos pondremos en contacto dentro de las próximas 24 horas hábiles a <strong>{email}</strong> para coordinar la logística de devolución y el reintegro total del importe.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={getWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> Notificar por WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <label htmlFor="orderNumber" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Número de Pedido *
              </label>
              <input
                id="orderNumber"
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: PED-1024 o ID de compra"
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Nombre y Apellido *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@email.com"
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 2804350717"
                  className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Motivo / Comentarios (Opcional)
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="No es obligatorio justificar tu decisión de acuerdo a la Ley 24.240. Podés dejarnos algún comentario si lo deseás."
                className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Solicitar Revocación de Compra
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 text-center leading-normal">
              Al enviar este formulario, se emitirá una constancia de trámite de arrepentimiento. KLONFARK asumirá los gastos de devolución de acuerdo a la normativa vigente.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}


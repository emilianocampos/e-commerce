import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, RotateCcw, AlertCircle, ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Políticas de Cambios, Devoluciones y Reembolsos | KLONFARK',
  description: 'Políticas oficiales de cambios, devoluciones y derecho de arrepentimiento de KLONFARK conforme a la legislación argentina y Google Merchant Center.',
};

export default function DevolucionesPage() {
  return (
    <div className="bg-white min-h-screen py-12 md:py-16 text-zinc-900">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </Link>
        </div>

        {/* Encabezado Principal */}
        <div className="border-b border-zinc-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" /> Política Oficial de Garantía y Compras
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-950">
            Políticas de Cambios, Devoluciones y Reembolsos
          </h1>
          <p className="mt-4 text-base md:text-lg text-zinc-600 leading-relaxed">
            En <strong>KLONFARK</strong> nos comprometemos con la transparencia y el cumplimiento estricto de la legislación de defensa del consumidor de la República Argentina. A continuación detallamos las condiciones aplicables a compras en nuestra tienda online.
          </p>
        </div>

        {/* Banner Destacado: Botón de Arrepentimiento */}
        <div className="bg-zinc-950 text-white rounded-2xl p-6 md:p-8 mb-12 shadow-xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <RotateCcw className="w-4 h-4" /> Derecho de Revocación (Ley 24.240)
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              ¿Querés cancelar tu compra reciente?
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
              Disponés de 10 días corridos desde la recepción del producto para ejercer tu derecho de arrepentimiento sin costo.
            </p>
          </div>
          <Link
            href="/arrepentimiento"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 active:scale-95"
          >
            Botón de Arrepentimiento
          </Link>
        </div>

        {/* Contenido Estructurado */}
        <div className="space-y-10 text-zinc-700 leading-relaxed">

          {/* 1. CAMBIOS DE INDUMENTARIA */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">1</span>
              Cambios de Indumentaria
            </h2>
            <ul className="space-y-3 text-zinc-700 text-sm md:text-base list-disc pl-5">
              <li>
                <strong>Plazo:</strong> Aceptamos cambios por talle o modelo dentro de los <strong>10 días corridos</strong> desde la recepción del producto.
              </li>
              <li>
                <strong>Condición de la prenda:</strong> Para los cambios voluntarios por talle o modelo, la prenda debe encontrarse <strong>sin uso</strong>, en las mismas condiciones en las que fue entregada y con sus <strong>etiquetas originales</strong> adheridas.
              </li>
              <li>
                <strong>Disponibilidad:</strong> Los cambios estarán sujetos a disponibilidad de stock al momento de procesar la solicitud.
              </li>
              <li>
                <strong>Costos de envío:</strong> Los gastos de envío de los cambios voluntarios por talle o modelo estarán a cargo del cliente, salvo que corresponda legalmente que los asuma KLONFARK (por ejemplo, en caso de fallas de fábrica o errores de despacho).
              </li>
            </ul>
          </section>

          {/* 2. DERECHO DE ARREPENTIMIENTO */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">2</span>
              Derecho de Arrepentimiento
            </h2>
            <ul className="space-y-3 text-zinc-700 text-sm md:text-base list-disc pl-5">
              <li>
                Las compras realizadas a través de nuestra tienda online cuentan con el derecho de arrepentimiento dentro de los <strong>10 días corridos</strong> desde la recepción del producto, conforme a la legislación argentina (Ley 24.240 y Resolución 424/2020 de la Secretaría de Comercio Interior).
              </li>
              <li>
                El cliente puede solicitar la devolución <strong>sin necesidad de justificar su decisión</strong>.
              </li>
              <li>
                En estos casos de revocación legal, <strong>KLONFARK se hará cargo de los gastos de devolución</strong>.
              </li>
              <li>
                Se realizará el reintegro correspondiente por el medio de pago utilizado (Mercado Pago / transferencia), conforme a los plazos y condiciones legales estipulados.
              </li>
              <li>
                Contás con un acceso visible al <Link href="/arrepentimiento" className="font-bold text-amber-600 hover:underline">Botón de Arrepentimiento</Link> en esta sección y al pie de página de la tienda, según la normativa vigente.
              </li>
            </ul>
          </section>

          {/* 3. SUPLEMENTOS DEPORTIVOS */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">3</span>
              Suplementos Deportivos
            </h2>
            <ul className="space-y-3 text-zinc-700 text-sm md:text-base list-disc pl-5">
              <li>
                Los suplementos comercializados por KLONFARK son minuciosamente <strong>revisados antes de su despacho</strong>.
              </li>
              <li>
                Se verifica rigurosamente el estado del envase, los precintos de seguridad termosellados, etiquetas y las fechas de vencimiento.
              </li>
              <li>
                Por motivos de seguridad alimentaria y control sanitario, <strong>no ofrecemos cambios voluntarios de marca o producto por preferencia personal</strong> una vez recibido o abierto el producto.
              </li>
              <li>
                El derecho de arrepentimiento y las devoluciones se atenderán conforme a la legislación vigente y las excepciones legalmente aplicables a productos de consumo y sellado bromatológico.
              </li>
              <li>
                Los productos que presenten defectos, fallas o inconvenientes de origen serán evaluados y se ofrecerá la solución que corresponda legalmente (reemplazo o reintegro total).
              </li>
            </ul>
          </section>

          {/* 4. PRODUCTOS CON DETALLES INFORMADOS */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">4</span>
              Productos con Detalles Informados
            </h2>
            <p className="text-sm md:text-base text-zinc-700">
              En caso de que un producto presente algún detalle estético, imperfección o particularidad especial, esta condición será <strong>informada expresamente en su publicación antes de realizar la compra</strong>, permitiendo al cliente conocer el estado exacto del artículo previo a su confirmación.
            </p>
          </section>

          {/* 5. PRODUCTOS DEFECTUOSOS O CON FALLAS */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">5</span>
              Productos Defectuosos o con Fallas
            </h2>
            <p className="text-sm md:text-base text-zinc-700 mb-3">
              Si el cliente recibe un producto con defectos, fallas de fabricación o características diferentes a las ofrecidas en la tienda, deberá comunicarse de inmediato con nuestro equipo de atención al cliente.
            </p>
            <p className="text-sm md:text-base font-semibold text-zinc-900">
              KLONFARK se hará cargo de la totalidad de los gastos logísticos necesarios para gestionar la solución correspondiente (cambio o reintegro total), de acuerdo con la legislación vigente.
            </p>
          </section>

          {/* 6. CONTACTO Y GESTIÓN */}
          <section className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">6</span>
              Contacto y Gestión
            </h2>
            <p className="text-sm md:text-base text-zinc-700 mb-6">
              Para iniciar cualquier solicitud de cambio, devolución o ejercer tu derecho de arrepentimiento, deberás comunicarte con nuestro equipo mediante los canales oficiales indicando tu <strong>número de pedido</strong> y el motivo de tu solicitud:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://wa.me/5492804350717?text=Hola%20KLONFARK,%20necesito%20gestionar%20un%20cambio%20o%20devolución%20de%20mi%20pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">WhatsApp Oficial</div>
                  <div className="text-xs text-zinc-500">+54 9 280 435-0717</div>
                </div>
              </a>

              <a
                href="mailto:emicampos1268@gmail.com?subject=Solicitud%20de%20Cambio%20o%20Devoluci%C3%B3n%20-%20KLONFARK"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-900 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">Correo Electrónico</div>
                  <div className="text-xs text-zinc-500">emicampos1268@gmail.com</div>
                </div>
              </a>
            </div>
          </section>
        </div>

        {/* Pie con última actualización */}
        <div className="mt-12 pt-8 border-t border-zinc-200 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>KLONFARK © 2026 — Políticas en conformidad con la Ley 24.240 y Google Merchant Center</span>
          <span>Actualizado: Noviembre de 2026</span>
        </div>
      </div>
    </div>
  );
}


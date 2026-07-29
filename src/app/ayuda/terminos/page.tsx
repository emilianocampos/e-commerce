import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones | DRAVENIX',
  description: 'Términos y condiciones legales de uso y compra en nuestra tienda online.',
};

export default function TerminosPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; Volver al inicio</Link>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-600">
          <p className="mb-6">
            Este documento describe los términos y condiciones generales aplicables al uso de los servicios ofrecidos por <strong>DRAVENIX</strong> dentro del sitio web.
            Cualquier persona que desee acceder y/o usar el sitio o los servicios podrá hacerlo sujetándose a estos Términos y Condiciones Generales.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">1. Registro y Capacidad</h2>
          <p className="mb-4">
            Los servicios sólo están disponibles para personas que tengan capacidad legal para contratar. No podrán utilizar los servicios las personas que no tengan esa capacidad, 
            los menores de edad o usuarios que hayan sido suspendidos temporalmente o inhabilitados definitivamente.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">2. Privacidad y Seguridad</h2>
          <p className="mb-4">
            Para utilizar los servicios ofrecidos por DRAVENIX, los usuarios deberán facilitar determinados datos de carácter personal. Su información personal se procesa y almacena en servidores o 
            medios magnéticos que mantienen altos estándares de seguridad y protección física y tecnológica. Para mayor información, por favor revisa nuestra <Link href="/ayuda/privacidad" className="text-blue-600 underline">Política de Privacidad</Link>.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">3. Pagos mediante Mercado Pago</h2>
          <p className="mb-4">
            Todas las transacciones y pagos realizados en nuestro sitio web son procesados de forma segura a través de <strong>Mercado Pago</strong> (MercadoLibre S.R.L.).
            Al realizar una compra, el usuario acepta estar sujeto a los términos y condiciones de uso de Mercado Pago.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Medios de Pago:</strong> Tarjetas de crédito, tarjetas de débito, dinero en cuenta de Mercado Pago y otros medios en efectivo que la plataforma habilite.</li>
            <li><strong>Seguridad de Datos:</strong> DRAVENIX <strong>NO almacena</strong> ni tiene acceso a los datos de tu tarjeta de crédito o débito. Toda la información sensible del pago es encriptada y procesada directamente por los servidores de Mercado Pago bajo sus estrictos protocolos de seguridad PCI-DSS.</li>
            <li><strong>Acreditación:</strong> La acreditación del pago puede ser inmediata o demorar según el medio elegido. El pedido se comenzará a preparar una vez que Mercado Pago notifique la confirmación exitosa de la transacción.</li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">4. Políticas de Cambios y Devoluciones (Botón de Arrepentimiento)</h2>
          <p className="mb-4">
            De acuerdo a la Ley de Defensa del Consumidor de la República Argentina (Ley 24.240), el usuario tiene derecho a revocar la compra durante el plazo de <strong>DIEZ (10) días corridos</strong> contados a partir de la fecha en que se entregue el producto.
            Para efectuar una devolución, el producto deberá encontrarse en perfecto estado, sin uso, y con sus etiquetas y embalaje original.
          </p>
          <p className="mb-4">
            El costo de envío por cambio de talle o modelo correrá por cuenta del cliente, a excepción de que el cambio sea por una falla de fábrica o error en el armado del pedido, 
            en cuyo caso DRAVENIX asumirá la totalidad de los costos logísticos.
          </p>
          <p className="mb-4">
            Los reembolsos por cancelaciones se realizarán utilizando el mismo medio de pago original de la compra a través de Mercado Pago.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">5. Propiedad Intelectual</h2>
          <p className="mb-4">
            Los contenidos de las pantallas relativas a los servicios de DRAVENIX como así también los programas, bases de datos, redes, archivos que permiten al usuario acceder y usar su cuenta, 
            son de propiedad de DRAVENIX y están protegidas por las leyes y los tratados internacionales de derecho de autor, marcas, patentes, modelos y diseños industriales. 
            El uso indebido y la reproducción total o parcial de dichos contenidos quedan prohibidos.
          </p>

          <p className="text-sm text-zinc-500 mt-12 pt-8 border-t border-zinc-200">
            Última actualización: 28 de Julio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}

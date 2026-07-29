import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | DRAVENIX',
  description: 'Política de privacidad y manejo de datos personales.',
};

export default function PrivacidadPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; Volver al inicio</Link>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-600">
          <p className="mb-6">
            En <strong>DRAVENIX</strong>, valoramos su privacidad y nos comprometemos a proteger sus datos personales. 
            Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y compartimos la información que obtenemos de usted al utilizar nuestro sitio web.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">1. Recopilación de Información</h2>
          <p className="mb-4">
            Recopilamos información personal (como nombre, correo electrónico, dirección de envío y número de teléfono) cuando:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Se registra para crear una cuenta en nuestro sitio.</li>
            <li>Realiza una compra o intenta realizarla.</li>
            <li>Se suscribe a nuestro boletín de noticias (Newsletter).</li>
            <li>Nos contacta a través de nuestros canales de soporte.</li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">2. Uso de la Información</h2>
          <p className="mb-4">
            La información recopilada es utilizada para:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Procesar y despachar sus pedidos correctamente.</li>
            <li>Comunicarnos con usted respecto al estado de su compra o responder a sus consultas de soporte.</li>
            <li>Mejorar nuestra tienda y personalizar su experiencia de usuario.</li>
            <li>Enviarle información sobre promociones o nuevos productos (sólo si ha dado su consentimiento, pudiendo desuscribirse en cualquier momento).</li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">3. Protección de Datos (Ley 25.326)</h2>
          <p className="mb-4">
            Garantizamos la confidencialidad de los datos personales facilitados por los usuarios y su tratamiento de acuerdo con la legislación vigente sobre 
            protección de datos personales de la República Argentina (<strong>Ley de Protección de Datos Personales N° 25.326</strong>).
          </p>
          <p className="mb-4">
            El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses.
            La Agencia de Acceso a la Información Pública, Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">4. Pasarelas de Pago</h2>
          <p className="mb-4">
            Nuestros pagos son procesados de forma segura a través de <strong>Mercado Pago</strong>. DRAVENIX no guarda ni tiene acceso a la información de su tarjeta de crédito o cuenta bancaria. 
            Esos datos son gestionados directamente por Mercado Pago bajo los más altos estándares internacionales de seguridad (PCI-DSS).
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">5. Cookies</h2>
          <p className="mb-4">
            Utilizamos "cookies" y tecnologías similares para recordar sus preferencias, analizar el tráfico y mantener los artículos en su carrito de compras.
            Usted puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se está enviando una cookie.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">6. Contacto para Gestión de Datos</h2>
          <p className="mb-4">
            Para ejercer sus derechos de acceso, rectificación, actualización o supresión de sus datos personales, puede comunicarse con nosotros enviando un correo electrónico a <strong>privacidad@dravenix.com</strong>.
          </p>

          <p className="text-sm text-zinc-500 mt-12 pt-8 border-t border-zinc-200">
            Última actualización: 28 de Julio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}

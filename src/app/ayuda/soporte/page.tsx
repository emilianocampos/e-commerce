import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Soporte al Cliente | DRAVENIX',
  description: 'Comunicate con nuestro equipo de soporte para resolver tus dudas.',
};

export default function SoportePage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; Volver al inicio</Link>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 mb-8">Soporte al Cliente</h1>
        
        <div className="prose prose-zinc max-w-none">
          <p className="text-lg text-zinc-600 mb-6">
            Estamos aquí para ayudarte. Si tienes preguntas sobre un pedido, necesitas asistencia para realizar una compra o tienes alguna consulta sobre nuestros productos, no dudes en contactarnos.
          </p>
          
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Canales de Atención</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-zinc-900">Correo Electrónico</h3>
                <p className="text-zinc-600">Puedes escribirnos en cualquier momento a <a href="mailto:soporte@dravenix.com" className="text-blue-600 underline">soporte@dravenix.com</a>. Intentaremos responderte en un plazo no mayor a 24 horas hábiles.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-zinc-900">WhatsApp</h3>
                <p className="text-zinc-600">Escríbenos a nuestro canal de WhatsApp: <strong>+54 9 11 1234-5678</strong> (Solo mensajes). Disponible de Lunes a Viernes de 9:00 a 18:00 hrs.</p>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900">Redes Sociales</h3>
                <p className="text-zinc-600">También puedes enviarnos un mensaje directo a través de nuestro <a href="#" className="text-blue-600 underline">Instagram</a> o <a href="#" className="text-blue-600 underline">Facebook</a>.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 mb-4 mt-8">Preguntas Frecuentes Rápidas</h2>
          <ul className="list-disc pl-6 space-y-3 text-zinc-600">
            <li><strong>¿Dónde está mi pedido?</strong> Puedes verificar el estado de tus envíos desde la sección <Link href="/mis-pedidos" className="text-blue-600 underline">Mis Pedidos</Link> utilizando tu código de seguimiento.</li>
            <li><strong>¿Cómo realizo un cambio?</strong> Si no estás conforme con el talle o producto, contáctanos dentro de los 30 días de realizada la compra para coordinar un cambio (sujeto a disponibilidad de stock).</li>
            <li><strong>¿Tienen local físico?</strong> Actualmente operamos de forma 100% online y realizamos envíos a todo el país.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

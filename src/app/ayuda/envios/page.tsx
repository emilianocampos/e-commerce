import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Detalles de Envío | DRAVENIX',
  description: 'Información sobre métodos, costos y tiempos de envío.',
};

export default function EnviosPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">&larr; Volver al inicio</Link>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 mb-8">Detalles de Envío</h1>
        
        <div className="prose prose-zinc max-w-none text-zinc-600">
          <p className="text-lg mb-6">
            En <strong>DRAVENIX</strong> trabajamos para que tus pedidos lleguen de manera rápida y segura. Realizamos envíos a todo el territorio de la República Argentina a través de <strong>Correo Argentino</strong>.
          </p>
          
          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">Opciones y Tiempos de Entrega</h2>
          <p className="mb-4">
            Dependiendo de tu ubicación geográfica, los tiempos estimados de entrega son:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>CABA y GBA:</strong> Entre 2 y 4 días hábiles una vez despachado el pedido.</li>
            <li><strong>Resto del país:</strong> Entre 4 y 7 días hábiles una vez despachado.</li>
            <li><strong>Provincias del Sur (Tierra del Fuego, Santa Cruz, Chubut):</strong> Entre 6 y 10 días hábiles.</li>
          </ul>
          <p className="text-sm bg-zinc-50 p-4 border border-zinc-200 rounded-xl">
            * <em>Nota: Los tiempos de envío corren a partir de que el pedido ha sido procesado, empaquetado y entregado al correo. Los pedidos realizados en días feriados o fines de semana serán procesados el siguiente día hábil.</em>
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">Costos de Envío</h2>
          <p className="mb-4">
            El costo del envío se calcula automáticamente durante el proceso de pago (Checkout) en base a tu código postal y al peso/volumen total de los productos en tu carrito. 
            Periódicamente ofrecemos promociones de <strong>Envío Gratis</strong> superando un monto mínimo de compra. Dicho monto será anunciado en nuestra página principal.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">Seguimiento de tu Paquete</h2>
          <p className="mb-4">
            Una vez que tu compra sea despachada, recibirás un correo electrónico con el número de seguimiento provisto por Correo Argentino. 
            Podrás ingresar ese código en el sitio oficial del correo para ver el estado de tu paquete en tiempo real.
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 mt-8 mb-4">Intentos de Entrega y Sucursal</h2>
          <p className="mb-4">
            Si seleccionas "Envío a Domicilio", el correo realizará hasta <strong>dos visitas</strong> a la dirección indicada. 
            Si en la segunda visita no se encuentra a nadie para recibir el paquete, el mismo permanecerá en la sucursal de Correo Argentino más cercana durante 5 a 7 días hábiles para ser retirado. 
            De no ser retirado a tiempo, el paquete volverá a nuestro depósito. En ese caso, deberás volver a abonar el envío para que te lo reenviemos.
          </p>
        </div>
      </div>
    </div>
  );
}

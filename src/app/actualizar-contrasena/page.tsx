import { ActualizarContrasenaForm } from './ActualizarContrasenaForm';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Restablecer Contraseña | KLONFARK',
  description: 'Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.',
};

export default function ActualizarContrasenaPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl corner-glow-card relative overflow-hidden bg-white dark:bg-zinc-900">
        <div className="mb-6 text-center relative z-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Crear Nueva Contraseña
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Ingresa y confirma tu nueva contraseña para asegurar tu cuenta.
          </p>
        </div>
        <div className="relative z-10">
          <ActualizarContrasenaForm />
        </div>
      </div>
    </div>
  );
}

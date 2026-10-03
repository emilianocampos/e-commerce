import { RecuperarContrasenaForm } from './RecuperarContrasenaForm';
import { KeyRound } from 'lucide-react';

export const metadata = {
  title: 'Recuperar Contraseña | KLONFARK',
  description: 'Restablece el acceso a tu cuenta mediante un correo electrónico.',
};

export default function RecuperarContrasenaPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl corner-glow-card relative overflow-hidden bg-white dark:bg-zinc-900">
        <div className="mb-6 text-center relative z-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white mb-4 shadow-inner">
            <KeyRound className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Ingresa tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.
          </p>
        </div>
        <div className="relative z-10">
          <RecuperarContrasenaForm />
        </div>
      </div>
    </div>
  );
}

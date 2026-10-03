'use client';

import { useState, useTransition } from 'react';
import { requestPasswordReset } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function RecuperarContrasenaForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string || '').trim();

    startTransition(async () => {
      const res = await requestPasswordReset(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setEmailSubmitted(email);
        setSuccessMessage(res.message || 'Se ha enviado un enlace de recuperación a tu correo.');
      }
    });
  };

  if (successMessage) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            ¡Correo enviado!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <strong className="text-zinc-900 dark:text-zinc-200">{emailSubmitted}</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3.5 text-xs text-zinc-500 dark:text-zinc-400 text-left space-y-1">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">¿No recibiste el correo?</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            <li>Revisa tu carpeta de correo no deseado o Spam.</li>
            <li>Asegúrate de haber ingresado el correo correcto.</li>
          </ul>
        </div>

        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setError(null);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Reintentar con otro correo
          </button>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200"
          htmlFor="email"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            autoFocus
            className="pl-10"
          />
          <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-sm font-bold mt-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando enlace...
          </span>
        ) : (
          'Enviar Enlace de Recuperación'
        )}
      </Button>

      <div className="text-center text-xs text-zinc-500 pt-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Iniciar Sesión
        </Link>
      </div>
    </form>
  );
}

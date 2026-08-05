'use client';

import { useActionState } from 'react';
import { login } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

// Definimos un action wrapper porque useActionState en React 19 requiere una firma específica
async function loginAction(prevState: any, formData: FormData) {
  return await login(formData);
}

export function LoginForm({ message }: { message?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm mb-6 flex items-start gap-3">
          <svg className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-emerald-800">¡Cuenta creada con éxito!</h3>
            <p className="mt-1 text-sm text-emerald-700 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      )}
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
      <div className="text-center text-sm text-zinc-500">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-zinc-900 underline underline-offset-4">
          Regístrate
        </Link>
      </div>
    </form>
  );
}

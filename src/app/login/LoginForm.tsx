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

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
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

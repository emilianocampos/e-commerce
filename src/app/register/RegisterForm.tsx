'use client';

import { useActionState } from 'react';
import { register } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Link from 'next/link';

async function registerAction(prevState: any, formData: FormData) {
  return await register(formData);
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

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
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>
      <div className="text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-zinc-900 underline underline-offset-4">
          Inicia Sesión
        </Link>
      </div>
    </form>
  );
}

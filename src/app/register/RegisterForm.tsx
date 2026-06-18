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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="nombre">Nombre</label>
          <Input id="nombre" name="nombre" placeholder="Juan" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="apellido">Apellido</label>
          <Input id="apellido" name="apellido" placeholder="Pérez" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="dni">DNI</label>
          <Input id="dni" name="dni" placeholder="12345678" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="telefono">Teléfono</label>
          <Input id="telefono" name="telefono" type="tel" placeholder="1122334455" required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="direccion">Dirección</label>
        <Input id="direccion" name="direccion" placeholder="Calle Falsa 123" required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ciudad">Ciudad</label>
          <Input id="ciudad" name="ciudad" placeholder="CABA" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provincia">Provincia</label>
          <Input id="provincia" name="provincia" placeholder="Buenos Aires" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="codigo_postal">CP</label>
          <Input id="codigo_postal" name="codigo_postal" placeholder="1000" required />
        </div>
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

import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Iniciar Sesión | E-commerce',
  description: 'Inicia sesión en tu cuenta para continuar.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-sm text-zinc-500">Ingresa tus credenciales para acceder</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

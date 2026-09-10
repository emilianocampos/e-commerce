import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Iniciar Sesión | KLONFARK',
  description: 'Inicia sesión en tu cuenta para continuar.',
};

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xl corner-glow-card relative overflow-hidden bg-white">
        <div className="mb-6 text-center relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-xs text-zinc-500 mt-1">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>
        <div className="relative z-10">
          <LoginForm message={searchParams.message} />
        </div>
      </div>
    </div>
  );
}

import { RegisterForm } from './RegisterForm';

export const metadata = {
  title: 'Crear Cuenta | KLONFARK',
  description: 'Regístrate para poder realizar compras y guardar tus pedidos.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xl corner-glow-card relative overflow-hidden bg-white">
        <div className="mb-6 text-center relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Crear una cuenta</h1>
          <p className="text-xs text-zinc-500 mt-1">Ingresa tus datos para registrarte y realizar tus pedidos</p>
        </div>
        <div className="relative z-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

import { RegisterForm } from './RegisterForm';

export const metadata = {
  title: 'Crear Cuenta | E-commerce',
  description: 'Regístrate para poder realizar compras y guardar tus pedidos.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Crear una cuenta</h1>
          <p className="text-sm text-zinc-500">Ingresa tus datos para registrarte</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

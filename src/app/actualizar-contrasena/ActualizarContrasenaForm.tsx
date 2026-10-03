'use client';

import { useState, useActionState, useEffect } from 'react';
import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

async function updatePasswordAction(prevState: any, formData: FormData) {
  return await updatePassword(formData);
}

export function ActualizarContrasenaForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si el usuario tiene una sesión activa (ej. llegó desde el link de recovery)
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // Supabase a veces recibe el token de recuperación en el hash (#access_token=...)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            setHasSession(true);
            setIsVerifyingSession(false);
            return;
          }
        }

        setHasSession(!!session);
      } catch (err) {
        console.error('Error verificando sesión:', err);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);

    if (password.length < 6) {
      e.preventDefault();
      setClientError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError('Las contraseñas no coinciden.');
      return;
    }
  };

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordLongEnough = password.length >= 6;

  if (isVerifyingSession) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <p className="text-xs">Verificando enlace de seguridad...</p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {(clientError || state?.error) && (
        <div className="rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{clientError || state?.error}</span>
        </div>
      )}

      {hasSession === false && (
        <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>
            Si abriste este enlace desde tu correo, ingresa tu nueva contraseña a continuación.
          </span>
        </div>
      )}

      {/* Nueva Contraseña */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200"
          htmlFor="password"
        >
          Nueva Contraseña *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] pl-10 pr-10 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          />
          <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
            <span className={isPasswordLongEnough ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-400'}>
              {isPasswordLongEnough ? '✓' : '•'} Mínimo 6 caracteres
            </span>
          </div>
        )}
      </div>

      {/* Confirmar Nueva Contraseña */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-bold uppercase tracking-wider block text-zinc-900 dark:text-zinc-200"
          htmlFor="confirm_password"
        >
          Confirmar Nueva Contraseña *
        </label>
        <div className="relative">
          <input
            id="confirm_password"
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#18181b] pl-10 pr-10 py-2 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          />
          <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && (
          <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
            {passwordsMatch ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Las contraseñas coinciden
              </span>
            ) : (
              <span className="text-red-500 font-semibold">
                ✕ Las contraseñas no coinciden
              </span>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || (password.length > 0 && confirmPassword.length > 0 && !passwordsMatch)}
        className="w-full h-11 text-sm font-bold mt-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Actualizando contraseña...
          </span>
        ) : (
          'Guardar Nueva Contraseña'
        )}
      </Button>

      <div className="text-center text-xs text-zinc-500 pt-2">
        <Link
          href="/login"
          className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 font-semibold transition-colors"
        >
          Volver a Iniciar Sesión
        </Link>
      </div>
    </form>
  );
}

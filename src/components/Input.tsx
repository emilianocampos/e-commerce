import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button'; // Reutilizamos la utilidad cn

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    const input = (
      <input
        id={inputId}
        name={name}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-zinc-300 px-3.5 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="space-y-1.5">
          <label htmlFor={inputId} className="block text-sm font-semibold">
            {label}
          </label>
          {input}
        </div>
      );
    }

    return input;
  }
);
Input.displayName = 'Input';

export { Input };

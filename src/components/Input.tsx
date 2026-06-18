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
          'flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="space-y-2">
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-900">
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

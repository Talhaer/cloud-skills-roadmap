import { ComponentProps } from 'react';
import clsx from 'clsx';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-indigo-500 text-white hover:bg-indigo-400',
        variant === 'secondary' && 'bg-slate-800 text-slate-100 hover:bg-slate-700',
        variant === 'ghost' && 'bg-transparent text-slate-200 hover:bg-slate-800',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500',
        className
      )}
      {...props}
    />
  );
}

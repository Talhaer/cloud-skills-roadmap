import { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-slate-800 bg-slate-900/60 p-4', className)}>
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

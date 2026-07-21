import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Card({ title, subtitle, actions, className, children, ...props }: CardProps) {
  return (
    <div className={cn("glass-card overflow-hidden flex flex-col", className)} {...props}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-dark-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6 flex-grow">
        {children}
      </div>
    </div>
  );
}

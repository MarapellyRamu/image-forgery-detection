import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

export default function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    default: 'bg-dark-800 text-dark-300 border border-dark-700',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

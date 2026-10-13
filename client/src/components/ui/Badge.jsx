import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  purple: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
  default: 'bg-[#27272A] text-[#F4F4F5] border-[#3F3F46]',
  muted: 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]',
  gold: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
  success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
  danger: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
  outline: 'bg-transparent text-[#A1A1AA] border-[#3F3F46]',
};

const sizes = {
  sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
  md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  lg: 'text-sm px-3 py-1.5 rounded-xl font-medium',
};

export function Badge({
  children,
  variant = 'purple',
  size = 'md',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border font-medium select-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

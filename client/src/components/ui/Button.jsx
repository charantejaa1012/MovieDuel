import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-lg shadow-purple-500/25 border border-purple-500/30 active:bg-purple-800',
  secondary:
    'bg-[#27272A] hover:bg-[#3F3F46] text-[#F4F4F5] border border-[#3F3F46]/60 active:bg-[#18181B]',
  outline:
    'bg-transparent hover:bg-[#27272A]/70 text-[#F4F4F5] border border-[#3F3F46] hover:border-purple-400/50',
  ghost:
    'bg-transparent hover:bg-[#27272A]/60 text-[#A1A1AA] hover:text-[#F4F4F5] border border-transparent',
  danger:
    'bg-[#EF4444] hover:bg-red-600 text-white shadow-lg shadow-red-500/20 border border-red-500/30',
  gold:
    'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold shadow-lg shadow-amber-500/20 border border-amber-400/40',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
  lg: 'text-base px-6 py-3 rounded-xl gap-2.5 h-12 font-semibold',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {LeftIcon && (
            <span className="shrink-0 flex items-center justify-center">
              {React.isValidElement(LeftIcon) ? LeftIcon : <LeftIcon className="w-4 h-4" />}
            </span>
          )}
          <span>{children}</span>
          {RightIcon && (
            <span className="shrink-0 flex items-center justify-center">
              {React.isValidElement(RightIcon) ? RightIcon : <RightIcon className="w-4 h-4" />}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;

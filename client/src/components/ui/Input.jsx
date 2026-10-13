import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    containerClassName,
    id,
    disabled,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3.5 flex items-center justify-center text-[#71717A] pointer-events-none">
            {React.isValidElement(LeftIcon) ? LeftIcon : <LeftIcon className="w-4 h-4" />}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full bg-[#18181B] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-[#F4F4F5] placeholder-[#71717A] transition-all duration-200 outline-none',
            'focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]',
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3.5 flex items-center justify-center text-[#71717A]">
            {React.isValidElement(RightIcon) ? RightIcon : <RightIcon className="w-4 h-4" />}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#EF4444] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#71717A] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

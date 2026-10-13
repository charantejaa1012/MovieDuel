import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const paddings = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef(function Card(
  {
    children,
    className,
    padding = 'md',
    interactive = false,
    glow = false,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-[#18181B] border border-[#3F3F46]/50 rounded-2xl transition-all duration-200 overflow-hidden',
        paddings[padding],
        interactive &&
          'hover:border-purple-500/50 hover:bg-[#27272A]/40 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer',
        glow && 'accent-glow border-purple-500/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;

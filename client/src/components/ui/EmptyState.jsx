import React from 'react';
import { Film } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function EmptyState({
  icon: Icon = Film,
  title = 'No movies found',
  description = 'Try searching with different keywords or exploring popular titles.',
  actionLabel,
  onAction,
  actionIcon,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-[#18181B]/50 border border-[#27272A] border-dashed my-6',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950/30">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-[#F4F4F5] mb-2">{title}</h3>
      <p className="text-sm text-[#A1A1AA] max-w-md mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          leftIcon={actionIcon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

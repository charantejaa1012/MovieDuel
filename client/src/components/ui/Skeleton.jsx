import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({
  variant = 'text',
  className,
  width,
  height,
  ...props
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'poster':
        return 'aspect-[2/3] rounded-2xl w-full';
      case 'card':
        return 'rounded-2xl w-full h-48';
      case 'text':
      default:
        return 'h-4 rounded-md w-full';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#27272A]/70 shimmer-effect',
        getVariantClasses(),
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <Skeleton variant="poster" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-1/4 h-3.5" />
          <Skeleton variant="text" className="w-1/4 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export function MovieDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="w-full h-80 sm:h-96 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton variant="poster" className="w-full max-w-sm mx-auto" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-32 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

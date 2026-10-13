import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Renders star rating (1-5 stars) computed from a 0-10 TMDB rating
 * @param {number} rating - Score out of 10 (e.g. 8.4)
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showScore - Whether to display numeric score
 */
export function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md',
  showScore = true,
  className,
}) {
  // Normalize 10-point scale to 5-star scale
  const normalized = Math.max(0, Math.min(5, (Number(rating) || 0) / 2));

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starIconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(100, (normalized - index) * 100));

          return (
            <div key={index} className="relative inline-block">
              {/* Background empty star */}
              <Star
                className={cn(starIconSize, 'text-[#3F3F46] fill-[#27272A]')}
              />
              {/* Foreground filled star with clip-path */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(starIconSize, 'text-amber-400 fill-amber-400')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-amber-300 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default StarRating;

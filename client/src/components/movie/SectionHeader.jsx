import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  viewAllLink,
  viewAllText = 'View All',
  children,
  className,
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/20 text-purple-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group shrink-0"
          >
            <span>{viewAllText}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default SectionHeader;

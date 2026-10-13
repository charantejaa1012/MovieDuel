import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';
import { cn } from '../../utils/cn';

export function MovieCarousel({
  movies = [],
  loading = false,
  skeletonCount = 6,
  cardWidthClassName = 'w-44 sm:w-52 md:w-56',
  className,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, movies, loading]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn('relative group/carousel w-full', className)}>
      {/* Left Chevron Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/80 hover:bg-purple-600 text-white flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>
      )}

      {/* Right Chevron Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/80 hover:bg-purple-600 text-white flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 -mr-0.5" />
        </button>
      )}

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto py-3 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <div
                key={`car-skeleton-${idx}`}
                className={cn('shrink-0 snap-start', cardWidthClassName)}
              >
                <MovieCardSkeleton />
              </div>
            ))
          : movies.map((movie) => (
              <div
                key={movie.id}
                className={cn('shrink-0 snap-start', cardWidthClassName)}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
      </div>
    </div>
  );
}

export default MovieCarousel;

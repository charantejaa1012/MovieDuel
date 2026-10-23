import React from 'react';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

export function MovieGrid({
  movies = [],
  loading = false,
  skeletonCount = 8,
  emptyTitle = 'No movies available',
  emptyDescription = 'Try adjusting your filters or search terms to discover films.',
  emptyActionLabel,
  onEmptyAction,
  columnsClassName = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  className,
}) {
  const movieList = Array.isArray(movies)
    ? movies
    : Array.isArray(movies?.results)
    ? movies.results
    : Array.isArray(movies?.data)
    ? movies.data
    : [];

  if (loading) {
    return (
      <div className={cn('grid gap-4 sm:gap-6', columnsClassName, className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MovieCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (!movieList || movieList.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  return (
    <div className={cn('grid gap-4 sm:gap-6', columnsClassName, className)}>
      {movieList.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default MovieGrid;

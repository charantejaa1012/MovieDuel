import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Swords, Bookmark, Info, Check } from 'lucide-react';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { getImageUrl, formatYear, formatRating } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export function MovieCard({
  movie,
  className,
  showActions = true,
  aspectRatio = 'aspect-[2/3]',
  priority = false,
}) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (!movie) return null;

  const isSaved = isInWatchlist(movie.id);
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const rating = movie.vote_average ? formatRating(movie.vote_average) : null;
  const year = formatYear(movie.release_date || movie.first_air_date);

  const handleDuelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/duel?m1=${movie.id}`);
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group relative rounded-2xl overflow-hidden bg-[#18181B] border border-[#27272A] hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-950/30 transition-all select-none',
        className
      )}
    >
      <Link to={`/movie/${movie.id}`} className="block relative w-full h-full">
        {/* Poster Image */}
        <div className={cn('relative w-full overflow-hidden bg-zinc-900', aspectRatio)}>
          <img
            src={posterUrl}
            alt={movie.title || 'Movie Poster'}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
            }}
          />

          {/* Rating Badge (Always visible in top right) */}
          {rating && rating !== 'N/A' && (
            <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* Watchlist Quick Indicator in Top Left */}
          {isSaved && (
            <div className="absolute top-2.5 left-2.5 z-10 p-1.5 rounded-lg bg-purple-600/90 text-white shadow-md">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}

          {/* Hover Gradient & Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
            {/* Title & Metadata */}
            <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 leading-tight mb-1">
              {movie.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mb-3">
              <span>{year}</span>
              {movie.genres && movie.genres[0] && (
                <>
                  <span>•</span>
                  <span className="truncate">{movie.genres[0].name || movie.genres[0]}</span>
                </>
              )}
            </div>

            {/* Quick Action Buttons */}
            {showActions && (
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleWatchlistClick}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-colors ${
                    isSaved
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                >
                  <Bookmark
                    className={cn('w-4 h-4 mb-0.5', isSaved && 'fill-white')}
                  />
                  <span>{isSaved ? 'Saved' : 'Watch'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDuelClick}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors shadow-md"
                  title="Duel with another movie"
                >
                  <Swords className="w-4 h-4 mb-0.5" />
                  <span>Duel</span>
                </button>

                <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors">
                  <Info className="w-4 h-4 mb-0.5" />
                  <span>Details</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Movie Title & Info below poster (always visible for clean browsing) */}
      <div className="p-3">
        <h4 className="text-sm font-semibold text-[#F4F4F5] truncate group-hover:text-purple-300 transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center justify-between text-xs text-[#A1A1AA] mt-1">
          <span>{year}</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            {rating}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default MovieCard;

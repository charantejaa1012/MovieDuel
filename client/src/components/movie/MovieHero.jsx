import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Info, Star, Play, Bookmark, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { getBackdropUrl, formatYear, formatRating } from '../../utils/formatters';

export function MovieHero({ movie, onOpenTrailer, loading = false }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (loading) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] bg-zinc-900 animate-pulse flex items-end p-8 sm:p-16">
        <div className="max-w-3xl space-y-4">
          <div className="h-6 w-32 bg-zinc-800 rounded-md" />
          <div className="h-12 w-3/4 bg-zinc-800 rounded-xl" />
          <div className="h-4 w-full bg-zinc-800 rounded-md" />
          <div className="h-4 w-2/3 bg-zinc-800 rounded-md" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-36 bg-zinc-800 rounded-xl" />
            <div className="h-12 w-36 bg-zinc-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const isSaved = isInWatchlist(movie.id);
  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
  const rating = formatRating(movie.vote_average);
  const year = formatYear(movie.release_date);

  return (
    <div className="relative w-full h-[75vh] min-h-[550px] max-h-[800px] overflow-hidden select-none">
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-105"
        />
        {/* Gradients to blend smoothly into page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/60 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl space-y-4 sm:space-y-5"
        >
          {/* Spotlight Tag & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              Featured Spotlight
            </span>

            {rating && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} Rating</span>
              </span>
            )}

            <span className="text-xs font-semibold text-[#A1A1AA]">{year}</span>

            {movie.genres?.slice(0, 2).map((g) => (
              <Badge key={g.id || g.name} variant="muted" size="sm">
                {g.name || g}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Overview */}
          <p className="text-sm sm:text-base text-[#D4D4D8] line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
            {movie.overview}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              leftIcon={Swords}
              onClick={() => navigate(`/duel?m1=${movie.id}`)}
              className="accent-glow"
            >
              Start Duel
            </Button>

            <Link to={`/movie/${movie.id}`}>
              <Button
                variant="secondary"
                size="lg"
                leftIcon={Info}
              >
                Movie Details
              </Button>
            </Link>

            {onOpenTrailer && (
              <Button
                variant="outline"
                size="lg"
                leftIcon={Play}
                onClick={onOpenTrailer}
                className="hidden sm:inline-flex"
              >
                Watch Trailer
              </Button>
            )}

            <button
              onClick={() => toggleWatchlist(movie)}
              className={`p-3.5 rounded-xl border transition-colors flex items-center justify-center ${
                isSaved
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30'
                  : 'bg-[#27272A]/80 text-[#F4F4F5] border-[#3F3F46] hover:bg-[#3F3F46]'
              }`}
              title={isSaved ? 'In your watchlist' : 'Add to watchlist'}
              aria-label="Toggle watchlist"
            >
              {isSaved ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MovieHero;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Info,
  Star,
  Play,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { getBackdropUrl, formatYear, formatRating } from '../../utils/formatters';

export function MovieHero({
  movies = [],
  movie = null, // backward compatibility for single movie
  onOpenTrailer,
  loading = false,
}) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Normalize movies list (support both array or single movie)
  const heroList = Array.isArray(movies) && movies.length > 0
    ? movies.slice(0, 7)
    : movie
    ? [movie]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-advance like Netflix every 6.5s unless paused
  useEffect(() => {
    if (heroList.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 6500);

    return () => clearInterval(timerRef.current);
  }, [heroList.length, isPaused]);

  if (loading) {
    return (
      <div className="relative w-full h-[75vh] min-h-[550px] max-h-[800px] bg-zinc-950 animate-pulse flex items-end p-8 sm:p-16">
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

  if (heroList.length === 0) return null;

  const currentMovie = heroList[currentIndex] || heroList[0];
  const isSaved = isInWatchlist(currentMovie.id);
  const backdropUrl = getBackdropUrl(currentMovie.backdrop_path, 'original');
  const rating = currentMovie.vote_average ? formatRating(currentMovie.vote_average) : null;
  const year = formatYear(currentMovie.release_date);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? heroList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroList.length);
  };

  return (
    <div
      className="relative w-full h-[75vh] min-h-[550px] max-h-[820px] overflow-hidden select-none bg-black group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrop with Smooth Crossfade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={backdropUrl}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.08]"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80';
            }}
          />
          {/* Multi-layered Cinematic Gradients for Seamless Page Integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Netflix-style Left & Right Navigation Arrows */}
      {heroList.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover/hero:opacity-100 transition-all duration-300 shadow-2xl"
            aria-label="Previous featured movie"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover/hero:opacity-100 transition-all duration-300 shadow-2xl"
            aria-label="Next featured movie"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl space-y-4 sm:space-y-5"
          >
            {/* Spotlight Tag & Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trending Spotlight #{currentIndex + 1}</span>
              </span>

              {rating && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating} Score</span>
                </span>
              )}

              {year && (
                <span className="text-xs font-semibold text-[#D4D4D8] px-2 py-0.5 rounded-md bg-black/50 border border-white/10 backdrop-blur-sm">
                  {year}
                </span>
              )}

              {currentMovie.genres?.slice(0, 2).map((g) => (
                <Badge key={g.id || g.name} variant="muted" size="sm">
                  {g.name || g}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
              {currentMovie.title}
            </h1>

            {/* Overview */}
            <p className="text-sm sm:text-base text-[#E4E4E7] line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
              {currentMovie.overview}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                leftIcon={Swords}
                onClick={() => navigate(`/duel?m1=${currentMovie.id}`)}
                className="accent-glow font-bold text-sm sm:text-base"
              >
                Duel This Movie
              </Button>

              <Link to={`/movie/${currentMovie.id}`}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={Info}
                  className="font-medium text-sm sm:text-base"
                >
                  Movie Details
                </Button>
              </Link>

              {onOpenTrailer && (
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={Play}
                  onClick={() => onOpenTrailer(currentMovie)}
                  className="font-medium text-sm sm:text-base border-white/30 hover:border-white text-white hover:bg-white/10"
                >
                  Watch Official Trailer
                </Button>
              )}

              <button
                type="button"
                onClick={() => toggleWatchlist(currentMovie)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
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
        </AnimatePresence>

        {/* Netflix-style Pagination Indicator Bars at Bottom Right */}
        {heroList.length > 1 && (
          <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2 z-20">
            {heroList.map((m, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative transition-all duration-300 rounded-full overflow-hidden ${
                    isActive ? 'w-8 h-2.5 bg-purple-500 shadow-lg shadow-purple-500/50' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}: ${m.title}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieHero;

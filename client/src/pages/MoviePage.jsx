import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Swords,
  Bookmark,
  Check,
  Play,
  Clock,
  Calendar,
  DollarSign,
  Film,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { CastList } from '../components/movie/CastList';
import { MovieCarousel } from '../components/movie/MovieCarousel';
import { TrailerModal } from '../components/movie/TrailerModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MovieDetailsSkeleton } from '../components/ui/Skeleton';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useWatchlist } from '../contexts/WatchlistContext';
import * as api from '../services/api';
import {
  getImageUrl,
  getBackdropUrl,
  formatRating,
  formatRuntime,
  formatDate,
  formatYear,
  formatVoteCount,
  formatCurrency,
} from '../utils/formatters';

export function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getMovieDetails(id);
        const data = res.movie || res.data;
        if (isMounted) {
          setMovie(data);
        }

        // Fetch similar/popular movies for recommendations carousel
        const popRes = await api.getPopular();
        if (isMounted) {
          const popList = popRes.results || popRes.data || [];
          setSimilarMovies(popList.filter((m) => String(m.id) !== String(id)));
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load movie details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <MovieDetailsSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <ErrorBanner
          message={error || 'Movie not found.'}
          onRetry={() => window.location.reload()}
        />
        <Link to="/search">
          <Button variant="primary" leftIcon={ChevronLeft}>
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const isSaved = isInWatchlist(movie.id);
  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown';
  const trailerKey = movie.videos?.results?.[0]?.key;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Backdrop Header with Gradient */}
      <div className="relative w-full h-[55vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <img
          src={backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-[0.5] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-transparent to-transparent" />
      </div>

      {/* Main Content Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-64 relative z-10 w-full space-y-12">
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-56 sm:w-64 md:w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#3F3F46] bg-zinc-900"
            >
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Details & Actions Column */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            {/* Title & Tagline */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {movie.genres?.map((g) => (
                  <Badge key={g.id || g.name} variant="purple">
                    {g.name || g}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-sm sm:text-base italic text-purple-300 font-medium mt-1">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#A1A1AA] py-3 border-y border-[#27272A]">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-base text-white">
                  {formatRating(movie.vote_average)}
                </span>
                <span className="text-xs text-[#71717A]">
                  ({formatVoteCount(movie.vote_count)} votes)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formatDate(movie.release_date)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Film className="w-4 h-4 text-purple-400" />
                <span>Director: <strong className="text-white">{director}</strong></span>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Overview
              </h3>
              <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {movie.overview}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                leftIcon={Swords}
                onClick={() => navigate(`/duel?m1=${movie.id}`)}
                className="accent-glow"
              >
                Duel this Movie
              </Button>

              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="lg"
                leftIcon={isSaved ? Check : Bookmark}
                onClick={() => toggleWatchlist(movie)}
              >
                {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                leftIcon={Play}
                onClick={() => setTrailerOpen(true)}
              >
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>

        {/* Cast & Crew Section */}
        <section className="space-y-4 pt-6 border-t border-[#27272A]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Top Cast</h3>
          </div>
          <CastList cast={movie.credits?.cast?.slice(0, 10)} />
        </section>

        {/* Financial & Production Metadata */}
        {(movie.budget > 0 || movie.revenue > 0) && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#18181B] rounded-2xl border border-[#27272A]">
            <div>
              <span className="text-xs text-[#71717A] uppercase font-bold">Budget</span>
              <p className="text-base font-extrabold text-white mt-1">
                {formatCurrency(movie.budget)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#71717A] uppercase font-bold">Revenue</span>
              <p className="text-base font-extrabold text-emerald-400 mt-1">
                {formatCurrency(movie.revenue)}
              </p>
            </div>
            <div>
              <span className="text-xs text-[#71717A] uppercase font-bold">Status</span>
              <p className="text-base font-extrabold text-white mt-1">Released</p>
            </div>
            <div>
              <span className="text-xs text-[#71717A] uppercase font-bold">Popularity</span>
              <p className="text-base font-extrabold text-purple-400 mt-1">
                {movie.popularity?.toFixed(0) || 'High'}
              </p>
            </div>
          </section>
        )}

        {/* Similar / More Like This Carousel */}
        <section className="space-y-4 pt-6 pb-12 border-t border-[#27272A]">
          <h3 className="text-xl font-bold text-white">
            More Films You Might Like
          </h3>
          <MovieCarousel movies={similarMovies} />
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailerKey}
        title={`${movie.title} — Trailer`}
      />
    </div>
  );
}

export default MoviePage;

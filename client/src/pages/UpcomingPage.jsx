import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  Swords,
  Play,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  CalendarDays,
  Info,
} from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { TrailerModal } from '../components/movie/TrailerModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useWatchlist } from '../contexts/WatchlistContext';
import * as api from '../services/api';
import { getImageUrl, formatRating } from '../utils/formatters';

const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

function formatFullReleaseDate(dateStr) {
  if (!dateStr) return 'TBA 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getCountdownBadge(dateStr) {
  if (!dateStr) return { label: 'Coming Soon', color: 'bg-zinc-800 text-zinc-300' };
  try {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'In Theaters Now', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/30' };
    }
    if (diffDays === 1) {
      return { label: 'Releasing Tomorrow!', color: 'bg-amber-950 text-amber-300 border-amber-500/30 animate-pulse' };
    }
    if (diffDays <= 7) {
      return { label: `In ${diffDays} Days`, color: 'bg-amber-950/80 text-amber-300 border-amber-500/30' };
    }
    if (diffDays <= 30) {
      return { label: `In ${Math.ceil(diffDays / 7)} Weeks`, color: 'bg-purple-950/80 text-purple-300 border-purple-500/30' };
    }
    const months = Math.ceil(diffDays / 30);
    return { label: `In ${months} Months`, color: 'bg-blue-950/70 text-blue-300 border-blue-500/30' };
  } catch {
    return { label: 'Coming Soon', color: 'bg-zinc-800 text-zinc-300' };
  }
}

export function UpcomingPage() {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: 'timetable' | 'calendar' | 'grid'
  const [activeView, setActiveView] = useState('timetable');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Calendar month navigation (0 = current month, +1 = next month, etc.)
  const [monthOffset, setMonthOffset] = useState(0);

  // Trailer modal state
  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    videoKey: null,
    title: '',
  });

  const fetchUpcoming = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUpcoming(1);
      const payload = res?.data ?? res;
      const list = payload?.results || (Array.isArray(payload) ? payload : (Array.isArray(res) ? res : []));
      setMovies(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load upcoming movies:', err);
      setError('Could not fetch latest release schedule. Showing offline premiere calendar.');
      setMovies(api.FALLBACK_UPCOMING_MOVIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handleOpenTrailer = async (movie) => {
    if (!movie) return;
    try {
      let videoKey =
        movie.videos?.results?.find(
          (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
        )?.key ||
        movie.videos?.results?.find((v) => v.site === 'YouTube')?.key;

      if (!videoKey) {
        const videos = await api.getMovieVideos(movie.id);
        const trailer =
          videos.find(
            (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
          ) ||
          videos.find((v) => v.site === 'YouTube') ||
          videos[0];

        if (trailer?.key) {
          videoKey = trailer.key;
        }
      }

      setTrailerModal({
        isOpen: true,
        videoKey: videoKey || null,
        title: `${movie.title} — Official Teaser / Trailer`,
      });
    } catch {
      setTrailerModal({
        isOpen: true,
        videoKey: null,
        title: `${movie.title} — Official Trailer`,
      });
    }
  };

  // Filtered & Chronologically Sorted Movies
  const filteredUpcoming = useMemo(() => {
    let list = [...movies];

    if (selectedGenre !== 'all') {
      const gId = Number(selectedGenre);
      list = list.filter((m) => {
        if (Array.isArray(m.genre_ids)) return m.genre_ids.includes(gId);
        if (Array.isArray(m.genres)) return m.genres.some((g) => g.id === gId);
        return false;
      });
    }

    // Sort strictly chronological by release date
    return list.sort((a, b) => {
      const dateA = new Date(a.release_date || '2099-01-01').getTime();
      const dateB = new Date(b.release_date || '2099-01-01').getTime();
      return dateA - dateB;
    });
  }, [movies, selectedGenre]);

  // Calendar calculations for selected month view
  const currentCalendarDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthName = currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Group movies by release date
  const moviesByDate = useMemo(() => {
    const map = {};
    for (const m of filteredUpcoming) {
      if (m.release_date) {
        if (!map[m.release_date]) map[m.release_date] = [];
        map[m.release_date].push(m);
      }
    }
    return map;
  }, [filteredUpcoming]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-[85vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Premiere Schedule & Timetable</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Upcoming Theatrical Releases
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Explore confirmed release dates, premiere countdowns, and trailer drops. Queue films to your watchlist or prepare future Duel clashes.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchUpcoming} />}

      {/* Control Bar: View Toggle, Month Nav & Genre Pills */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-y border-[#27272A] py-4">
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#18181B] border border-[#27272A]">
          <button
            type="button"
            onClick={() => setActiveView('timetable')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'timetable'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Release Timetable</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'calendar'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Month Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'grid'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Poster Grid</span>
          </button>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-3.5 h-3.5 text-[#71717A] shrink-0 mr-1" />
          <button
            type="button"
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              selectedGenre === 'all'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border-[#27272A]'
            }`}
          >
            All Genres
          </button>
          {[28, 878, 12, 35, 18, 27, 16, 53].map((gId) => (
            <button
              key={gId}
              type="button"
              onClick={() => setSelectedGenre(gId)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                selectedGenre === gId
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border-[#27272A]'
              }`}
            >
              {GENRE_MAP[gId]}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Chronological Release Timetable (Default) */}
      {activeView === 'timetable' && (
        <div className="space-y-8">
          {filteredUpcoming.length === 0 && !loading && (
            <div className="text-center py-16 text-[#A1A1AA] text-sm">
              No upcoming titles found in this category.
            </div>
          )}

          {filteredUpcoming.map((movie) => {
            const isSaved = isInWatchlist(movie.id);
            const countdown = getCountdownBadge(movie.release_date);
            const genres = movie.genre_ids?.map((id) => GENRE_MAP[id]).filter(Boolean) || [];

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl p-5 sm:p-7 bg-[#18181B] border border-[#27272A] hover:border-purple-500/40 transition-all shadow-xl flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Poster Thumbnail */}
                <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 shrink-0">
                  <img
                    src={getImageUrl(movie.poster_path, 'w342')}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=342&auto=format&fit=crop';
                    }}
                  />
                  {movie.vote_average ? (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/20">
                      ⭐ {formatRating(movie.vote_average)}
                    </div>
                  ) : null}
                </div>

                {/* Details Column */}
                <div className="flex-1 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Countdown Tag */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${countdown.color}`}
                    >
                      {countdown.label}
                    </span>

                    {/* Exact Release Date Badge */}
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46]">
                      <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{formatFullReleaseDate(movie.release_date)}</span>
                    </span>

                    {genres.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="text-[11px] font-medium text-[#A1A1AA] bg-[#27272A]/60 px-2.5 py-0.5 rounded-lg border border-white/5"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-white hover:text-purple-300 transition-colors">
                    <button
                      type="button"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="text-left cursor-pointer"
                    >
                      {movie.title}
                    </button>
                  </h3>

                  {/* Overview */}
                  <p className="text-sm text-[#D4D4D8] line-clamp-3 leading-relaxed">
                    {movie.overview || 'Premiere storyline and release details announced soon.'}
                  </p>

                  {/* Timetable Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={Play}
                      onClick={() => handleOpenTrailer(movie)}
                      className="font-bold text-xs"
                    >
                      Watch Trailer
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Swords}
                      onClick={() => navigate(`/duel?m1=${movie.id}`)}
                      className="font-bold text-xs"
                    >
                      Duel This Film
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={Info}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="font-medium text-xs"
                    >
                      Full Details
                    </Button>

                    <Button
                      variant={isSaved ? 'secondary' : 'outline'}
                      size="sm"
                      leftIcon={isSaved ? Check : Bookmark}
                      onClick={() => toggleWatchlist(movie)}
                      className="text-xs"
                    >
                      {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Interactive Month Calendar */}
      {activeView === 'calendar' && (
        <div className="space-y-6">
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between bg-[#18181B] p-4 rounded-2xl border border-[#27272A]">
            <button
              type="button"
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="p-2 rounded-xl bg-[#27272A] hover:bg-purple-950/60 text-white transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-black text-white">
                {monthName}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-2 rounded-xl bg-[#27272A] hover:bg-purple-950/60 text-white transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Chronological List of Releases in This Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpcoming.map((movie) => {
              const countdown = getCountdownBadge(movie.release_date);
              return (
                <div
                  key={`cal-${movie.id}`}
                  className="rounded-2xl p-4 bg-[#18181B] border border-[#27272A] hover:border-purple-500/50 transition-all flex gap-3.5 items-center group cursor-pointer shadow-lg"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <img
                    src={getImageUrl(movie.poster_path, 'w92')}
                    alt={movie.title}
                    className="w-14 h-20 object-cover rounded-xl bg-zinc-900 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1 ${countdown.color}`}
                    >
                      {formatFullReleaseDate(movie.release_date)}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300">
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      {countdown.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Poster Grid */}
      {activeView === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 pb-12">
          {filteredUpcoming.map((movie) => {
            const countdown = getCountdownBadge(movie.release_date);
            return (
              <div key={`grid-${movie.id}`} className="relative group/card flex flex-col">
                <MovieCard movie={movie} />
                <div className="mt-1.5 flex flex-col">
                  <span
                    className={`inline-block text-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${countdown.color}`}
                  >
                    {countdown.label}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA] text-center mt-0.5">
                    {movie.release_date || '2026'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ ...trailerModal, isOpen: false })}
        videoKey={trailerModal.videoKey}
        title={trailerModal.title}
      />
    </div>
  );
}

export default UpcomingPage;

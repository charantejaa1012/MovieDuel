import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeftRight, Star, Swords, Film, Sparkles, Check } from 'lucide-react';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { getImageUrl, formatYear, formatRating } from '../../utils/formatters';

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

const QUICK_CONTENDERS = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    vote_average: 8.3,
    release_date: '2024-02-27',
    genre_ids: [878, 12],
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    genre_ids: [18, 28],
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    vote_average: 8.1,
    release_date: '2023-07-19',
    genre_ids: [18, 36],
  },
  {
    id: 27205,
    title: 'Inception',
    poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    genre_ids: [28, 878],
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    vote_average: 7.6,
    release_date: '2024-06-11',
    genre_ids: [16, 10751],
  },
];

function getGenreLabel(movie) {
  if (!movie) return 'Film';
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map((g) => g.name).slice(0, 2).join(' / ');
  }
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    const names = movie.genre_ids.map((id) => GENRE_MAP[id]).filter(Boolean);
    if (names.length > 0) return names.slice(0, 2).join(' / ');
  }
  return 'Feature Film';
}

function MovieSelectSlot({
  slotLabel,
  movie,
  onSelect,
  onClear,
  colorAccent = 'purple',
}) {
  const { query, setQuery, results, loading, error, clear } = useMovieSearch('', 250);

  const handlePickMovie = (picked) => {
    onSelect(picked);
    clear();
  };

  const handleClearMovie = () => {
    onClear();
    clear();
  };

  const safeResults = Array.isArray(results)
    ? results
    : Array.isArray(results?.results)
    ? results.results
    : Array.isArray(results?.data)
    ? results.data
    : [];

  return (
    <div className="flex-1 flex flex-col bg-[#18181B] border border-[#3F3F46] rounded-3xl p-5 sm:p-6 shadow-xl relative min-h-[380px]">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
            colorAccent === 'purple'
              ? 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
              : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
          }`}
        >
          {slotLabel}
        </span>

        {movie && (
          <button
            type="button"
            onClick={handleClearMovie}
            className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-[#27272A] border border-transparent hover:border-[#3F3F46]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        )}
      </div>

      {/* When movie is selected */}
      {movie ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center flex-1 justify-center py-2"
        >
          <div className="relative w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30 mb-4 group">
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
              }}
            />
            {movie.vote_average ? (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            ) : null}
          </div>

          <h3 className="text-lg font-bold text-white line-clamp-1 max-w-xs">
            {movie.title}
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {formatYear(movie.release_date)} • {getGenreLabel(movie)}
          </p>
        </motion.div>
      ) : (
        /* Movie Search & Select View */
        <div className="flex-1 flex flex-col justify-start">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title by name..."
              className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={clear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Contenders Pills (when not actively searching) */}
          {!query.trim() && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Quick Picks:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CONTENDERS.map((qc) => (
                  <button
                    key={qc.id}
                    type="button"
                    onClick={() => handlePickMovie(qc)}
                    className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-purple-900/40 border border-[#3F3F46] hover:border-purple-500/50 text-[11px] font-medium text-[#D4D4D8] hover:text-white transition-all text-left"
                  >
                    {qc.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Dropdown / Results list */}
          <div className="flex-1 overflow-y-auto max-h-60 no-scrollbar space-y-1.5 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2">
                <Film className="w-4 h-4 animate-spin text-purple-400" />
                <span>Searching movies...</span>
              </div>
            ) : safeResults.length > 0 ? (
              safeResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePickMovie(item)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#27272A]/50 hover:bg-[#27272A] border border-transparent hover:border-purple-500/40 text-left transition-all group"
                >
                  <img
                    src={getImageUrl(item.poster_path, 'w92')}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded-lg bg-zinc-900 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=92&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      {formatYear(item.release_date)}
                      {item.vote_average ? ` • ⭐ ${formatRating(item.vote_average)}` : ''}
                      {` • ${getGenreLabel(item)}`}
                    </p>
                  </div>
                </button>
              ))
            ) : query.trim() ? (
              <div className="p-8 text-center text-xs text-[#A1A1AA]">
                {error ? 'Search temporarily unavailable. Select from Quick Picks.' : 'No matching movies found.'}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-[#71717A]">
                <Film className="w-6 h-6 mb-1 opacity-40" />
                <p className="text-xs">Type a movie title or choose a Quick Pick</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DuelSelector({
  movie1,
  movie2,
  onSelectMovie1,
  onSelectMovie2,
  onSwap,
}) {
  return (
    <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full max-w-4xl mx-auto">
      {/* Slot A */}
      <MovieSelectSlot
        slotLabel="Contender A"
        movie={movie1}
        onSelect={onSelectMovie1}
        onClear={() => onSelectMovie1(null)}
        colorAccent="purple"
      />

      {/* Center VS Clash Badge & Swap Button */}
      <div className="flex flex-col items-center justify-center shrink-0 z-10 -my-3 md:my-0">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-600 p-0.5 shadow-2xl shadow-purple-950/60 flex items-center justify-center cursor-pointer"
          onClick={onSwap}
          title="Swap contenders"
        >
          <div className="w-full h-full bg-[#18181B] rounded-[14px] flex flex-col items-center justify-center hover:bg-[#27272A] transition-colors">
            <span className="font-black text-sm sm:text-base text-purple-400 tracking-wider">
              VS
            </span>
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#A1A1AA] -mt-0.5" />
          </div>
        </motion.div>
      </div>

      {/* Slot B */}
      <MovieSelectSlot
        slotLabel="Contender B"
        movie={movie2}
        onSelect={onSelectMovie2}
        onClear={() => onSelectMovie2(null)}
        colorAccent="rose"
      />
    </div>
  );
}

export default DuelSelector;

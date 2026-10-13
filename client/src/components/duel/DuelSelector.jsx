import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowLeftRight, Star, Swords, Film } from 'lucide-react';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { getImageUrl, formatYear, formatRating } from '../../utils/formatters';

function MovieSelectSlot({
  slotLabel,
  movie,
  onSelect,
  onClear,
  colorAccent = 'purple',
}) {
  const [isSearching, setIsSearching] = useState(false);
  const { query, setQuery, results, loading, clear } = useMovieSearch('', 250);

  const handlePickMovie = (picked) => {
    onSelect(picked);
    setIsSearching(false);
    clear();
  };

  const handleClearMovie = () => {
    onClear();
    clear();
    setIsSearching(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#18181B] border border-[#3F3F46] rounded-3xl p-5 sm:p-6 shadow-xl relative min-h-[360px]">
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
            onClick={handleClearMovie}
            className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-[#27272A]"
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
            />
            {movie.vote_average && (
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{formatRating(movie.vote_average)}</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-white line-clamp-1 max-w-xs">
            {movie.title}
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {formatYear(movie.release_date)} • {movie.genres?.[0]?.name || 'Film'}
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
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearching(true);
              }}
              placeholder="Search title to add..."
              className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Search Dropdown / Results list */}
          <div className="flex-1 overflow-y-auto max-h-64 no-scrollbar space-y-1.5 pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2">
                <Film className="w-4 h-4 animate-spin text-purple-400" />
                <span>Searching movies...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePickMovie(item)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-[#27272A]/50 hover:bg-[#27272A] border border-transparent hover:border-purple-500/40 text-left transition-all group"
                >
                  <img
                    src={getImageUrl(item.poster_path, 'w92')}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded-lg bg-zinc-900 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                      {formatYear(item.release_date)}
                      {item.vote_average ? ` • ⭐ ${formatRating(item.vote_average)}` : ''}
                    </p>
                  </div>
                </button>
              ))
            ) : query.trim() ? (
              <div className="p-8 text-center text-xs text-[#A1A1AA]">
                No matching movies found.
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#71717A]">
                <Film className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">Type a movie title above to select for duel</p>
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

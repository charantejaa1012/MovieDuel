import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ArrowUpDown, Trash2, Swords, Compass } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useWatchlist } from '../contexts/WatchlistContext';

export function WatchlistPage() {
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  const sortedList = useMemo(() => {
    const list = [...watchlist];
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'title':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'year':
        return list.sort((a, b) => {
          const yA = new Date(a.release_date || 0).getFullYear() || 0;
          const yB = new Date(b.release_date || 0).getFullYear() || 0;
          return yB - yA;
        });
      case 'recent':
      default:
        return list;
    }
  }, [watchlist, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[80vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#27272A] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-400">
              <Bookmark className="w-5 h-5 fill-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              My Watchlist
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            Saved movies queued for future viewing or duel confrontations ({watchlist.length})
          </p>
        </div>

        {/* Sort Controls */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#71717A]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#18181B] border border-[#3F3F46] rounded-xl px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-purple-500"
            >
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="year">Release Year</option>
            </select>
          </div>
        )}
      </div>

      {/* Watchlist Grid or Empty State */}
      {sortedList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {sortedList.map((movie) => (
            <div key={movie.id} className="relative group/item flex flex-col">
              <MovieCard movie={movie} />
              {/* Quick remove pill */}
              <button
                onClick={() => removeFromWatchlist(movie.id)}
                className="absolute top-2 left-2 z-30 p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-[#A1A1AA] hover:text-white transition-colors opacity-0 group-hover/item:opacity-100"
                title="Remove from watchlist"
                aria-label="Remove movie from watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          description="You haven't saved any movies yet. Explore trending films or launch duels to find movies worth watching."
          actionLabel="Explore Movies"
          actionIcon={Compass}
          onAction={() => navigate('/search')}
        />
      )}
    </div>
  );
}

export default WatchlistPage;

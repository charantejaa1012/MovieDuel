import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Film, X, RefreshCw, Compass } from 'lucide-react';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { MovieGrid } from '../components/movie/MovieGrid';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorBanner } from '../components/ui/ErrorBanner';

const QUICK_SEARCH_TAGS = [
  'Inception',
  'Dune',
  'Interstellar',
  'Oppenheimer',
  'Batman',
  'Avengers',
  'Spider-Man',
  'Godzilla',
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const {
    query,
    setQuery,
    results,
    loading,
    error,
    hasSearched,
    clear,
  } = useMovieSearch(initialQuery, 300);

  // Sync search input with URL params
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== query) {
      setQuery(urlQ);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSelectQuickTag = (tag) => {
    setQuery(tag);
    setSearchParams({ q: tag });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[80vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Universal Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Explore Cinema
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Search through thousands of movies by title, franchise, or keywords to inspect details or launch duels.
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Type a movie title (e.g. Dune, Inception, Dark Knight)..."
            className="w-full bg-[#18181B] border-2 border-[#3F3F46] focus:border-purple-500 rounded-2xl pl-12 pr-12 py-3.5 text-base text-white placeholder-[#71717A] outline-none shadow-xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                clear();
                setSearchParams({});
              }}
              className="absolute right-4 p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-[#71717A] font-medium mr-1">Popular:</span>
          {QUICK_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelectQuickTag(tag)}
              className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-purple-950/60 hover:border-purple-500/40 border border-[#3F3F46] text-xs text-[#A1A1AA] hover:text-purple-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => setQuery(query)}
        />
      )}

      {/* Results Section */}
      <div className="flex-1">
        {hasSearched ? (
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#27272A]">
              <p className="text-sm font-semibold text-[#A1A1AA]">
                Found{' '}
                <span className="text-white font-bold">{results.length}</span>{' '}
                results for &ldquo;
                <span className="text-purple-300">{query}</span>&rdquo;
              </p>
            </div>

            <MovieGrid
              movies={results}
              loading={loading}
              skeletonCount={12}
              emptyTitle={`No movies found for "${query}"`}
              emptyDescription="We couldn't find any films matching your search terms. Check your spelling or try another title."
            />
          </div>
        ) : loading ? (
          <MovieGrid loading={true} skeletonCount={12} />
        ) : (
          /* Initial State before search */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Film className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Ready to Discover
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm">
              Start typing in the search box above to browse movies, read plot breakdowns, or add them straight into the Duel Arena.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;

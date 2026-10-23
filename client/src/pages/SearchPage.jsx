import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Film, X, Compass, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { MovieGrid } from '../components/movie/MovieGrid';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import * as api from '../services/api';

const QUICK_SEARCH_TAGS = [
  'Dune',
  'Interstellar',
  'Oppenheimer',
  'Inception',
  'The Dark Knight',
  'Inside Out',
  'Spider-Man',
  'Avengers',
];

const GENRE_FILTERS = [
  { id: 'all', name: 'All Films' },
  { id: 28, name: 'Action' },
  { id: 878, name: 'Sci-Fi' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 53, name: 'Thriller' },
  { id: 27, name: 'Horror' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Local input state for instant responsive typing
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Preloaded explore catalog when query is empty
  const [exploreMovies, setExploreMovies] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(true);

  const {
    query,
    setQuery,
    results,
    loading: searchLoading,
    error: searchError,
    hasSearched,
    clear,
  } = useMovieSearch(urlQuery, 300);

  // Sync search input if URL changes externally
  useEffect(() => {
    if (urlQuery !== searchInput) {
      setSearchInput(urlQuery);
      setQuery(urlQuery);
    }
  }, [urlQuery]);

  // Pre-load explore trending/popular movies
  useEffect(() => {
    let isMounted = true;
    const loadExploreCatalog = async () => {
      setExploreLoading(true);
      try {
        const [trendingRes, popularRes] = await Promise.all([
          api.getTrending('week'),
          api.getPopular(1),
        ]);

        const toArray = (r) => {
          if (!r) return [];
          const payload = r.data ?? r;
          if (Array.isArray(payload?.results)) return payload.results;
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(r.results)) return r.results;
          return [];
        };

        const combined = [...toArray(trendingRes), ...toArray(popularRes)];
        // Deduplicate by ID
        const seen = new Set();
        const unique = [];
        for (const m of combined) {
          if (m?.id && !seen.has(m.id)) {
            seen.add(m.id);
            unique.push(m);
          }
        }

        if (isMounted) {
          setExploreMovies(unique);
        }
      } catch (err) {
        console.error('Failed to preload explore movies:', err);
      } finally {
        if (isMounted) {
          setExploreLoading(false);
        }
      }
    };

    loadExploreCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSelectQuickTag = (tag) => {
    setSearchInput(tag);
    setQuery(tag);
    setSearchParams({ q: tag });
  };

  const handleClear = () => {
    setSearchInput('');
    clear();
    setSearchParams({});
  };

  // Determine active movie list to display
  const isSearchActive = Boolean(searchInput.trim());
  const rawList = isSearchActive ? (Array.isArray(results) ? results : []) : exploreMovies;

  // Filter & Sort active movie list
  const filteredAndSortedList = useMemo(() => {
    let list = [...rawList];

    // 1. Genre Filter
    if (selectedGenre !== 'all') {
      const gId = Number(selectedGenre);
      list = list.filter((m) => {
        if (Array.isArray(m.genre_ids)) return m.genre_ids.includes(gId);
        if (Array.isArray(m.genres)) return m.genres.some((g) => g.id === gId);
        return false;
      });
    }

    // 2. Sorting
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'year':
        return list.sort((a, b) => {
          const yA = new Date(a.release_date || 0).getFullYear() || 0;
          const yB = new Date(b.release_date || 0).getFullYear() || 0;
          return yB - yA;
        });
      case 'title':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'popular':
      default:
        return list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  }, [rawList, selectedGenre, sortBy]);

  const isLoading = isSearchActive ? searchLoading : exploreLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-[85vh] flex flex-col space-y-8">
      {/* Cinematic Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Universal Movie Archive</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore Cinema
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Search thousands of global titles, discover acclaimed blockbusters, and filter genres to pick contenders for the Duel Arena.
        </p>
      </div>

      {/* Main Search Bar & Quick Picks */}
      <div className="max-w-3xl mx-auto w-full space-y-3">
        <div className="relative flex items-center shadow-2xl">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="Search by title, franchise, director (e.g. Dune, Inception, Dark Knight)..."
            className="w-full bg-[#18181B] border-2 border-[#3F3F46] focus:border-purple-500 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder-[#71717A] outline-none transition-all shadow-inner"
            autoFocus={!urlQuery}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-[#71717A] flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Popular Searches:
          </span>
          {QUICK_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSelectQuickTag(tag)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                searchInput.toLowerCase() === tag.toLowerCase()
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                  : 'bg-[#27272A] hover:bg-purple-950/60 hover:border-purple-500/40 border-[#3F3F46] text-[#A1A1AA] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Filtering & Sorting Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-[#27272A] py-4">
        {/* Genre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Filter className="w-4 h-4 text-[#71717A] shrink-0 mr-1" />
          {GENRE_FILTERS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGenre(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedGenre === g.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                  : 'bg-[#18181B] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] border-[#27272A]'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#71717A]" />
          <span className="text-xs text-[#71717A] font-bold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#18181B] border border-[#3F3F46] rounded-xl px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Release Year</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {searchError && (
        <ErrorBanner
          message={searchError}
          onRetry={() => setQuery(searchInput)}
        />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#A1A1AA]">
          {isSearchActive ? (
            <>
              Found <span className="text-white font-bold">{filteredAndSortedList.length}</span> results for &ldquo;
              <span className="text-purple-300 font-bold">{searchInput}</span>&rdquo;
            </>
          ) : (
            <>
              Showing <span className="text-white font-bold">{filteredAndSortedList.length}</span> curated titles in{' '}
              <span className="text-purple-300 font-bold">
                {GENRE_FILTERS.find((g) => g.id === selectedGenre)?.name || 'All'}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Movies Grid */}
      <div className="flex-1 pb-12">
        <MovieGrid
          movies={filteredAndSortedList}
          loading={isLoading}
          skeletonCount={12}
          emptyTitle={isSearchActive ? `No movies found for "${searchInput}"` : 'No movies found in this category'}
          emptyDescription="Try adjusting your search terms or selecting a different genre filter."
        />
      </div>
    </div>
  );
}

export default SearchPage;

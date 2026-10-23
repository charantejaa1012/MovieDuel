import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import * as api from '../services/api';

const WatchlistContext = createContext(null);

function normalizeItem(item) {
  if (!item) return null;
  const id = Number(item.movieId || item.id);
  const title = item.movieTitle || item.title || `Movie #${id}`;
  const poster = item.moviePoster || item.poster_path || null;
  const rating = item.movieRating ?? item.vote_average ?? null;
  const year = item.movieYear || (item.release_date ? String(item.release_date).split('-')[0] : '');

  return {
    ...item,
    id,
    movieId: id,
    title,
    movieTitle: title,
    poster_path: poster,
    moviePoster: poster,
    vote_average: rating,
    movieRating: rating,
    release_date: year ? `${year}-01-01` : (item.release_date || ''),
    movieYear: year,
  };
}

export function WatchlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  // Map of movieId (string) -> normalized movie object
  const [watchlistMap, setWatchlistMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const prevUserIdRef = useRef(null);

  // Load watchlist whenever auth state or active user ID changes
  const loadWatchlist = useCallback(async () => {
    setLoading(true);

    // Clean up any legacy shared keys in localStorage
    if (typeof localStorage !== 'undefined') {
      ['movie_duel_watchlist', 'movie_duel_guest_watchlist'].forEach((k) => localStorage.removeItem(k));
      Object.keys(localStorage)
        .filter((k) => k.startsWith('movie_duel_watchlist'))
        .forEach((k) => localStorage.removeItem(k));
    }

    try {
      // If not authenticated, user does not have a persistent watchlist
      if (!isAuthenticated || !user?.id) {
        setWatchlistMap(new Map());
        return;
      }

      // Fetch user's dedicated watchlist strictly from MongoDB Atlas
      const res = await api.getWatchlist();
      const rawList =
        res?.data?.items ||
        res?.items ||
        res?.data?.watchlist ||
        (Array.isArray(res?.data) ? res?.data : []);

      const newMap = new Map();
      if (Array.isArray(rawList)) {
        rawList.forEach((raw) => {
          const norm = normalizeItem(raw);
          if (norm && norm.id) {
            newMap.set(String(norm.id), norm);
          }
        });
      }
      setWatchlistMap(newMap);
    } catch (err) {
      console.error('Failed to load user-specific watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // If user changed or logged out, reset map first to avoid showing stale user data
    const currentId = user?.id || null;
    if (prevUserIdRef.current !== currentId) {
      setWatchlistMap(new Map());
      prevUserIdRef.current = currentId;
    }
    loadWatchlist();
  }, [loadWatchlist, user?.id, isAuthenticated]);

  const isInWatchlist = useCallback(
    (movieId) => {
      if (!movieId || !isAuthenticated) return false;
      return watchlistMap.has(String(movieId));
    },
    [watchlistMap, isAuthenticated]
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!isAuthenticated) {
        toastError('Please sign in to save movies to your watchlist.');
        return;
      }

      if (!movie || (!movie.id && !movie.movieId)) return;
      const normalized = normalizeItem(movie);
      const movieIdStr = String(normalized.id);

      // Optimistic update
      setWatchlistMap((prev) => {
        const next = new Map(prev);
        next.set(movieIdStr, normalized);
        return next;
      });

      try {
        await api.addToWatchlist(normalized);
        success(`"${normalized.title}" saved to your personal watchlist`);
      } catch (err) {
        // Revert optimistic update
        setWatchlistMap((prev) => {
          const next = new Map(prev);
          next.delete(movieIdStr);
          return next;
        });
        toastError(err?.message || 'Could not save to watchlist');
      }
    },
    [isAuthenticated, success, toastError]
  );

  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!movieId) return;
      const movieIdStr = String(movieId);
      const existing = watchlistMap.get(movieIdStr);

      // Optimistic update
      setWatchlistMap((prev) => {
        const next = new Map(prev);
        next.delete(movieIdStr);
        return next;
      });

      try {
        await api.removeFromWatchlist(movieId);
        success('Removed from your watchlist');
      } catch (err) {
        // Revert optimistic update
        if (existing) {
          setWatchlistMap((prev) => {
            const next = new Map(prev);
            next.set(movieIdStr, existing);
            return next;
          });
        }
        toastError('Could not remove from watchlist');
      }
    },
    [watchlistMap, success, toastError]
  );

  const toggleWatchlist = useCallback(
    async (movie) => {
      if (!movie) return;
      const id = movie.id || movie.movieId;
      if (isInWatchlist(id)) {
        await removeFromWatchlist(id);
      } else {
        await addToWatchlist(movie);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const watchlist = Array.from(watchlistMap.values());

  const value = {
    watchlist,
    watchlistMap,
    loading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    refreshWatchlist: loadWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

export default WatchlistContext;

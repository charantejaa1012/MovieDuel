import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import * as api from '../services/api';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  
  // Stored as Map (id -> movie object) for O(1) lookups
  const [watchlistMap, setWatchlistMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Load watchlist on mount or auth change
  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getWatchlist();
      const list = res.watchlist || res.data || [];
      const newMap = new Map();
      if (Array.isArray(list)) {
        list.forEach((item) => {
          const movieId = item.movieId || item.id;
          newMap.set(String(movieId), item);
        });
      }
      setWatchlistMap(newMap);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist, isAuthenticated]);

  const isInWatchlist = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return watchlistMap.has(String(movieId));
    },
    [watchlistMap]
  );

  const addToWatchlist = useCallback(
    async (movie) => {
      if (!movie || !movie.id) return;
      const movieIdStr = String(movie.id);

      // Optimistic update
      setWatchlistMap((prev) => {
        const next = new Map(prev);
        next.set(movieIdStr, movie);
        return next;
      });

      try {
        await api.addToWatchlist(movie);
        success(`"${movie.title || 'Movie'}" added to your watchlist`);
      } catch (err) {
        // Revert optimistic update on failure
        setWatchlistMap((prev) => {
          const next = new Map(prev);
          next.delete(movieIdStr);
          return next;
        });
        toastError('Failed to add movie to watchlist');
      }
    },
    [success, toastError]
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
        success(`Removed from watchlist`);
      } catch (err) {
        // Revert optimistic update
        if (existing) {
          setWatchlistMap((prev) => {
            const next = new Map(prev);
            next.set(movieIdStr, existing);
            return next;
          });
        }
        toastError('Failed to remove movie from watchlist');
      }
    },
    [watchlistMap, success, toastError]
  );

  const toggleWatchlist = useCallback(
    async (movie) => {
      if (!movie || !movie.id) return;
      if (isInWatchlist(movie.id)) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  // Array representation for rendering lists
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

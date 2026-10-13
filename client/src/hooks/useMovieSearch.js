import { useState, useEffect, useRef, useCallback } from 'react';
import { searchMovies } from '../services/api';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for debounced movie search with AbortController cancellation
 * @param {string} initialQuery 
 * @param {number} delay 
 */
export function useMovieSearch(initialQuery = '', delay = 300) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, delay);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const abortControllerRef = useRef(null);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await searchMovies(trimmed);
        if (!abortController.signal.aborted) {
          const list = res.results || res.data || [];
          setResults(list);
          setHasSearched(true);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err.message || 'Error occurred while searching');
          setResults([]);
          setHasSearched(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    loading,
    error,
    hasSearched,
    clear,
  };
}

export default useMovieSearch;

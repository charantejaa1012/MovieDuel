import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { MovieGrid } from '../components/movie/MovieGrid';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import * as api from '../services/api';

export function UpcomingPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcoming = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUpcoming();
      const list = res.results || res.data || [];
      setMovies(list);
    } catch (err) {
      setError('Failed to fetch upcoming movie calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[80vh] flex flex-col space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Premiere Schedule</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Upcoming Releases
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Anticipated theatrical and streaming titles scheduled to debut soon. Add them to your watchlist or prepare upcoming duel matchups.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchUpcoming} />}

      <MovieGrid
        movies={movies}
        loading={loading}
        skeletonCount={12}
        emptyTitle="No upcoming releases found"
        emptyDescription="Check back soon for freshly scheduled premieres."
      />
    </div>
  );
}

export default UpcomingPage;

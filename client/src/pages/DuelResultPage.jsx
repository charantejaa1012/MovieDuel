import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, RefreshCw, ChevronLeft, AlertCircle } from 'lucide-react';
import { DuelComparison } from '../components/duel/DuelComparison';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import * as api from '../services/api';

export function DuelResultPage() {
  const { movie1: movie1Id, movie2: movie2Id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [duelData, setDuelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Weights passed through state or default balanced
  const weights = location.state?.weights || {
    critic: 25,
    audience: 25,
    story: 25,
    visuals: 25,
  };

  const executeDuel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.compareDuel(movie1Id, movie2Id, weights);
      if (res.data) {
        setDuelData(res.data);
      } else {
        throw new Error('Comparison calculation failed');
      }
    } catch (err) {
      console.error('Failed to calculate duel result:', err);
      setError('Could not calculate comparison scores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movie1Id && movie2Id) {
      executeDuel();
    }
  }, [movie1Id, movie2Id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[85vh] flex flex-col space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/duel"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Arena Setup</span>
        </Link>
      </div>

      {loading ? (
        /* Dramatic Loading State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-xl mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-2xl"
          >
            <Swords className="w-8 h-8" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              Simulating Head-to-Head Clash...
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Calculating metrics across critic consensuses, box office reception, narrative pacing, and technical brilliance.
            </p>
          </div>

          <div className="w-full max-w-md space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <ErrorBanner message={error} onRetry={executeDuel} />
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/duel')}
              leftIcon={RefreshCw}
            >
              Choose New Contenders
            </Button>
          </div>
        </div>
      ) : duelData ? (
        <DuelComparison
          duelData={duelData}
          onNewDuel={() => navigate('/duel')}
        />
      ) : null}
    </div>
  );
}

export default DuelResultPage;

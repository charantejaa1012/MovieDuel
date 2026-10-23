import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Swords,
  Share2,
  Bookmark,
  Check,
  RefreshCw,
  Trophy,
  Sliders,
  Scale,
  Sparkles,
  ArrowLeftRight,
  Info,
} from 'lucide-react';
import { ScoreBar } from './ScoreBar';
import { WeightSlider } from './WeightSlider';
import { Button } from '../ui/Button';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useToast } from '../../contexts/ToastContext';
import { getImageUrl, formatYear } from '../../utils/formatters';

// Score counting helper hook
function useCountUp(targetNumber, durationMs = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.round(Number(targetNumber) || 0);
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = 30;
    const stepDuration = durationMs / totalSteps;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [targetNumber, durationMs]);

  return count;
}

export function DuelComparison({
  duelData,
  onNewDuel,
  onRecalculate,
  recalculating = false,
  onSwap,
}) {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { success } = useToast();

  const movie1 = duelData?.movie1 || duelData?.movieA;
  const movie2 = duelData?.movie2 || duelData?.movieB;
  const score1 = duelData?.score1 ?? duelData?.totalA ?? 0;
  const score2 = duelData?.score2 ?? duelData?.totalB ?? 0;

  const animatedScore1 = useCountUp(score1);
  const animatedScore2 = useCountUp(score2);

  const isTie =
    duelData?.isTie ||
    duelData?.verdict === 'tie' ||
    (!duelData?.winnerId && !duelData?.winnerMovieId);

  const is1Winner =
    !isTie &&
    (duelData?.winnerId || duelData?.winnerMovieId
      ? String(duelData.winnerId || duelData.winnerMovieId) === String(movie1?.id)
      : score1 > score2);

  const is2Winner =
    !isTie &&
    (duelData?.winnerId || duelData?.winnerMovieId
      ? String(duelData.winnerId || duelData.winnerMovieId) === String(movie2?.id)
      : score2 > score1);

  const winnerMovie = is1Winner ? movie1 : is2Winner ? movie2 : null;
  const isWinnerSaved = winnerMovie ? isInWatchlist(winnerMovie.id) : false;

  // Active user preference weights
  const activeWeights = duelData?.userWeights || {
    genreMatch: Math.round((duelData?.normalizedWeights?.genreMatch || 0.25) * 100),
    rating: Math.round((duelData?.normalizedWeights?.rating || 0.25) * 100),
    runtime: Math.round((duelData?.normalizedWeights?.runtime || 0.25) * 100),
    popularity: Math.round((duelData?.normalizedWeights?.popularity || 0.25) * 100),
  };

  // State for in-page weight slider tuning
  const [showWeightTuner, setShowWeightTuner] = useState(false);
  const [liveWeights, setLiveWeights] = useState(activeWeights);

  useEffect(() => {
    if (duelData?.userWeights) {
      setLiveWeights(duelData.userWeights);
    }
  }, [duelData]);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Duel matchup link copied to clipboard!');
  };

  const handleSaveWinner = () => {
    if (winnerMovie) {
      addToWatchlist(winnerMovie);
    }
  };

  const handleApplyNewWeights = () => {
    if (onRecalculate) {
      onRecalculate(liveWeights);
    }
  };

  if (!movie1 || !movie2) return null;

  return (
    <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
      {/* 1. Side-by-side Contenders Display with Winner Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Contender 1 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative rounded-3xl p-6 bg-[#18181B] border transition-all ${
            is1Winner
              ? 'border-amber-500/70 winner-glow bg-gradient-to-b from-amber-950/30 to-[#18181B]'
              : isTie
              ? 'border-purple-500/40'
              : 'border-[#3F3F46]'
          }`}
        >
          {is1Winner && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 z-10">
              <Crown className="w-4 h-4 fill-black" />
              <span>DUEL CHAMPION</span>
            </div>
          )}

          {isTie && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg z-10">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>CO-CHAMPION (TIE)</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl mb-4 border border-[#3F3F46]">
              <img
                src={getImageUrl(movie1.poster_path, 'w500')}
                alt={movie1.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
                }}
              />
            </div>

            <h3 className="text-xl font-black text-white line-clamp-1">
              {movie1.title}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1 mb-4">
              {formatYear(movie1.release_date)}
            </p>

            {/* Score Display */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                WSM Total Score
              </span>
              <span
                className={`text-5xl font-black tracking-tight ${
                  is1Winner
                    ? 'text-amber-400'
                    : isTie
                    ? 'text-purple-300'
                    : 'text-purple-400'
                }`}
              >
                {animatedScore1}
                <span className="text-lg font-bold text-[#71717A]">/100</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Contender 2 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative rounded-3xl p-6 bg-[#18181B] border transition-all ${
            is2Winner
              ? 'border-amber-500/70 winner-glow bg-gradient-to-b from-amber-950/30 to-[#18181B]'
              : isTie
              ? 'border-purple-500/40'
              : 'border-[#3F3F46]'
          }`}
        >
          {is2Winner && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 z-10">
              <Crown className="w-4 h-4 fill-black" />
              <span>DUEL CHAMPION</span>
            </div>
          )}

          {isTie && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg z-10">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>CO-CHAMPION (TIE)</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl mb-4 border border-[#3F3F46]">
              <img
                src={getImageUrl(movie2.poster_path, 'w500')}
                alt={movie2.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
                }}
              />
            </div>

            <h3 className="text-xl font-black text-white line-clamp-1">
              {movie2.title}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1 mb-4">
              {formatYear(movie2.release_date)}
            </p>

            {/* Score Display */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                WSM Total Score
              </span>
              <span
                className={`text-5xl font-black tracking-tight ${
                  is2Winner
                    ? 'text-amber-400'
                    : isTie
                    ? 'text-purple-300'
                    : 'text-rose-400'
                }`}
              >
                {animatedScore2}
                <span className="text-lg font-bold text-[#71717A]">/100</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Official Verdict & Decision Reasoning Announcement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-[#18181B] to-rose-950/40 border border-[#3F3F46] text-center shadow-xl space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>The Definitive Verdict</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {isTie
            ? 'Epic Stalemate!'
            : `${winnerMovie?.title || 'Contender'} Wins the Duel!`}
        </h2>

        <p className="text-sm sm:text-base text-[#D4D4D8] max-w-2xl mx-auto leading-relaxed bg-[#09090B]/50 p-4 rounded-2xl border border-white/5">
          {duelData?.explanation ||
            (isTie
              ? `Both ${movie1.title} and ${movie2.title} are separated by fewer than 3 points, resulting in an evenly matched deadlock.`
              : `${winnerMovie?.title} won with an aggregate score of ${Math.max(
                  score1,
                  score2
                )} vs ${Math.min(score1, score2)}.`)}
        </p>

        {/* Quick Duel Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {winnerMovie && (
            <Button
              variant={isWinnerSaved ? 'secondary' : 'primary'}
              size="md"
              leftIcon={isWinnerSaved ? Check : Bookmark}
              onClick={handleSaveWinner}
              disabled={isWinnerSaved}
            >
              {isWinnerSaved ? 'Winner In Watchlist' : 'Add Winner to Watchlist'}
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            leftIcon={Share2}
            onClick={handleCopyShareUrl}
          >
            Share Matchup
          </Button>

          {onSwap && (
            <Button
              variant="outline"
              size="md"
              leftIcon={ArrowLeftRight}
              onClick={onSwap}
            >
              Swap Contenders
            </Button>
          )}

          {onNewDuel && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={RefreshCw}
              onClick={onNewDuel}
            >
              New Duel
            </Button>
          )}
        </div>
      </motion.div>

      {/* 3. User Preference Weights Showcase & Dynamic Recalibration Banner */}
      <div className="rounded-3xl p-6 bg-[#18181B] border border-purple-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Applied User Preference Weights</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Multi-Criteria Decision Analysis (WSM): Score = Σ (Weight × Criterion Score)
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={Sliders}
            onClick={() => setShowWeightTuner(!showWeightTuner)}
            className="self-start sm:self-auto"
          >
            {showWeightTuner ? 'Close Weight Tuner' : 'Adjust Weights & Recalculate'}
          </Button>
        </div>

        {/* Weights Showcase Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#27272A]/40 p-3 rounded-xl border border-amber-500/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block">
              Rating & Acclaim
            </span>
            <span className="text-lg font-black text-amber-400">
              {activeWeights.rating}%
            </span>
          </div>

          <div className="bg-[#27272A]/40 p-3 rounded-xl border border-purple-500/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block">
              Genre & Taste
            </span>
            <span className="text-lg font-black text-purple-400">
              {activeWeights.genreMatch}%
            </span>
          </div>

          <div className="bg-[#27272A]/40 p-3 rounded-xl border border-blue-500/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block">
              Runtime & Pace
            </span>
            <span className="text-lg font-black text-blue-400">
              {activeWeights.runtime}%
            </span>
          </div>

          <div className="bg-[#27272A]/40 p-3 rounded-xl border border-rose-500/20 text-center">
            <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block">
              Cultural Buzz
            </span>
            <span className="text-lg font-black text-rose-400">
              {activeWeights.popularity}%
            </span>
          </div>
        </div>

        {/* In-page Weight Tuner Drawer */}
        <AnimatePresence>
          {showWeightTuner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-[#27272A] space-y-4 overflow-hidden"
            >
              <WeightSlider
                weights={liveWeights}
                onChange={setLiveWeights}
                activePreset="custom"
                onSelectPreset={(_, presetWeights) => setLiveWeights(presetWeights)}
              />

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={Sparkles}
                  onClick={handleApplyNewWeights}
                  isLoading={recalculating}
                  className="font-bold"
                >
                  Recalculate Duel With New Weights
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Detailed Criteria Breakdown with User Weights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">
              Head-to-Head Criteria Breakdown
            </h3>
          </div>
          <span className="text-xs text-[#A1A1AA] italic">
            Calibrated against your preferences
          </span>
        </div>

        <div className="space-y-3">
          {duelData?.criteria?.map((item) => (
            <ScoreBar
              key={item.key || item.name}
              criterionName={item.name}
              description={item.description}
              weight={item.weight}
              score1={item.score1}
              score2={item.score2}
              weightedScore1={item.weightedScore1}
              weightedScore2={item.weightedScore2}
              movie1Title={movie1.title}
              movie2Title={movie2.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DuelComparison;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Swords, Share2, Bookmark, Check, RefreshCw, Trophy } from 'lucide-react';
import { ScoreBar } from './ScoreBar';
import { Button } from '../ui/Button';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useToast } from '../../contexts/ToastContext';
import { getImageUrl, formatYear } from '../../utils/formatters';

// Score counting helper hook
function useCountUp(targetNumber, durationMs = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(targetNumber) || 0;
    if (start === end) return;

    const totalSteps = 40;
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
}) {
  const { movie1, movie2, score1, score2, winnerId, verdict, criteria } = duelData;
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const { success } = useToast();

  const animatedScore1 = useCountUp(score1);
  const animatedScore2 = useCountUp(score2);

  const is1Winner = score1 > score2;
  const is2Winner = score2 > score1;
  const isTie = score1 === score2;

  const winnerMovie = is1Winner ? movie1 : is2Winner ? movie2 : null;
  const isWinnerSaved = winnerMovie ? isInWatchlist(winnerMovie.id) : false;

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Duel link copied to clipboard!');
  };

  const handleSaveWinner = () => {
    if (winnerMovie) {
      addToWatchlist(winnerMovie);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
      {/* Side-by-side Contenders Display with Winner Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Contender 1 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative rounded-3xl p-6 bg-[#18181B] border transition-all ${
            is1Winner
              ? 'border-amber-500/60 winner-glow bg-gradient-to-b from-amber-950/20 to-[#18181B]'
              : 'border-[#3F3F46]'
          }`}
        >
          {is1Winner && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
              <Crown className="w-4 h-4 fill-black" />
              <span>DUEL CHAMPION</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl mb-4 border border-[#3F3F46]">
              <img
                src={getImageUrl(movie1.poster_path, 'w500')}
                alt={movie1.title}
                className="w-full h-full object-cover"
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
                Overall Score
              </span>
              <span
                className={`text-5xl font-black tracking-tight ${
                  is1Winner ? 'text-amber-400' : 'text-purple-400'
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
              ? 'border-amber-500/60 winner-glow bg-gradient-to-b from-amber-950/20 to-[#18181B]'
              : 'border-[#3F3F46]'
          }`}
        >
          {is2Winner && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
              <Crown className="w-4 h-4 fill-black" />
              <span>DUEL CHAMPION</span>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl mb-4 border border-[#3F3F46]">
              <img
                src={getImageUrl(movie2.poster_path, 'w500')}
                alt={movie2.title}
                className="w-full h-full object-cover"
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
                Overall Score
              </span>
              <span
                className={`text-5xl font-black tracking-tight ${
                  is2Winner ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {animatedScore2}
                <span className="text-lg font-bold text-[#71717A]">/100</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Verdict Announcement Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-[#18181B] to-rose-950/40 border border-[#3F3F46] text-center shadow-xl space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>The Official Verdict</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {isTie
            ? 'Epic Stalemate!'
            : `${is1Winner ? movie1.title : movie2.title} Wins the Duel!`}
        </h2>

        <p className="text-sm sm:text-base text-[#D4D4D8] max-w-2xl mx-auto leading-relaxed">
          {verdict}
        </p>

        {/* Quick Duel Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {winnerMovie && (
            <Button
              variant={isWinnerSaved ? 'secondary' : 'primary'}
              size="md"
              leftIcon={isWinnerSaved ? Check : Bookmark}
              onClick={handleSaveWinner}
              disabled={isWinnerSaved}
            >
              {isWinnerSaved ? 'Winner Saved in Watchlist' : 'Add Winner to Watchlist'}
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            leftIcon={Share2}
            onClick={handleCopyShareUrl}
          >
            Share Duel Result
          </Button>

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

      {/* Detailed Criteria Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">
            Head-to-Head Criteria Breakdown
          </h3>
        </div>

        <div className="space-y-3">
          {criteria?.map((item) => (
            <ScoreBar
              key={item.name}
              criterionName={item.name}
              score1={item.score1}
              score2={item.score2}
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

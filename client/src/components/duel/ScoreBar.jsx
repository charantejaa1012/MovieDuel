import React from 'react';
import { motion } from 'framer-motion';

export function ScoreBar({
  criterionName,
  score1,
  score2,
  movie1Title,
  movie2Title,
}) {
  const is1Winner = score1 > score2;
  const is2Winner = score2 > score1;
  const isTie = score1 === score2;

  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-3">
      {/* Title & Scores */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        <div className="flex items-center gap-2">
          <span
            className={`font-black text-base ${
              is1Winner ? 'text-purple-400' : 'text-[#A1A1AA]'
            }`}
          >
            {score1}
          </span>
          <span className="text-white truncate max-w-[120px] sm:max-w-[160px]">
            {movie1Title}
          </span>
        </div>

        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#27272A]">
          {criterionName}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-white truncate max-w-[120px] sm:max-w-[160px] text-right">
            {movie2Title}
          </span>
          <span
            className={`font-black text-base ${
              is2Winner ? 'text-rose-400' : 'text-[#A1A1AA]'
            }`}
          >
            {score2}
          </span>
        </div>
      </div>

      {/* Dual Comparative Progress Bar */}
      <div className="relative h-3 w-full bg-[#27272A] rounded-full overflow-hidden flex items-center">
        {/* Left side (Movie 1) from 0 to 100 */}
        <div className="w-1/2 flex justify-end bg-[#27272A]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, score1)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-l-full ${
              is1Winner
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 shadow-lg shadow-purple-500/50'
                : 'bg-purple-900/60'
            }`}
          />
        </div>

        {/* Center Split Marker */}
        <div className="w-0.5 h-full bg-[#09090B] z-10" />

        {/* Right side (Movie 2) from 0 to 100 */}
        <div className="w-1/2 flex justify-start bg-[#27272A]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, score2)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-r-full ${
              is2Winner
                ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-lg shadow-rose-500/50'
                : 'bg-rose-950/60'
            }`}
          />
        </div>
      </div>

      {/* Leader Indicator */}
      <div className="flex justify-between items-center text-[10px] text-[#71717A] font-semibold">
        <span>{is1Winner ? '▲ ADVANTAGE' : ''}</span>
        <span>{isTie ? 'EQUAL MATCH' : ''}</span>
        <span>{is2Winner ? 'ADVANTAGE ▲' : ''}</span>
      </div>
    </div>
  );
}

export default ScoreBar;

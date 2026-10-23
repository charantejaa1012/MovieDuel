import React from 'react';
import { motion } from 'framer-motion';

export function ScoreBar({
  criterionName,
  description,
  weight,
  score1,
  score2,
  weightedScore1,
  weightedScore2,
  movie1Title,
  movie2Title,
}) {
  const numScore1 = Number(score1) || 0;
  const numScore2 = Number(score2) || 0;
  const is1Winner = numScore1 > numScore2;
  const is2Winner = numScore2 > numScore1;
  const isTie = numScore1 === numScore2;

  const w1 = weightedScore1 !== undefined ? Number(weightedScore1).toFixed(1) : ((numScore1 * (weight || 25)) / 100).toFixed(1);
  const w2 = weightedScore2 !== undefined ? Number(weightedScore2).toFixed(1) : ((numScore2 * (weight || 25)) / 100).toFixed(1);
  const diffImpact = Math.abs(Number(w1) - Number(w2)).toFixed(1);

  return (
    <div className="bg-[#18181B] border border-[#27272A] hover:border-purple-500/40 transition-all rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
      {/* Top Header: Title, Description & User Preference Weight Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A]/80 pb-2.5">
        <div>
          <span className="text-sm font-bold text-white tracking-wide">
            {criterionName}
          </span>
          {description && (
            <p className="text-[11px] text-[#A1A1AA] mt-0.5">{description}</p>
          )}
        </div>

        {/* User Weight Tag Showcase */}
        {weight !== undefined && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-extrabold shrink-0 self-start sm:self-auto">
            <span>Your Weight:</span>
            <span className="text-white">{weight}%</span>
          </div>
        )}
      </div>

      {/* Title & Contender Scores */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
        {/* Contender 1 Stats */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-white truncate max-w-[130px] sm:max-w-[180px]">
              {movie1Title}
            </span>
            <span className="text-[11px] text-purple-300/80 font-normal">
              Raw: {numScore1} • <strong className="text-purple-300">+{w1} pts</strong>
            </span>
          </div>
        </div>

        {/* Center Tag / Advantage */}
        <div className="text-center px-2">
          {isTie ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">
              Tie
            </span>
          ) : is1Winner ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
              +{diffImpact} pts edge
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/20">
              +{diffImpact} pts edge
            </span>
          )}
        </div>

        {/* Contender 2 Stats */}
        <div className="flex items-center gap-2 text-right">
          <div className="flex flex-col items-end">
            <span className="text-white truncate max-w-[130px] sm:max-w-[180px]">
              {movie2Title}
            </span>
            <span className="text-[11px] text-rose-300/80 font-normal">
              Raw: {numScore2} • <strong className="text-rose-300">+{w2} pts</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Dual Comparative Progress Bar */}
      <div className="relative h-3 w-full bg-[#27272A] rounded-full overflow-hidden flex items-center shadow-inner">
        {/* Left side (Movie 1) from 0 to 100 */}
        <div className="w-1/2 flex justify-end bg-[#27272A]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, numScore1)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-l-full ${
              is1Winner
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 shadow-lg shadow-purple-500/50'
                : 'bg-purple-900/50'
            }`}
          />
        </div>

        {/* Center Split Marker */}
        <div className="w-1 h-full bg-[#09090B] z-10" />

        {/* Right side (Movie 2) from 0 to 100 */}
        <div className="w-1/2 flex justify-start bg-[#27272A]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, numScore2)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-r-full ${
              is2Winner
                ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-lg shadow-rose-500/50'
                : 'bg-rose-950/50'
            }`}
          />
        </div>
      </div>

      {/* Sub-label explaining math impact */}
      <div className="flex justify-between items-center text-[10px] text-[#71717A] font-semibold pt-0.5">
        <span>{is1Winner ? `▲ Contender A takes criterion (+${diffImpact} pts)` : ''}</span>
        <span className="italic">Impact = Raw Score × {weight ? `${weight}%` : 'Weight'}</span>
        <span>{is2Winner ? `Contender B takes criterion (+${diffImpact} pts) ▲` : ''}</span>
      </div>
    </div>
  );
}

export default ScoreBar;

import React from 'react';
import { Sparkles } from 'lucide-react';
import { MovieCard } from '../movie/MovieCard';

export function RecommendationCard({ movie }) {
  if (!movie) return null;

  return (
    <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all group">
      <MovieCard movie={movie} className="border-0 rounded-b-none" />

      {/* Recommendation Reason Footer */}
      <div className="p-3 bg-[#27272A]/40 border-t border-[#27272A] flex flex-col gap-1.5 flex-1 justify-between">
        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Why It Matches:</span>
          {movie.matchPercentage && (
            <span className="ml-auto text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300">
              {movie.matchPercentage}% MATCH
            </span>
          )}
        </div>

        <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
          {movie.reason || 'Curated recommendation based on your cinematic preferences and taste profile.'}
        </p>
      </div>
    </div>
  );
}

export default RecommendationCard;

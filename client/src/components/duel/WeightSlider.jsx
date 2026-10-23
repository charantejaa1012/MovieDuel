import React from 'react';
import { Sliders, Sparkles, Award, Heart, Flame, Clock, UserCheck } from 'lucide-react';
import * as api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const PRESETS = {
  balanced: {
    label: 'Balanced',
    icon: Sparkles,
    weights: { genreMatch: 25, rating: 25, runtime: 25, popularity: 25 },
  },
  critics: {
    label: 'Critical Acclaim',
    icon: Award,
    weights: { genreMatch: 20, rating: 50, runtime: 15, popularity: 15 },
  },
  taste: {
    label: 'Taste & Vibe',
    icon: Heart,
    weights: { genreMatch: 50, rating: 20, runtime: 15, popularity: 15 },
  },
  crowd: {
    label: 'Crowd Pleaser',
    icon: Flame,
    weights: { genreMatch: 15, rating: 20, runtime: 15, popularity: 50 },
  },
  quick: {
    label: 'Evening Pace',
    icon: Clock,
    weights: { genreMatch: 20, rating: 25, runtime: 40, popularity: 15 },
  },
};

export function WeightSliderItem({
  label,
  description,
  value,
  onChange,
  colorClass = 'accent-purple-500',
  badgeColor = 'bg-purple-950/60 text-purple-400 border-purple-500/30',
}) {
  return (
    <div className="space-y-2 bg-[#27272A]/40 p-4 rounded-2xl border border-[#3F3F46]/50 hover:border-purple-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-white">{label}</span>
          {description && (
            <p className="text-xs text-[#A1A1AA] mt-0.5">{description}</p>
          )}
        </div>
        <span
          className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${badgeColor}`}
        >
          {value}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-[#18181B] rounded-lg appearance-none cursor-pointer ${colorClass}`}
      />
    </div>
  );
}

export function WeightSlider({
  weights,
  onChange,
  activePreset,
  onSelectPreset,
}) {
  const { success, error: toastError } = useToast();

  // Normalize weights if caller passed legacy keys
  const genreVal = weights?.genreMatch ?? weights?.story ?? 25;
  const ratingVal = weights?.rating ?? weights?.critic ?? 25;
  const runtimeVal = weights?.runtime ?? weights?.visuals ?? 25;
  const popVal = weights?.popularity ?? weights?.audience ?? 25;

  const updateCriterion = (key, val) => {
    onChange({
      genreMatch: key === 'genreMatch' ? val : genreVal,
      rating: key === 'rating' ? val : ratingVal,
      runtime: key === 'runtime' ? val : runtimeVal,
      popularity: key === 'popularity' ? val : popVal,
    });
  };

  const totalRaw = genreVal + ratingVal + runtimeVal + popVal;
  const safeTotal = totalRaw > 0 ? totalRaw : 100;

  const handleSyncTasteProfile = async () => {
    try {
      const prefsRes = await api.getPreferences();
      const prefs = prefsRes?.preferences || prefsRes?.data;
      if (prefs && prefs.favoriteGenres?.length > 0) {
        onSelectPreset('custom', {
          genreMatch: 45,
          rating: 25,
          runtime: 20,
          popularity: 10,
        });
        success('Calibrated criteria weights to your favorite genres & taste!');
      } else {
        onSelectPreset('custom', {
          genreMatch: 40,
          rating: 30,
          runtime: 20,
          popularity: 10,
        });
        success('Loaded taste profile defaults!');
      }
    } catch (err) {
      toastError('Could not sync profile preferences');
    }
  };

  return (
    <div className="bg-[#18181B] border border-[#3F3F46] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Decision Criterion Weights</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                WSM Model
              </span>
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Set how much each dimension influences the final clash verdict
            </p>
          </div>
        </div>

        {/* Sync taste button */}
        <button
          type="button"
          onClick={handleSyncTasteProfile}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Sync Taste Profile</span>
        </button>
      </div>

      {/* Preset Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mr-1">
          Presets:
        </span>
        {Object.entries(PRESETS).map(([key, preset]) => {
          const Icon = preset.icon;
          const isSelected = activePreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPreset(key, preset.weights)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                  : 'bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46] border border-[#3F3F46]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <WeightSliderItem
          label="Critic & Audience Acclaim"
          description="TMDB community score calibrated with review depth"
          value={ratingVal}
          onChange={(val) => updateCriterion('rating', val)}
          colorClass="accent-amber-400"
          badgeColor="bg-amber-950/60 text-amber-300 border-amber-500/30"
        />

        <WeightSliderItem
          label="Genre & Taste Alignment"
          description="Vibe and thematic compatibility with your preferences"
          value={genreVal}
          onChange={(val) => updateCriterion('genreMatch', val)}
          colorClass="accent-purple-400"
          badgeColor="bg-purple-950/60 text-purple-300 border-purple-500/30"
        />

        <WeightSliderItem
          label="Evening Pace & Runtime"
          description="Film duration suitability against your available time"
          value={runtimeVal}
          onChange={(val) => updateCriterion('runtime', val)}
          colorClass="accent-blue-400"
          badgeColor="bg-blue-950/60 text-blue-300 border-blue-500/30"
        />

        <WeightSliderItem
          label="Cultural Buzz & Popularity"
          description="Global engagement, box office impact, and trending buzz"
          value={popVal}
          onChange={(val) => updateCriterion('popularity', val)}
          colorClass="accent-rose-400"
          badgeColor="bg-rose-950/60 text-rose-300 border-rose-500/30"
        />
      </div>

      {/* Weight Distribution Preview Bar */}
      <div className="pt-2 bg-[#27272A]/30 p-4 rounded-2xl border border-[#3F3F46]/40">
        <div className="flex justify-between items-center text-xs font-bold text-[#A1A1AA] mb-2">
          <span className="uppercase tracking-wider">Normalized Weight Distribution</span>
          <span className="text-white">
            {totalRaw === 100 ? (
              <span className="text-emerald-400">100% Calibrated</span>
            ) : (
              <span className="text-purple-300">
                {totalRaw}% (Normalized to 1.0)
              </span>
            )}
          </span>
        </div>

        <div className="h-3 w-full bg-[#18181B] rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(ratingVal / safeTotal) * 100}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Rating Acclaim: ${Math.round((ratingVal / safeTotal) * 100)}%`}
          />
          <div
            style={{ width: `${(genreVal / safeTotal) * 100}%` }}
            className="bg-purple-500 transition-all duration-300"
            title={`Genre Vibe: ${Math.round((genreVal / safeTotal) * 100)}%`}
          />
          <div
            style={{ width: `${(runtimeVal / safeTotal) * 100}%` }}
            className="bg-blue-500 transition-all duration-300"
            title={`Runtime Pace: ${Math.round((runtimeVal / safeTotal) * 100)}%`}
          />
          <div
            style={{ width: `${(popVal / safeTotal) * 100}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Cultural Buzz: ${Math.round((popVal / safeTotal) * 100)}%`}
          />
        </div>

        <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[#A1A1AA] mt-2.5 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Rating: {Math.round((ratingVal / safeTotal) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            Genre: {Math.round((genreVal / safeTotal) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Runtime: {Math.round((runtimeVal / safeTotal) * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Popularity: {Math.round((popVal / safeTotal) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeightSlider;

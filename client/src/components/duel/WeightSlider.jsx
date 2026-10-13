import React from 'react';
import { Sliders, Sparkles, BookOpen, Flame, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

export const PRESETS = {
  balanced: {
    label: 'Balanced',
    icon: Sparkles,
    weights: { critic: 25, audience: 25, story: 25, visuals: 25 },
  },
  story: {
    label: 'Story-Focused',
    icon: BookOpen,
    weights: { critic: 25, audience: 15, story: 45, visuals: 15 },
  },
  popular: {
    label: 'Crowd Pleaser',
    icon: Flame,
    weights: { critic: 15, audience: 50, story: 15, visuals: 20 },
  },
  visuals: {
    label: 'Visual Spectacle',
    icon: Eye,
    weights: { critic: 15, audience: 20, story: 15, visuals: 50 },
  },
};

export function WeightSliderItem({
  label,
  description,
  value,
  onChange,
  colorClass = 'accent-purple-500',
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-white">{label}</span>
          {description && (
            <p className="text-xs text-[#A1A1AA]">{description}</p>
          )}
        </div>
        <span className="text-sm font-extrabold text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
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
        className={`w-full h-2 bg-[#27272A] rounded-lg appearance-none cursor-pointer ${colorClass}`}
      />
    </div>
  );
}

export function WeightSlider({ weights, onChange, activePreset, onSelectPreset }) {
  const updateCriterion = (criterion, val) => {
    onChange({
      ...weights,
      [criterion]: val,
    });
  };

  return (
    <div className="bg-[#18181B] border border-[#3F3F46] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Criterion Weights</h3>
            <p className="text-xs text-[#A1A1AA]">
              Customize what matters most in your head-to-head showdown
            </p>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <WeightSliderItem
          label="Critical Acclaim"
          description="Review consensus and critical ratings"
          value={weights.critic}
          onChange={(val) => updateCriterion('critic', val)}
        />

        <WeightSliderItem
          label="Audience Popularity"
          description="Fan engagement and box office presence"
          value={weights.audience}
          onChange={(val) => updateCriterion('audience', val)}
        />

        <WeightSliderItem
          label="Story & Depth"
          description="Screenplay, narrative richness, and complexity"
          value={weights.story}
          onChange={(val) => updateCriterion('story', val)}
        />

        <WeightSliderItem
          label="Visuals & Spectacle"
          description="Cinematography, effects, and worldbuilding"
          value={weights.visuals}
          onChange={(val) => updateCriterion('visuals', val)}
        />
      </div>

      {/* Weight Distribution Preview Bar */}
      <div className="pt-2">
        <div className="flex justify-between text-[11px] font-bold text-[#A1A1AA] mb-1.5">
          <span>WEIGHT DISTRIBUTION</span>
          <span>
            {(weights.critic || 0) +
              (weights.audience || 0) +
              (weights.story || 0) +
              (weights.visuals || 0)}
            % Total
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#27272A] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${weights.critic}%` }}
            className="bg-purple-500 transition-all duration-300"
            title={`Critical: ${weights.critic}%`}
          />
          <div
            style={{ width: `${weights.audience}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Audience: ${weights.audience}%`}
          />
          <div
            style={{ width: `${weights.story}%` }}
            className="bg-blue-500 transition-all duration-300"
            title={`Story: ${weights.story}%`}
          />
          <div
            style={{ width: `${weights.visuals}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Visuals: ${weights.visuals}%`}
          />
        </div>
      </div>
    </div>
  );
}

export default WeightSlider;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swords, Sparkles, AlertCircle, Play, Flame, Layers } from 'lucide-react';
import { DuelSelector } from '../components/duel/DuelSelector';
import { WeightSlider, PRESETS } from '../components/duel/WeightSlider';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';

const FEATURED_MATCHUPS = [
  {
    label: 'Sci-Fi Titans',
    movie1: {
      id: 693134,
      title: 'Dune: Part Two',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      vote_average: 8.3,
      release_date: '2024-02-27',
      genre_ids: [878, 12],
    },
    movie2: {
      id: 157336,
      title: 'Interstellar',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      vote_average: 8.4,
      release_date: '2014-11-05',
      genre_ids: [12, 18, 878],
    },
  },
  {
    label: 'Dark Masterpieces',
    movie1: {
      id: 155,
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      vote_average: 8.5,
      release_date: '2008-07-16',
      genre_ids: [18, 28],
    },
    movie2: {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      vote_average: 8.4,
      release_date: '1999-10-15',
      genre_ids: [18],
    },
  },
  {
    label: 'Mind-Benders',
    movie1: {
      id: 27205,
      title: 'Inception',
      poster_path: '/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      vote_average: 8.4,
      release_date: '2010-07-15',
      genre_ids: [28, 878],
    },
    movie2: {
      id: 872585,
      title: 'Oppenheimer',
      poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      vote_average: 8.1,
      release_date: '2023-07-19',
      genre_ids: [18, 36],
    },
  },
];

export function DuelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { warning } = useToast();

  const [movie1, setMovie1] = useState(null);
  const [movie2, setMovie2] = useState(null);

  // Criteria Weights
  const [weights, setWeights] = useState(PRESETS.balanced.weights);
  const [activePreset, setActivePreset] = useState('balanced');

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Pre-load contenders from query params (e.g. ?m1=157336&m2=693134)
  useEffect(() => {
    const m1Id = searchParams.get('m1');
    const m2Id = searchParams.get('m2');

    const loadPreselected = async () => {
      try {
        if (m1Id) {
          const res1 = await api.getMovieDetails(m1Id);
          setMovie1(res1?.movie || res1?.data?.data || res1?.data || res1);
        }
        if (m2Id) {
          const res2 = await api.getMovieDetails(m2Id);
          setMovie2(res2?.movie || res2?.data?.data || res2?.data || res2);
        }
      } catch (err) {
        console.error('Failed to load preselected duel contenders', err);
      }
    };

    if (m1Id || m2Id) {
      loadPreselected();
    }
  }, [searchParams]);

  const handleSwap = () => {
    const temp = movie1;
    setMovie1(movie2);
    setMovie2(temp);
  };

  const handleSelectPreset = (presetKey, presetWeights) => {
    setActivePreset(presetKey);
    setWeights(presetWeights);
  };

  const handleQuickMatchup = (matchup) => {
    setMovie1(matchup.movie1);
    setMovie2(matchup.movie2);
    setValidationError(null);
  };

  const handleStartDuel = () => {
    setValidationError(null);

    if (!movie1 || !movie2) {
      setValidationError('Please select both Contender A and Contender B before initiating the duel.');
      warning('Both movie contenders must be selected.');
      return;
    }

    if (String(movie1.id) === String(movie2.id)) {
      setValidationError('A movie cannot duel itself! Please select two different titles.');
      warning('Contenders must be different films.');
      return;
    }

    setLoading(true);

    // Navigate to results page with weights preserved in state
    navigate(`/duel/${movie1.id}/${movie2.id}`, {
      state: {
        movie1,
        movie2,
        weights,
      },
    });
  };

  const isDuelReady = Boolean(movie1 && movie2 && String(movie1.id) !== String(movie2.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-[85vh] flex flex-col space-y-10">
      {/* Cinematic Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" />
          <span>The Ultimate Matchup</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Movie Duel Arena
        </h1>

        <p className="text-sm text-[#A1A1AA]">
          Select two cinematic contenders, calibrate the Weighted Scoring Model (WSM) to your taste, and determine the definitive champion.
        </p>

        {/* Featured Showdowns Quick Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-[#71717A] flex items-center gap-1 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Quick Duels:
          </span>
          {FEATURED_MATCHUPS.map((fm) => (
            <button
              key={fm.label}
              type="button"
              onClick={() => handleQuickMatchup(fm)}
              className="px-3 py-1 rounded-xl bg-[#18181B] hover:bg-purple-950/50 border border-[#27272A] hover:border-purple-500/40 text-xs font-semibold text-[#D4D4D8] hover:text-white transition-all shadow-sm"
            >
              {fm.movie1.title} <span className="text-purple-400 font-bold">vs</span> {fm.movie2.title}
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <ErrorBanner
          message={validationError}
          onDismiss={() => setValidationError(null)}
          className="max-w-4xl mx-auto w-full"
        />
      )}

      {/* Duel Contender Selector */}
      <DuelSelector
        movie1={movie1}
        movie2={movie2}
        onSelectMovie1={setMovie1}
        onSelectMovie2={setMovie2}
        onSwap={handleSwap}
      />

      {/* Criteria Weight Tuning */}
      <div className="max-w-4xl mx-auto w-full">
        <WeightSlider
          weights={weights}
          onChange={(newWeights) => {
            setWeights(newWeights);
            setActivePreset('custom');
          }}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
        />
      </div>

      {/* Launch Duel Action Button */}
      <div className="flex flex-col items-center justify-center gap-3 pt-4 pb-12">
        <Button
          variant="primary"
          size="lg"
          leftIcon={Swords}
          onClick={handleStartDuel}
          disabled={!isDuelReady || loading}
          isLoading={loading}
          className="text-base sm:text-lg px-8 py-4 h-14 accent-glow font-black"
        >
          Initiate Clash & Compare
        </Button>

        {!isDuelReady && (
          <p className="text-xs text-[#71717A] italic">
            Select both contender movies above or click a Quick Duel to unlock comparison
          </p>
        )}
      </div>
    </div>
  );
}

export default DuelPage;

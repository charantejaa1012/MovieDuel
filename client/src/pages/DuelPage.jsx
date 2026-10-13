import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swords, Sparkles, AlertCircle, Play } from 'lucide-react';
import { DuelSelector } from '../components/duel/DuelSelector';
import { WeightSlider, PRESETS } from '../components/duel/WeightSlider';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';

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
          setMovie1(res1.movie || res1.data);
        }
        if (m2Id) {
          const res2 = await api.getMovieDetails(m2Id);
          setMovie2(res2.movie || res2.data);
        }
      } catch (err) {
        console.error('Failed to load preselected duel contenders', err);
      }
    };

    loadPreselected();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[85vh] flex flex-col space-y-10">
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
          Select two cinematic heavyweights, tune the evaluation metrics to your taste, and let our comparison engine crown the definitive winner.
        </p>
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
            Select both contender movies above to unlock the clash button
          </p>
        )}
      </div>
    </div>
  );
}

export default DuelPage;

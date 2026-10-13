import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Sliders,
  Swords,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  Star,
  Film,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import { formatDate, getImageUrl } from '../utils/formatters';

export function ProfilePage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [genres, setGenres] = useState(api.FALLBACK_GENRES);
  const [selectedGenres, setSelectedGenres] = useState([878, 28, 12]);
  const [minRuntime, setMinRuntime] = useState(80);
  const [maxRuntime, setMaxRuntime] = useState(180);
  const [language, setLanguage] = useState('en');
  const [releaseFrom, setReleaseFrom] = useState(1990);
  const [releaseTo, setReleaseTo] = useState(2026);
  const [minRating, setMinRating] = useState(7.0);

  const [duelHistory, setDuelHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [genresRes, prefsRes, historyRes] = await Promise.all([
          api.getGenres(),
          api.getPreferences(),
          api.getDuelHistory(),
        ]);

        if (genresRes.genres || genresRes.data) {
          setGenres(genresRes.genres || genresRes.data);
        }

        const prefs = prefsRes.preferences || prefsRes.data;
        if (prefs) {
          if (prefs.favoriteGenres) setSelectedGenres(prefs.favoriteGenres);
          if (prefs.runtimeRange) {
            setMinRuntime(prefs.runtimeRange[0] || 80);
            setMaxRuntime(prefs.runtimeRange[1] || 180);
          }
          if (prefs.language) setLanguage(prefs.language);
          if (prefs.releaseYearFrom) setReleaseFrom(prefs.releaseYearFrom);
          if (prefs.releaseYearTo) setReleaseTo(prefs.releaseYearTo);
          if (prefs.minRating) setMinRating(prefs.minRating);
        }

        if (historyRes.data) {
          setDuelHistory(historyRes.data);
        }
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.updatePreferences({
        favoriteGenres: selectedGenres,
        runtimeRange: [Number(minRuntime), Number(maxRuntime)],
        language,
        releaseYearFrom: Number(releaseFrom),
        releaseYearTo: Number(releaseTo),
        minRating: Number(minRating),
      });
      success('Taste preferences successfully saved!');
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
      toastError('Could not update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-[85vh] space-y-12">
      {/* User Header Profile Card */}
      <div className="bg-[#18181B] border border-[#3F3F46] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-purple-600/30 uppercase">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h1 className="text-2xl font-black text-white">{user?.name || 'Duelist Member'}</h1>
          <p className="text-xs text-[#A1A1AA]">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-[#71717A]">
            <span>Duelist ID: <code className="text-purple-300 font-mono">{user?.id || 'usr_demo'}</code></span>
            <span>•</span>
            <span>Joined: {formatDate(user?.createdAt || new Date())}</span>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="space-y-8">
        <div className="bg-[#18181B] border border-[#3F3F46] rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Taste Profile & Recommendation Filters
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Fine-tune your cinema preferences to calibrate recommendation algorithms
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Save}
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>

          {/* 1. Favorite Genres Multi-Select */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Favorite Genres ({selectedGenres.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {genres.map((g) => {
                const isSelected = selectedGenres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:text-white hover:bg-[#3F3F46]'
                    }`}
                  >
                    <span>{g.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-white text-purple-600 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Runtime and Rating Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#27272A]">
            {/* Minimum Rating */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-white">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Minimum Rating
                </span>
                <span className="text-amber-400 font-extrabold">{minRating} / 10</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="9.5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full h-2 bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Language Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                Primary Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="en">English (Original)</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="ko">Korean (한국어)</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </div>
          </div>

          {/* 3. Release Year Era Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#27272A]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Release Era From
              </label>
              <input
                type="number"
                min="1920"
                max="2030"
                value={releaseFrom}
                onChange={(e) => setReleaseFrom(e.target.value)}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Release Era To
              </label>
              <input
                type="number"
                min="1920"
                max="2030"
                value={releaseTo}
                onChange={(e) => setReleaseTo(e.target.value)}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Duel History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Past Duel Battles</h2>
        </div>

        <div className="space-y-3">
          {duelHistory.length > 0 ? (
            duelHistory.map((duel) => (
              <div
                key={duel.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center -space-x-3">
                    <img
                      src={getImageUrl(duel.movie1?.poster_path, 'w92')}
                      alt={duel.movie1?.title}
                      className="w-10 h-14 object-cover rounded-lg border border-[#3F3F46]"
                    />
                    <img
                      src={getImageUrl(duel.movie2?.poster_path, 'w92')}
                      alt={duel.movie2?.title}
                      className="w-10 h-14 object-cover rounded-lg border border-[#3F3F46]"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {duel.movie1?.title} <span className="text-purple-400">vs</span> {duel.movie2?.title}
                    </h4>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      Winner: <strong className="text-amber-400">{duel.winnerTitle}</strong> ({duel.score1} vs {duel.score2})
                    </p>
                  </div>
                </div>

                <span className="text-xs text-[#71717A]">
                  {formatDate(duel.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#A1A1AA] bg-[#18181B] rounded-2xl border border-[#27272A]">
              No past duels recorded yet. Jump into the Duel Arena to clash movies!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

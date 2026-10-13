import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Swords,
  Flame,
  Sparkles,
  Calendar,
  Play,
  ArrowRight,
  Star,
  CheckCircle,
} from 'lucide-react';
import { MovieHero } from '../components/movie/MovieHero';
import { MovieCarousel } from '../components/movie/MovieCarousel';
import { MovieCard } from '../components/movie/MovieCard';
import { SectionHeader } from '../components/movie/SectionHeader';
import { TrailerModal } from '../components/movie/TrailerModal';
import { RecommendationCard } from '../components/recommendation/RecommendationCard';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { formatYear, getImageUrl } from '../utils/formatters';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingWindow, setTrendingWindow] = useState('day');
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trailer modal state
  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    videoKey: null,
    title: '',
  });

  const loadHomeData = async (windowChoice = trendingWindow) => {
    setLoading(true);
    setError(null);

    try {
      const [trendingRes, upcomingRes, popularRes, recsRes] = await Promise.all([
        api.getTrending(windowChoice),
        api.getUpcoming(),
        api.getPopular(),
        api.getRecommendations(),
      ]);

      const trendingList = trendingRes.results || trendingRes.data || [];
      const upcomingList = upcomingRes.results || upcomingRes.data || [];
      const popularList = popularRes.results || popularRes.data || [];
      const recsList = recsRes.data || recsRes.results || [];

      setTrendingMovies(trendingList);
      setUpcomingMovies(upcomingList);
      setPopularMovies(popularList);
      setRecommendations(recsList);

      // Random or top featured hero
      if (trendingList.length > 0) {
        setHeroMovie(trendingList[0]);
      }
    } catch (err) {
      console.error('Home page load error:', err);
      setError('Failed to fetch home recommendations. Using offline archives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData(trendingWindow);
  }, [trendingWindow]);

  const handleOpenTrailer = (movie) => {
    const videoKey = movie.videos?.results?.[0]?.key || 'Way9Dexny3w';
    setTrailerModal({
      isOpen: true,
      videoKey,
      title: `${movie.title} — Official Trailer`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Spotlight */}
      <MovieHero
        movie={heroMovie}
        loading={loading}
        onOpenTrailer={heroMovie ? () => handleOpenTrailer(heroMovie) : undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16 sm:space-y-24">
        {error && (
          <ErrorBanner
            message={error}
            onRetry={() => loadHomeData(trendingWindow)}
          />
        )}

        {/* 2. Trending Now Section with Day / Week Toggle */}
        <section>
          <SectionHeader
            title="Trending Now"
            subtitle="The most talked-about films catching global attention right now"
            icon={TrendingUp}
            viewAllLink="/search"
          >
            {/* Day / Week Toggle */}
            <div className="inline-flex rounded-xl bg-[#18181B] border border-[#27272A] p-1">
              <button
                type="button"
                onClick={() => setTrendingWindow('day')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  trendingWindow === 'day'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTrendingWindow('week')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  trendingWindow === 'week'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                This Week
              </button>
            </div>
          </SectionHeader>

          <MovieCarousel
            movies={trendingMovies}
            loading={loading}
          />
        </section>

        {/* 3. Duel Arena Callout Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/70 via-[#18181B] to-rose-950/70 border border-purple-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                <Swords className="w-3.5 h-3.5" />
                <span>Cinematic Decision Engine</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Torn Between Two Movies? <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Let Them Duel.
                </span>
              </h2>

              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                Compare critical response, audience appeal, narrative depth, and visual spectacle. Weight the metrics to fit your mood and decide tonight&apos;s watch instantly.
              </p>

              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={Swords}
                  onClick={() => navigate('/duel')}
                >
                  Enter Duel Arena
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/duel?m1=693134&m2=157336')}
                >
                  View Dune vs Interstellar
                </Button>
              </div>
            </div>

            {/* Duel Visual Matchup Mockup */}
            <div className="flex items-center gap-3 sm:gap-6 bg-[#09090B]/60 p-4 sm:p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex flex-col items-center">
                <img
                  src={getImageUrl('/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 'w185')}
                  alt="Dune 2"
                  className="w-20 sm:w-28 aspect-[2/3] object-cover rounded-xl shadow-lg border border-purple-500/40"
                />
                <span className="text-[11px] font-bold text-white mt-1.5 truncate max-w-[90px]">
                  Dune: Part Two
                </span>
              </div>

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-xl shrink-0">
                VS
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={getImageUrl('/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'w185')}
                  alt="Interstellar"
                  className="w-20 sm:w-28 aspect-[2/3] object-cover rounded-xl shadow-lg border border-rose-500/40"
                />
                <span className="text-[11px] font-bold text-white mt-1.5 truncate max-w-[90px]">
                  Interstellar
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Talk of the Town (Trailers & Hot Releases) */}
        <section>
          <SectionHeader
            title="Talk of the Town"
            subtitle="The hottest releases and trailers stirring up discussions across the globe"
            icon={Flame}
            viewAllLink="/search"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMovies.slice(0, 4).map((movie, index) => (
              <div
                key={movie.id}
                className="group relative rounded-2xl overflow-hidden bg-[#18181B] border border-[#27272A] hover:border-purple-500/50 transition-all flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                  <img
                    src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w780')}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Play Trailer Icon Overlay */}
                  <button
                    onClick={() => handleOpenTrailer(movie)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl backdrop-blur-sm"
                    aria-label={`Play trailer for ${movie.title}`}
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>

                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                      {index % 2 === 0 ? 'Official Trailer' : 'Trending Hot'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-purple-300">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1">
                      {movie.overview}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#27272A] text-xs">
                    <span className="text-[#A1A1AA]">{formatYear(movie.release_date)}</span>
                    <button
                      onClick={() => navigate(`/duel?m1=${movie.id}`)}
                      className="font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>Duel this</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Recommendations for You */}
        <section>
          <SectionHeader
            title="Recommendations For You"
            subtitle={
              isAuthenticated
                ? "Algorithmic recommendations tailored to your taste profile and dueling habits"
                : "Personalized picks based on top-rated cinema masterworks"
            }
            icon={Sparkles}
          >
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in for personalized taste AI
                </Button>
              </Link>
            )}
          </SectionHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((movie) => (
              <RecommendationCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* 6. Upcoming Releases */}
        <section>
          <SectionHeader
            title="Upcoming Releases"
            subtitle="Keep an eye on the cinematic calendar for anticipated premieres"
            icon={Calendar}
            viewAllLink="/upcoming"
          />

          <MovieCarousel
            movies={upcomingMovies}
            loading={loading}
          />
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ ...trailerModal, isOpen: false })}
        videoKey={trailerModal.videoKey}
        title={trailerModal.title}
      />
    </div>
  );
}

export default HomePage;

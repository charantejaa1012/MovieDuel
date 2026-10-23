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

const HOME_DUEL_MATCHUPS = [
  {
    id: 'dune-interstellar',
    title: 'Dune: Part Two vs Interstellar',
    badge: 'Sci-Fi Titans',
    movie1: {
      id: 693134,
      title: 'Dune: Part Two',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      rating: 8.3,
      year: '2024',
    },
    movie2: {
      id: 157336,
      title: 'Interstellar',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      rating: 8.4,
      year: '2014',
    },
  },
  {
    id: 'dark-knight-fight-club',
    title: 'The Dark Knight vs Fight Club',
    badge: 'Cult Classics',
    movie1: {
      id: 155,
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      rating: 8.5,
      year: '2008',
    },
    movie2: {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      rating: 8.4,
      year: '1999',
    },
  },
  {
    id: 'oppenheimer-barbie',
    title: 'Oppenheimer vs Barbie',
    badge: 'Barbenheimer 2023',
    movie1: {
      id: 872585,
      title: 'Oppenheimer',
      poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      rating: 8.1,
      year: '2023',
    },
    movie2: {
      id: 346698,
      title: 'Barbie',
      poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
      rating: 7.1,
      year: '2023',
    },
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingWindow, setTrendingWindow] = useState('day');
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [duelMatchups, setDuelMatchups] = useState(HOME_DUEL_MATCHUPS);
  const [selectedMatchupIdx, setSelectedMatchupIdx] = useState(0);

  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trailer modal state
  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    videoKey: null,
    title: '',
  });

  const toList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.recommendations)) return res.recommendations;
    if (Array.isArray(res.results)) return res.results;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.recommendations)) return res.data.recommendations;
    if (res.data && Array.isArray(res.data.results)) return res.data.results;
    return [];
  };

  const loadHomeData = async (windowChoice = trendingWindow) => {
    setLoading(true);
    setError(null);

    try {
      const [trendingRes, upcomingRes, popularRes, recsRes, matchupsRes] = await Promise.all([
        api.getTrending(windowChoice),
        api.getUpcoming(),
        api.getPopular(),
        api.getRecommendations(),
        api.getFeaturedDuels(),
      ]);

      const trendingList = toList(trendingRes);
      const upcomingList = toList(upcomingRes);
      const popularList = toList(popularRes);
      const recsList = toList(recsRes);

      setTrendingMovies(trendingList);
      setUpcomingMovies(upcomingList);
      setPopularMovies(popularList);
      setRecommendations(recsList);

      if (Array.isArray(matchupsRes) && matchupsRes.length > 0) {
        setDuelMatchups(matchupsRes);
      }

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

  const handleOpenTrailer = async (movie) => {
    if (!movie) return;
    try {
      // 1. Check if videos array is already on movie object
      let videoKey =
        movie.videos?.results?.find(
          (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
        )?.key ||
        movie.videos?.results?.find((v) => v.site === 'YouTube')?.key;

      // 2. Fetch specific trailer from backend TMDB endpoint
      if (!videoKey) {
        const videos = await api.getMovieVideos(movie.id);
        const trailer =
          videos.find(
            (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
          ) ||
          videos.find((v) => v.site === 'YouTube') ||
          videos[0];

        if (trailer?.key) {
          videoKey = trailer.key;
        }
      }

      setTrailerModal({
        isOpen: true,
        videoKey: videoKey || null,
        title: `${movie.title} — Official Trailer`,
      });
    } catch (err) {
      console.warn('Failed to load movie trailer:', err);
      setTrailerModal({
        isOpen: true,
        videoKey: null,
        title: `${movie.title} — Official Trailer`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Netflix-Style Rotating Hero Carousel */}
      <MovieHero
        movies={trendingMovies.slice(0, 7)}
        movie={heroMovie}
        loading={loading}
        onOpenTrailer={handleOpenTrailer}
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

        {/* 3. Dynamic Duel Arena Showcase Banner */}
        {(() => {
          const currentMatchup = duelMatchups[selectedMatchupIdx] || duelMatchups[0] || HOME_DUEL_MATCHUPS[0];
          return (
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950/80 via-[#18181B] to-rose-950/80 border border-purple-500/30 p-6 sm:p-10 shadow-2xl space-y-6">
              {/* Matchup Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-300 text-xs font-extrabold uppercase tracking-wider">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Featured Arena Showdowns</span>
                  </div>
                  <span className="text-xs text-[#A1A1AA] hidden sm:inline">
                    Pick a matchup to preview head-to-head clash
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {duelMatchups.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMatchupIdx(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedMatchupIdx === idx
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 border border-purple-400'
                          : 'bg-[#27272A]/70 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] border border-[#3F3F46]'
                      }`}
                    >
                      {m.badge}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl text-center lg:text-left">
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Torn Between Films? <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-rose-400 bg-clip-text text-transparent">
                      {currentMatchup.title}
                    </span>
                  </h2>

                  <p className="text-sm text-[#D4D4D8] leading-relaxed">
                    Compare critic ratings, audience acclaim, runtime pace, and genre affinity using our Weighted Scoring Model. Set your weights and eliminate decision fatigue tonight.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={Swords}
                      onClick={() =>
                        navigate(`/duel/${currentMatchup.movie1.id}/${currentMatchup.movie2.id}`)
                      }
                      className="accent-glow font-bold"
                    >
                      Launch Clash ({currentMatchup.movie1.title} vs {currentMatchup.movie2.title})
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/duel')}
                    >
                      Build Custom Duel
                    </Button>
                  </div>
                </div>

                {/* Dynamic Interactive Duel Visual Matchup Preview */}
                <div className="flex items-center gap-3 sm:gap-6 bg-[#09090B]/80 p-4 sm:p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
                  {/* Contender 1 */}
                  <motion.div
                    key={`c1-${currentMatchup.movie1.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border border-purple-500/40 group">
                      <img
                        src={getImageUrl(currentMatchup.movie1.poster_path, 'w342')}
                        alt={currentMatchup.movie1.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=342&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-300 text-[10px] font-black flex items-center gap-1 border border-amber-500/20">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{currentMatchup.movie1.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white mt-2 truncate max-w-[100px] text-center">
                      {currentMatchup.movie1.title}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      {currentMatchup.movie1.year}
                    </span>
                  </motion.div>

                  {/* VS Clash Badge */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-rose-500 flex items-center justify-center font-black text-white text-sm shadow-xl shrink-0 p-0.5">
                      <div className="w-full h-full bg-[#18181B] rounded-[14px] flex items-center justify-center text-purple-300 font-extrabold text-xs">
                        VS
                      </div>
                    </div>
                  </div>

                  {/* Contender 2 */}
                  <motion.div
                    key={`c2-${currentMatchup.movie2.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border border-rose-500/40 group">
                      <img
                        src={getImageUrl(currentMatchup.movie2.poster_path, 'w342')}
                        alt={currentMatchup.movie2.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=342&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-300 text-[10px] font-black flex items-center gap-1 border border-amber-500/20">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{currentMatchup.movie2.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white mt-2 truncate max-w-[100px] text-center">
                      {currentMatchup.movie2.title}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      {currentMatchup.movie2.year}
                    </span>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 4. Talk of the Town (Trailers & Hot Releases) */}
        <section>
          <SectionHeader
            title="Talk of the Town"
            subtitle="The hottest releases and trailers stirring up discussions across the globe"
            icon={Flame}
            viewAllLink="/search"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Array.isArray(popularMovies) ? popularMovies : []).slice(0, 4).map((movie, index) => (
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
            {(Array.isArray(recommendations) && recommendations.length > 0
              ? recommendations
              : popularMovies
            ).slice(0, 4).map((movie) => (
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

import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Search,
  Bookmark,
  Calendar,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  Star,
  Film,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useMovieSearch } from '../../hooks/useMovieSearch';
import { getImageUrl, formatYear } from '../../utils/formatters';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const { isScrolled } = useScrollPosition(25);
  const location = useLocation();
  const navigate = useNavigate();

  // Search overlay / input state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { query, setQuery, results, loading, clear } = useMovieSearch('', 250);
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserDropdownOpen(false);
    clear();
  }, [location.pathname, clear]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (movieId) => {
    setIsSearchOpen(false);
    clear();
    navigate(`/movie/${movieId}`);
  };

  const navLinks = [
    { label: 'Explore', path: '/search', icon: Compass },
    { label: 'Duel Arena', path: '/duel', icon: Swords, badge: 'HOT' },
    { label: 'Upcoming', path: '/upcoming', icon: Calendar },
    {
      label: 'Watchlist',
      path: '/watchlist',
      icon: Bookmark,
      count: watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] shadow-xl shadow-black/50 py-3'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
              <Swords className="w-5 h-5 transition-transform group-hover:rotate-12 duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
                MOVIE <span className="text-purple-400">DUEL</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1AA] -mt-1 hidden sm:block">
                Compare & Decide
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'text-white bg-[#27272A]/80 shadow-inner'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {link.count !== null && (
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-purple-600 text-white">
                      {link.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar / Trigger */}
            <div ref={searchContainerRef} className="relative">
              <div
                className={`flex items-center rounded-xl bg-[#18181B] border border-[#3F3F46] transition-all duration-300 ${
                  isSearchOpen ? 'w-48 sm:w-72 ring-2 ring-purple-500/50' : 'w-10 sm:w-56'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 text-[#A1A1AA] hover:text-purple-400 shrink-0 flex items-center justify-center transition-colors"
                  aria-label="Open search"
                >
                  <Search className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      e.preventDefault();
                      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                      setIsSearchOpen(false);
                      clear();
                    }
                  }}
                  placeholder="Search movies..."
                  className={`bg-transparent text-sm text-[#F4F4F5] placeholder-[#71717A] outline-none pr-3 w-full ${
                    isSearchOpen ? 'block' : 'hidden sm:block'
                  }`}
                />

                {query && (
                  <button
                    onClick={() => {
                      clear();
                      setIsSearchOpen(false);
                    }}
                    className="p-1.5 text-[#71717A] hover:text-white mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Dropdown Results */}
              <AnimatePresence>
                {isSearchOpen && (query.trim().length > 0 || loading) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#18181B] border border-[#3F3F46] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2">
                          <Film className="w-4 h-4 animate-spin text-purple-400" />
                          <span>Searching the archives...</span>
                        </div>
                      ) : results.length > 0 ? (
                        <div>
                          <p className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider px-3 py-1.5">
                            Search Results ({results.length})
                          </p>
                          {results.slice(0, 5).map((movie) => (
                            <button
                              key={movie.id}
                              onClick={() => handleSearchResultClick(movie.id)}
                              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#27272A] transition-colors text-left group"
                            >
                              <img
                                src={getImageUrl(movie.poster_path, 'w92')}
                                alt={movie.title}
                                className="w-10 h-14 object-cover rounded-lg bg-zinc-900 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300">
                                  {movie.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mt-0.5">
                                  <span>{formatYear(movie.release_date)}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                          <div className="p-2 border-t border-[#27272A] mt-1 text-center">
                            <button
                              onClick={() => {
                                setIsSearchOpen(false);
                                navigate(`/search?q=${encodeURIComponent(query)}`);
                              }}
                              className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                            >
                              View all results for &ldquo;{query}&rdquo; →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-[#A1A1AA]">
                          No movies found for &ldquo;{query}&rdquo;.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Buttons / Profile Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#3F3F46] transition-colors"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs uppercase border border-purple-500/30">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-medium text-white hidden lg:block max-w-[100px] truncate">
                    {user?.name || 'Duelist'}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-[#18181B] border border-[#3F3F46] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-[#27272A] mb-1">
                        <p className="text-xs font-bold text-white truncate">{user?.name || 'Duelist'}</p>
                        <p className="text-[11px] text-[#A1A1AA] truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#F4F4F5] hover:bg-[#27272A] transition-colors"
                      >
                        <User className="w-4 h-4 text-purple-400" />
                        <span>Profile & Preferences</span>
                      </Link>

                      <Link
                        to="/watchlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#F4F4F5] hover:bg-[#27272A] transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-purple-400" />
                        <span>My Watchlist ({watchlist.length})</span>
                      </Link>

                      <div className="border-t border-[#27272A] my-1" />

                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:inline-flex">
                  <Button variant="primary" size="sm">
                    Join Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-[#18181B] border border-[#3F3F46] text-[#A1A1AA] hover:text-white md:hidden"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#18181B] border-b border-[#27272A] px-4 pt-3 pb-6 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-purple-950/50 text-white border border-purple-500/30'
                          : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <span>{link.label}</span>
                    </div>
                    {link.count !== null && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white">
                        {link.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-[#27272A] flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth>
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth>
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;

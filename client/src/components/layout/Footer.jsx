import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Film, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-[#27272A] mt-24 text-[#A1A1AA] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Swords className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                MOVIE <span className="text-purple-400">DUEL</span>
              </span>
            </Link>
            <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">
              The premier cinematic comparison platform. Pitch two movies against each other across critical acclaim, audience reception, narrative depth, and visual spectacle to decide what to watch next.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <span>Powered by</span>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-white hover:text-purple-400 transition-colors inline-flex items-center gap-1"
              >
                <Film className="w-3.5 h-3.5 text-purple-400" /> TMDB
              </a>
              <span>(This product uses the TMDB API but is not endorsed or certified by TMDB)</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-purple-400 transition-colors">
                  Home Spotlight
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-purple-400 transition-colors">
                  Search & Explore
                </Link>
              </li>
              <li>
                <Link to="/duel" className="hover:text-purple-400 transition-colors">
                  Movie Duel Arena
                </Link>
              </li>
              <li>
                <Link to="/upcoming" className="hover:text-purple-400 transition-colors">
                  Upcoming Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* User Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Your Library
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/watchlist" className="hover:text-purple-400 transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-purple-400 transition-colors">
                  Genre & Taste Preferences
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-purple-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-purple-400 transition-colors">
                  Register Free
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#18181B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} Movie Duel. Crafted for cinema connoisseurs.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500 inline" />
            <span>for movie lovers worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Swords className="w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              MOVIE <span className="text-purple-400">DUEL</span>
            </span>
          </Link>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome back to the Arena
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Sign in to access your curated watchlist and saved duel histories
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#18181B] border border-[#3F3F46] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-2xl mx-auto">
          <Film className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs">
          404
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Scene Not Found
        </h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Looks like this reel was left on the cutting room floor. The page you are looking for does not exist or has been relocated.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={Home}>
            Back to Homepage
          </Button>
        </Link>
        <Link to="/search">
          <Button variant="outline" size="md" leftIcon={Compass}>
            Explore Movies
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

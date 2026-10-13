import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-purple-400">
        <Swords className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase">
          Verifying Duelist Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

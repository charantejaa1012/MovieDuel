import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import MoviePage from '../pages/MoviePage';
import DuelPage from '../pages/DuelPage';
import DuelResultPage from '../pages/DuelResultPage';
import UpcomingPage from '../pages/UpcomingPage';
import WatchlistPage from '../pages/WatchlistPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Browsing Routes */}
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="movie/:id" element={<MoviePage />} />
        <Route path="duel" element={<DuelPage />} />
        <Route path="duel/:movie1/:movie2" element={<DuelResultPage />} />
        <Route path="upcoming" element={<UpcomingPage />} />

        {/* Protected User Routes */}
        <Route
          path="watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Authentication Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;

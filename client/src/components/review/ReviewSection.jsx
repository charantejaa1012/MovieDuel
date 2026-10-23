import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, Trash2, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import * as api from '../../services/api';

export default function ReviewSection({ movieId, movieTitle, moviePoster }) {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(8);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const fetchReviews = useCallback(async () => {
    if (!movieId) return;
    try {
      const res = await api.getMovieReviews(movieId);
      if (res?.data) {
        setReviews(res.data.reviews || []);
        setStats(res.data.stats || { totalReviews: 0, averageRating: 0 });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please log in to write a review');
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      toastError('Review must be at least 5 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await api.addMovieReview(movieId, {
        rating,
        reviewText: reviewText.trim(),
        movieTitle,
        moviePoster
      });

      success('Your review has been published!');
      setReviewText('');
      fetchReviews();
    } catch (err) {
      toastError(err?.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.deleteMovieReview(reviewId);
      success('Review removed');
      fetchReviews();
    } catch (err) {
      toastError('Could not delete review');
    }
  };

  return (
    <section className="space-y-8 pt-8 border-t border-[#27272A]">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Audience & Community Reviews</h3>
            <p className="text-xs text-[#A1A1AA]">Real verified ratings from fellow cinephiles</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#18181B] px-4 py-2.5 rounded-xl border border-[#27272A]">
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-lg font-black text-white">
              {stats.averageRating > 0 ? stats.averageRating : 'N/A'}
            </span>
            <span className="text-xs text-[#71717A]">/ 10</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-xs text-[#A1A1AA] font-medium">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
      </div>

      {/* Review Submission Form */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 sm:p-6 shadow-xl">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
              <span className="text-sm font-semibold text-white">Rate this film (1 - 10):</span>
              {/* Star selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
                  const isFilled = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 text-zinc-600 hover:text-amber-400 transition-colors focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                          isFilled ? 'text-amber-400 fill-amber-400 scale-110' : ''
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 font-mono text-sm font-bold text-amber-400">
                  {hoverRating || rating}/10
                </span>
              </div>
            </div>

            <div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you think of the directing, acting, cinematography, or soundtrack?"
                rows={3}
                maxLength={2000}
                className="w-full bg-[#121214] border border-[#27272A] rounded-xl p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-1 text-xs text-[#71717A]">
                <span>Minimum 5 characters</span>
                <span>{reviewText.length} / 2000</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={submitting || reviewText.trim().length < 5}
                leftIcon={Send}
              >
                Post Review
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-sm text-zinc-300">
                Sign in to your account to share your personal rating and review with the community.
              </p>
            </div>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 transition-colors shrink-0"
            >
              Sign In
            </a>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 bg-[#18181B] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-[#18181B]/40 rounded-2xl border border-dashed border-[#27272A]">
            <p className="text-sm text-zinc-400">No community reviews yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {reviews.map((rev) => {
                const isOwner = user?.id && (String(rev.userId?._id || rev.userId) === String(user.id));
                const formattedDate = new Date(rev.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <motion.div
                    key={rev._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs uppercase">
                            {rev.userName ? rev.userName.charAt(0) : <UserIcon className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white block">
                              {rev.userName}
                            </span>
                            <span className="text-[11px] text-[#71717A]">{formattedDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-400">{rev.rating}/10</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                        {rev.reviewText}
                      </p>
                    </div>

                    {isOwner && (
                      <div className="flex justify-end pt-2 border-t border-[#27272A]">
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Review
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

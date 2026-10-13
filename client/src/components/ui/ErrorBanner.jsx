import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function ErrorBanner({
  message = 'An unexpected error occurred while loading movie data.',
  onRetry,
  onDismiss,
  className,
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 backdrop-blur-md shadow-xl',
          className
        )}
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-900/50 text-red-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-red-100">{message}</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={RefreshCw}
              className="border-red-500/40 text-red-200 hover:bg-red-900/40"
            >
              Retry
            </Button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-800/40 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ErrorBanner;

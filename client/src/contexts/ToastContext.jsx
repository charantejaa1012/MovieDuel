import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const value = {
    showToast,
    removeToast,
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div 
        aria-live="polite" 
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto"
            >
              <div
                className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border ${
                  toast.type === 'success'
                    ? 'bg-[#18181B]/95 border-[#22C55E]/40 text-white'
                    : toast.type === 'error'
                    ? 'bg-[#18181B]/95 border-[#EF4444]/40 text-white'
                    : toast.type === 'warning'
                    ? 'bg-[#18181B]/95 border-[#EAB308]/40 text-white'
                    : 'bg-[#18181B]/95 border-[#A855F7]/40 text-white'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#EF4444]" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#EAB308]" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-[#A855F7]" />}
                </div>

                <div className="flex-1 text-sm font-medium leading-snug">
                  {toast.message}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-[#A1A1AA] hover:text-white transition-colors p-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;

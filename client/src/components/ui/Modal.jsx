import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  className,
  showCloseButton = true,
}) {
  const modalRef = useRef(null);

  // Close on ESC key & prevent body scrolling when modal open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-[#18181B] border border-[#3F3F46] rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-[#F4F4F5]',
              maxWidth,
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
                {title ? (
                  <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
                ) : (
                  <div />
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;

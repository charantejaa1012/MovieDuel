import React from 'react';
import { Modal } from '../ui/Modal';

export function TrailerModal({ isOpen, onClose, videoKey, title = 'Official Trailer' }) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-4xl"
      className="p-0 bg-black border-purple-500/30"
    >
      <div className="relative aspect-video w-full bg-black rounded-b-2xl overflow-hidden">
        {videoKey ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#A1A1AA]">
            <p className="text-base font-semibold text-white mb-1">
              Trailer not available
            </p>
            <p className="text-xs">
              A trailer preview is currently unavailable for this title.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TrailerModal;

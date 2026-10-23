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
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 text-[#A1A1AA]">
            <p className="text-base font-bold text-white">
              Trailer not directly embeddable
            </p>
            <p className="text-xs max-w-sm">
              The official distributor has restricted direct in-app embedding for this preview.
            </p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-lg shadow-purple-600/30"
            >
              Search & Watch on YouTube
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TrailerModal;

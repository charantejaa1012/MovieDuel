import React from 'react';
import { User } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';

export function CastList({ cast = [] }) {
  if (!cast || cast.length === 0) {
    return (
      <p className="text-sm text-[#A1A1AA] italic">
        Cast information currently not available.
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {cast.map((member) => (
        <div
          key={member.id || member.name}
          className="shrink-0 w-28 sm:w-32 flex flex-col items-center text-center group"
        >
          {/* Cast Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#27272A] border border-[#3F3F46] mb-2.5 shadow-md group-hover:border-purple-500/50 transition-colors">
            {member.profile_path ? (
              <img
                src={getImageUrl(member.profile_path, 'w185')}
                alt={member.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#71717A]">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Name & Character */}
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
            {member.name}
          </h4>
          <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
            {member.character || 'Cast'}
          </p>
        </div>
      ))}
    </div>
  );
}

export default CastList;

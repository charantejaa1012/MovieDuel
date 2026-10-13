import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Toast({ id, type = 'info', message, onClose }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#EAB308]" />,
    info: <Info className="w-5 h-5 text-[#A855F7]" />,
  };

  const borderColors = {
    success: 'border-[#22C55E]/40',
    error: 'border-[#EF4444]/40',
    warning: 'border-[#EAB308]/40',
    info: 'border-[#A855F7]/40',
  };

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-md bg-[#18181B]/95 border text-white w-full max-w-sm',
        borderColors[type] || borderColors.info
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[type] || icons.info}</div>
      <div className="flex-1 text-sm font-medium leading-snug">{message}</div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="shrink-0 text-[#A1A1AA] hover:text-white p-0.5 rounded-lg transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Toast;

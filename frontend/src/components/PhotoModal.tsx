import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getPhotoUrl } from '../api/client';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoPath: string | null;
  title?: string;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photoPath,
  title = 'Selfie Verification Photo',
}) => {
  if (!isOpen || !photoPath) return null;

  const fullUrl = getPhotoUrl(photoPath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Open original image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
          <img
            src={fullUrl}
            alt={title}
            className="w-full h-auto max-h-[65vh] object-contain rounded-lg border border-slate-800"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/400x300/1e293b/94a3b8?text=Photo+Unavailable';
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-gray-50 border border-gray-300 w-full max-w-md rounded-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-50">
          <h3 className="text-sm font-semibold text-black">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-black p-1 rounded-md hover:bg-gray-300 transition"
              title="Open original image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black p-1 rounded-md hover:bg-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 bg-white flex items-center justify-center min-h-300px max-h-70vh overflow-hidden">
          <img
            src={fullUrl}
            alt={title}
            className="w-full h-auto max-h-65vh object-contain rounded-md border border-gray-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://placehold.co/400x300/E8E4E1/2C2C2A?text=Photo+Unavailable';
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-300 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gray-300 hover:bg-[#C5B5A9] text-black transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


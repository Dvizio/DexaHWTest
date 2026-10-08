import React from 'react';
import type { Attendance } from '../types';
import { ClipboardList, X, MapPin } from 'lucide-react';
import { getPhotoUrl } from '../api/client';

interface HrdAttendanceDetailViewProps {
  attendance: Attendance | null;
  onClose: () => void;
  onPhotoClick: (photo: string) => void;
  formatDate: (dateString?: string) => string;
  formatTime: (isoString?: string | null) => string;
}

export const HrdAttendanceDetailView: React.FC<HrdAttendanceDetailViewProps> = ({
  attendance,
  onClose,
  onPhotoClick,
  formatDate,
  formatTime,
}) => {
  if (!attendance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
      <div className="bg-gray-50 border border-gray-200 w-full max-w-2xl rounded-md  overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div>
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-black" />
              Attendance Detail Log
            </h3>
            <p className="text-xs text-gray-500">
              Date: {formatDate(attendance.attendance_date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black p-1.5 rounded-md hover:bg-gray-300/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-white p-4 rounded-md border border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-black">
                {attendance.employee?.name || `Employee #${attendance.employee_id}`}
              </h4>
              <p className="text-xs text-black font-mono">
                {attendance.employee?.employee_number} &bull;{' '}
                {attendance.employee?.department || 'No Department'}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold ${
                attendance.status === 'PRESENT'
                  ? 'bg-gray-50 text-black border border-gray-200'
                  : 'bg-gray-50 text-black border border-gray-200'
              }`}
            >
              {attendance.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black block">
                Check-In Photo (at {formatTime(attendance.check_in_at)})
              </span>
              <div className="aspect-[4/3] bg-white rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                {attendance.check_in_photo ? (
                  <img
                    src={getPhotoUrl(attendance.check_in_photo)}
                    alt="Check-In Selfie"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => onPhotoClick(attendance.check_in_photo)}
                  />
                ) : (
                  <span className="text-xs text-gray-500">No Photo</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-black block">
                Check-Out Photo (at {formatTime(attendance.check_out_at)})
              </span>
              <div className="aspect-[4/3] bg-white rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                {attendance.check_out_photo ? (
                  <img
                    src={getPhotoUrl(attendance.check_out_photo)}
                    alt="Check-Out Selfie"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => onPhotoClick(attendance.check_out_photo || '')}
                  />
                ) : (
                  <span className="text-xs text-gray-500">Not Checked Out Yet</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-md border border-gray-200 space-y-1">
              <span className="text-gray-500 font-medium block">GPS Location</span>
              <a
                href={`https://maps.google.com/?q=${attendance.check_in_latitude},${attendance.check_in_longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-black hover:underline font-mono"
              >
                <MapPin className="w-3.5 h-3.5" />
                Lat: {attendance.check_in_latitude}, Lng:{' '}
                {attendance.check_in_longitude}
              </a>
            </div>

            <div className="bg-white p-3 rounded-md border border-gray-200 space-y-1">
              <span className="text-gray-500 font-medium block">Staff Notes</span>
              <p className="text-black italic">
                {attendance.notes ? `"${attendance.notes}"` : 'No notes submitted'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/80 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black text-xs font-semibold rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

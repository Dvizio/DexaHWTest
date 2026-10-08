import React from 'react';
import type { Attendance } from '../types';
import {
  ClipboardList,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface AttendanceMonitoringProps {
  attendances: Attendance[];
  attStartDate: string;
  setAttStartDate: (value: string) => void;
  attEndDate: string;
  setAttEndDate: (value: string) => void;
  attStatusFilter: string;
  setAttStatusFilter: (value: string) => void;
  attEmployeeName: string;
  setAttEmployeeName: (value: string) => void;
  attPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadingAttendances: boolean;
  onDetailClick: (att: Attendance) => void;
  onPhotoClick: (photo: string) => void;
  onPageChange: (page: number) => void;
  formatDate: (dateString?: string) => string;
  formatTime: (isoString?: string | null) => string;
}

export const AttendanceMonitoring: React.FC<AttendanceMonitoringProps> = ({
  attendances,
  attStartDate,
  setAttStartDate,
  attEndDate,
  setAttEndDate,
  attStatusFilter,
  setAttStatusFilter,
  attEmployeeName,
  setAttEmployeeName,
  attPagination,
  loadingAttendances,
  onDetailClick,
  onPhotoClick,
  onPageChange,
  formatDate,
  formatTime,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-6  space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h3 className="text-base font-bold text-black flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-black" />
            Company Attendance Logs
          </h3>
          <p className="text-xs text-gray-500">
            Inspect daily remote staff check-ins, lateness statuses, and selfie verifications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1.5">
            <span className="text-gray-500">From:</span>
            <input
              type="date"
              value={attStartDate}
              onChange={(e) => setAttStartDate(e.target.value)}
              className="bg-transparent text-black focus:outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1.5">
            <span className="text-gray-500">To:</span>
            <input
              type="date"
              value={attEndDate}
              onChange={(e) => setAttEndDate(e.target.value)}
              className="bg-transparent text-black focus:outline-none text-xs"
            />
          </div>

          <input
            type="text"
            placeholder="Filter by name..."
            value={attEmployeeName}
            onChange={(e) => setAttEmployeeName(e.target.value)}
            className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-black placeholder-gray-400 focus:outline-none w-36"
          />

          <select
            value={attStatusFilter}
            onChange={(e) => setAttStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-black focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
          </select>

          {(attStartDate || attEndDate || attStatusFilter !== 'ALL' || attEmployeeName) && (
            <button
              onClick={() => {
                setAttStartDate('');
                setAttEndDate('');
                setAttStatusFilter('ALL');
                setAttEmployeeName('');
              }}
              className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Check-In</th>
              <th className="py-3 px-4">Check-Out</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Check-In GPS</th>
              <th className="py-3 px-4">Check-Out GPS</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-center">Selfie Photos</th>
              <th className="py-3 px-4 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loadingAttendances ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Loading company attendance logs...</span>
                  </div>
                </td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr
                  key={att.id}
                  className="hover:bg-gray-300/40/40 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-black whitespace-nowrap">
                    {formatDate(att.attendance_date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-black">
                      {att.employee?.name || `Emp #${att.employee_id}`}
                    </div>
                    <div className="text-[11px] text-black font-mono">
                      {att.employee?.employee_number}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-black">
                    {formatTime(att.check_in_at)}
                  </td>
                  <td className="py-3 px-4 font-mono text-black">
                    {formatTime(att.check_out_at)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        att.status === 'PRESENT'
                          ? 'bg-gray-50 text-black border border-gray-200'
                          : 'bg-gray-50 text-black border border-gray-200'
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    <a
                      href={`https://maps.google.com/?q=${att.check_in_latitude},${att.check_in_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-black hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      {typeof att.check_in_latitude === 'number'
                        ? att.check_in_latitude.toFixed(4)
                        : Number(att.check_in_latitude || 0).toFixed(4)}
                      ,{' '}
                      {typeof att.check_in_longitude === 'number'
                        ? att.check_in_longitude.toFixed(4)
                        : Number(att.check_in_longitude || 0).toFixed(4)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {att.check_out_latitude && att.check_out_longitude ? (
                      <a
                        href={`https://maps.google.com/?q=${att.check_out_latitude},${att.check_out_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-black hover:underline"
                      >
                        <MapPin className="w-3 h-3" />
                        {typeof att.check_out_latitude === 'number'
                          ? att.check_out_latitude.toFixed(4)
                          : Number(att.check_out_latitude || 0).toFixed(4)}
                        ,{' '}
                        {typeof att.check_out_longitude === 'number'
                          ? att.check_out_longitude.toFixed(4)
                          : Number(att.check_out_longitude || 0).toFixed(4)}
                      </a>
                    ) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-black max-w-xs truncate">
                    {att.notes || <span className="text-gray-500 italic">None</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {att.check_in_photo && (
                        <button
                          onClick={() => onPhotoClick(att.check_in_photo)}
                          className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                        >
                          In
                        </button>
                      )}
                      {att.check_out_photo && (
                        <button
                          onClick={() => onPhotoClick(att.check_out_photo || '')}
                          className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                        >
                          Out
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDetailClick(att)}
                      className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-300/40 rounded-md transition"
                      title="View Full Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {attPagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
          <span>
            Showing page <strong className="text-black">{attPagination.page}</strong> of{' '}
            <strong className="text-black">{attPagination.totalPages}</strong> (
            {attPagination.total} total records)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(attPagination.page - 1)}
              disabled={attPagination.page <= 1 || loadingAttendances}
              className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(attPagination.page + 1)}
              disabled={
                attPagination.page >= attPagination.totalPages || loadingAttendances
              }
              className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

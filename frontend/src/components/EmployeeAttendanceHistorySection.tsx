import React from 'react';
import { Clock, MapPin, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Attendance } from '../types';

interface EmployeeAttendanceHistorySectionProps {
    history: Attendance[];
    loadingHistory: boolean;
    setLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
    fetchHistory: (page: number) => void;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    formatDate: (dateString?: string) => string;
    formatTime: (timeString?: string) => string;
    setSelectedPhoto: React.Dispatch<React.SetStateAction<string | null>>;
    setStartDate: React.Dispatch<React.SetStateAction<string>>;
    setEndDate: React.Dispatch<React.SetStateAction<string>>;
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
    startDate: string;
    endDate: string;
    statusFilter: string;
}

export const EmployeeAttendanceHistorySection: React.FC<
    EmployeeAttendanceHistorySectionProps
> = ({
    history,
    loadingHistory,
    fetchHistory,
    pagination,
    formatDate,
    formatTime,
    setSelectedPhoto,
    setStartDate,
    setEndDate,
    setStatusFilter,
    startDate,
    endDate,
    statusFilter,
}) => {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 space-y-4">
                {/* Header & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
                    <div>
                        <h3 className="text-base font-bold text-black flex items-center gap-2">
                            <Clock className="w-4 h-4 text-black" />
                            My Attendance History
                        </h3>
                        <p className="text-xs text-gray-500">
                            Track your attendance records and check-in/out timestamps
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1.5">
                            <span className="text-gray-500">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-black focus:outline-none text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2.5 py-1.5">
                            <span className="text-gray-500">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-black focus:outline-none text-xs"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-black focus:outline-none text-xs"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PRESENT">Present (On Time)</option>
                            <option value="LATE">Late</option>
                        </select>

                        {(startDate || endDate || statusFilter !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setStatusFilter('ALL');
                                }}
                                className="px-2.5 py-1.5 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded-md text-xs transition"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto rounded-md border border-gray-200">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Check-In</th>
                                <th className="py-3 px-4">Check-Out</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">GPS Location</th>
                                <th className="py-3 px-4">Notes</th>
                                <th className="py-3 px-4 text-center">Selfie Photo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loadingHistory ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        <div className="inline-flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                                            <span>Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        No attendance records found matching the filters.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-gray-300/40 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-black whitespace-nowrap">
                                            {formatDate(record.attendance_date)}
                                        </td>
                                        <td className="py-3 px-4 text-black font-mono">
                                            {formatTime(record.check_in_at ?? undefined)}
                                        </td>
                                        <td className="py-3 px-4 text-black font-mono">
                                            {formatTime(record.check_out_at ?? undefined)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${record.status === 'PRESENT'
                                                    ? 'bg-gray-50 text-black border border-gray-200'
                                                    : 'bg-gray-50 text-black border border-gray-200'
                                                    }`}
                                            >
                                                {record.status === 'PRESENT' ? 'PRESENT' : 'LATE'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                            <a
                                                href={`https://maps.google.com/?q=${record.check_in_latitude},${record.check_in_longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-black hover:underline"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                {typeof record.check_in_latitude === 'number'
                                                    ? record.check_in_latitude.toFixed(4)
                                                    : Number(record.check_in_latitude || 0).toFixed(4)}
                                                ,{' '}
                                                {typeof record.check_in_longitude === 'number'
                                                    ? record.check_in_longitude.toFixed(4)
                                                    : Number(record.check_in_longitude || 0).toFixed(4)}
                                            </a>
                                        </td>
                                        <td className="py-3 px-4 text-black max-w-xs truncate">
                                            {record.notes || <span className="text-gray-500 italic">None</span>}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {record.check_in_photo && (
                                                    <button
                                                        onClick={() => setSelectedPhoto(record.check_in_photo)}
                                                        className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                                                    >
                                                        In
                                                    </button>
                                                )}
                                                {record.check_out_photo && (
                                                    <button
                                                        onClick={() =>
                                                            setSelectedPhoto(record.check_out_photo || null)
                                                        }
                                                        className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                                                    >
                                                        Out
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                        <span>
                            Showing page <strong className="text-black">{pagination.page}</strong> of{' '}
                            <strong className="text-black">{pagination.totalPages}</strong> (
                            {pagination.total} total logs)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchHistory(pagination.page - 1)}
                                disabled={pagination.page <= 1 || loadingHistory}
                                className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => fetchHistory(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || loadingHistory}
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
import React from 'react';
import type { Attendance } from '../types';
import {
    Clock,
    Calendar,
    CheckCircle,
    LogIn,
    LogOut,
    MapPin,
    FileText,
    ImageIcon,
    RefreshCw,
    Sparkles,
} from 'lucide-react';

interface EmployeeAttendanceStatusCardProps {
    todayAttendance: Attendance | null;
    loadingToday: boolean;
    onRefresh: () => void;
    onOpenModal: (type: 'check-in' | 'check-out') => void;
    onSelectPhoto: (photoUrl: string | null) => void;
    formatTime: (isoString?: string | null) => string;
}

export const EmployeeAttendanceStatusCard: React.FC<EmployeeAttendanceStatusCardProps> = ({
    todayAttendance,
    loadingToday,
    onRefresh,
    onOpenModal,
    onSelectPhoto,
    formatTime,
}) => {
    return (
        <div className="lg:col-span-2 bg-gray-50/80 border border-gray-200 rounded-md p-6 flex flex-col justify-between relative">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-gray-50 text-black flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-black">Today's Attendance</h3>
                            <p className="text-xs text-gray-500">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={loadingToday}
                        className="text-gray-500 hover:text-black p-1.5 rounded-md hover:bg-gray-300/40 transition"
                        title="Refresh Today's Status"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${loadingToday ? 'animate-spin text-black' : ''}`}
                        />
                    </button>
                </div>

                {/* Dynamic Status Section */}
                {loadingToday ? (
                    <div className="py-8 flex items-center justify-center text-gray-500 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-black" />
                        <span className="text-xs">Loading today's attendance...</span>
                    </div>
                ) : !todayAttendance ? (
                    /* STATE 1: NOT CHECKED IN */
                    <div className="bg-white/60 border border-gray-200/80 rounded-md p-5 my-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-black flex-shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-black">
                                    You have not checked in today
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Please take a selfie with GPS verification to record your check-in.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onOpenModal('check-in')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 hover:bg-[#C5B5A9] text-black text-sm font-bold rounded-md transition duration-200 cursor-pointer flex-shrink-0"
                        >
                            <LogIn className="w-4 h-4" />
                            Check In Now
                        </button>
                    </div>
                ) : !todayAttendance.check_out_at ? (
                    /* STATE 2: CHECKED IN, PENDING CHECK OUT */
                    <div className="bg-white/60 border border-gray-200/80 rounded-md p-5 my-2 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-black flex-shrink-0">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-semibold text-black">
                                            Checked In at {formatTime(todayAttendance.check_in_at)}
                                        </h4>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${todayAttendance.status === 'PRESENT'
                                                ? 'bg-gray-50 text-black border border-gray-200'
                                                : 'bg-gray-50 text-black border border-gray-200'
                                                }`}
                                        >
                                            {todayAttendance.status === 'PRESENT' ? 'ON TIME' : 'LATE'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Working active shift. Don't forget to check out at the end of your day!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => onOpenModal('check-out')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 hover:bg-[#C5B5A9] text-black text-sm font-bold rounded-md transition duration-200 cursor-pointer flex-shrink-0"
                            >
                                <LogOut className="w-4 h-4" />
                                Check Out
                            </button>
                        </div>

                        {/* Check-In Details pill */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50/80 p-3 rounded-md border border-gray-200">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-black" />
                                <span>
                                    Lat: {todayAttendance.check_in_latitude}, Lng:{' '}
                                    {todayAttendance.check_in_longitude}
                                </span>
                            </div>
                            {todayAttendance.notes && (
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="italic text-black">"{todayAttendance.notes}"</span>
                                </div>
                            )}
                            {todayAttendance.check_in_photo && (
                                <button
                                    onClick={() => onSelectPhoto(todayAttendance.check_in_photo)}
                                    className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer ml-auto"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    View Check-In Photo
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* STATE 3: COMPLETED FOR TODAY */
                    <div className="bg-white/60 border border-gray-200/80 rounded-md p-5 my-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-black">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-black">
                                        Attendance Completed for Today
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Both Check-In and Check-Out have been recorded successfully.
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-md ${todayAttendance.status === 'PRESENT'
                                    ? 'bg-gray-50 text-black border border-gray-200'
                                    : 'bg-gray-50 text-black border border-gray-200'
                                    }`}
                            >
                                {todayAttendance.status === 'PRESENT' ? 'PRESENT' : 'LATE'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50/80 p-3 rounded-md border border-gray-200">
                            <div>
                                <span className="text-gray-500 block text-[11px]">Check-In Time</span>
                                <span className="font-semibold text-black">
                                    {formatTime(todayAttendance.check_in_at)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Check-Out Time</span>
                                <span className="font-semibold text-black">
                                    {formatTime(todayAttendance.check_out_at)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Check-In Photo</span>
                                <button
                                    onClick={() => onSelectPhoto(todayAttendance.check_in_photo)}
                                    className="text-black hover:underline font-medium"
                                >
                                    View Photo
                                </button>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-[11px]">Check-Out Photo</span>
                                {todayAttendance.check_out_photo ? (
                                    <button
                                        onClick={() => onSelectPhoto(todayAttendance.check_out_photo || null)}
                                        className="text-black hover:underline font-medium"
                                    >
                                        View Photo
                                    </button>
                                ) : (
                                    <span className="text-gray-500">-</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-gray-200 pt-3 mt-2">
                <span>Cutoff Late Threshold: 09:00 AM</span>
                <span>All timestamps recorded in local server time</span>
            </div>
        </div>
    );
};
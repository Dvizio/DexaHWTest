import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { WebcamModal } from '../components/WebcamModal';
import { PhotoModal } from '../components/PhotoModal';
import { apiClient } from '../api/client';
import type { Employee, Attendance, PaginatedResponse } from '../types';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  LogIn,
  LogOut,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isWebcamOpen, setIsWebcamOpen] = useState<boolean>(false);
  const [webcamType, setWebcamType] = useState<'check-in' | 'check-out'>('check-in');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Loading & Alert states
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [loadingToday, setLoadingToday] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [actionAlert, setActionAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch Employee Profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await apiClient.get<Employee>('/employees/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch Today's Attendance
  const fetchTodayAttendance = useCallback(async () => {
    setLoadingToday(true);
    try {
      const res = await apiClient.get<Attendance | null>('/attendances/me/today');
      setTodayAttendance(res.data);
    } catch (err) {
      console.error('Failed to fetch today attendance', err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  // Fetch Attendance History
  const fetchHistory = useCallback(
    async (pageToLoad = pagination.page) => {
      setLoadingHistory(true);
      try {
        const params: any = {
          page: pageToLoad,
          limit: pagination.limit,
        };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;

        const res = await apiClient.get<PaginatedResponse<Attendance>>('/attendances/me', {
          params,
        });

        setHistory(res.data.data || []);
        if (res.data.meta) {
          setPagination({
            page: res.data.meta.page,
            limit: res.data.meta.limit,
            total: res.data.meta.total,
            totalPages: res.data.meta.totalPages || 1,
          });
        }
      } catch (err) {
        console.error('Failed to fetch attendance history', err);
      } finally {
        setLoadingHistory(false);
      }
    },
    [startDate, endDate, statusFilter, pagination.limit, pagination.page]
  );

  useEffect(() => {
    fetchProfile();
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  useEffect(() => {
    fetchHistory(1);
  }, [startDate, endDate, statusFilter]);

  // Trigger Check-In or Check-Out Modal
  const handleOpenAttendanceModal = (type: 'check-in' | 'check-out') => {
    setWebcamType(type);
    setIsWebcamOpen(true);
  };

  // Submit Check-In / Check-Out
  const handleAttendanceSubmit = async (formData: FormData) => {
    setActionAlert(null);
    try {
      const endpoint =
        webcamType === 'check-in'
          ? '/attendances/check-in'
          : '/attendances/check-out';

      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActionAlert({
        type: 'success',
        message: `Successfully recorded ${
          webcamType === 'check-in' ? 'Check-In' : 'Check-Out'
        }!`,
      });

      // Refresh data
      await fetchTodayAttendance();
      await fetchHistory(1);
    } catch (err: any) {
      console.error('Attendance submit error', err);
      const msg =
        err.response?.data?.message ||
        `Failed to submit ${webcamType === 'check-in' ? 'Check-In' : 'Check-Out'}`;
      setActionAlert({
        type: 'error',
        message: Array.isArray(msg) ? msg[0] : msg,
      });
      throw err;
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      <Navbar title="Staff Portal" subtitle="Employee Attendance Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {/* Global Notification Banner */}
        {actionAlert && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              actionAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {actionAlert.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span>{actionAlert.message}</span>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Section: Profile Card & Today's Attendance Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Employee Profile
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {profile?.status || 'ACTIVE'}
                </span>
              </div>

              {loadingProfile ? (
                <div className="space-y-2 py-4 animate-pulse">
                  <div className="h-5 bg-slate-800 rounded w-2/3" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{profile?.name}</h2>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">
                    {profile?.employee_number}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Department</span>
                      <span className="font-medium text-slate-200">
                        {profile?.department || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Position</span>
                      <span className="font-medium text-slate-200">
                        {profile?.position || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Email</span>
                      <span className="font-medium text-slate-200">{profile?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400">Phone</span>
                      <span className="font-medium text-slate-200">{profile?.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Account: @{profile?.user?.username}</span>
              <span className="text-emerald-400 font-medium">Verified Active</span>
            </div>
          </div>

          {/* Today's Attendance Status Card (2 Columns Span on LG) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Today's Attendance
                    </h3>
                    <p className="text-xs text-slate-400">
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
                  onClick={fetchTodayAttendance}
                  disabled={loadingToday}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                  title="Refresh Today's Status"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loadingToday ? 'animate-spin text-blue-400' : ''}`}
                  />
                </button>
              </div>

              {/* Dynamic Status Section */}
              {loadingToday ? (
                <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-xs">Loading today's attendance...</span>
                </div>
              ) : !todayAttendance ? (
                /* STATE 1: NOT CHECKED IN */
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 my-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        You have not checked in today
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Please take a selfie with GPS verification to record your check-in.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAttendanceModal('check-in')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition duration-200 cursor-pointer flex-shrink-0"
                  >
                    <LogIn className="w-4 h-4" />
                    Check In Now
                  </button>
                </div>
              ) : !todayAttendance.check_out_at ? (
                /* STATE 2: CHECKED IN, PENDING CHECK OUT */
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 my-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-200">
                            Checked In at {formatTime(todayAttendance.check_in_at)}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              todayAttendance.status === 'PRESENT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {todayAttendance.status === 'PRESENT' ? 'ON TIME' : 'LATE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Working active shift. Don't forget to check out at the end of your day!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAttendanceModal('check-out')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 cursor-pointer flex-shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      Check Out
                    </button>
                  </div>

                  {/* Check-In Details pill */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        Lat: {todayAttendance.check_in_latitude}, Lng:{' '}
                        {todayAttendance.check_in_longitude}
                      </span>
                    </div>
                    {todayAttendance.notes && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="italic text-slate-300">"{todayAttendance.notes}"</span>
                      </div>
                    )}
                    {todayAttendance.check_in_photo && (
                      <button
                        onClick={() => setSelectedPhoto(todayAttendance.check_in_photo)}
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline cursor-pointer ml-auto"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        View Check-In Photo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* STATE 3: COMPLETED FOR TODAY */
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 my-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">
                          Attendance Completed for Today
                        </h4>
                        <p className="text-xs text-slate-400">
                          Both Check-In and Check-Out have been recorded successfully.
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        todayAttendance.status === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {todayAttendance.status === 'PRESENT' ? 'PRESENT' : 'LATE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Check-In Time</span>
                      <span className="font-semibold text-slate-200">
                        {formatTime(todayAttendance.check_in_at)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Check-Out Time</span>
                      <span className="font-semibold text-slate-200">
                        {formatTime(todayAttendance.check_out_at)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Check-In Photo</span>
                      <button
                        onClick={() => setSelectedPhoto(todayAttendance.check_in_photo)}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        View Photo
                      </button>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Check-Out Photo</span>
                      {todayAttendance.check_out_photo ? (
                        <button
                          onClick={() => setSelectedPhoto(todayAttendance.check_out_photo || null)}
                          className="text-blue-400 hover:underline font-medium"
                        >
                          View Photo
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3 mt-2">
              <span>Cutoff Late Threshold: 09:00 AM</span>
              <span>All timestamps recorded in local server time</span>
            </div>
          </div>
        </div>

        {/* Attendance History Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                My Attendance History
              </h3>
              <p className="text-xs text-slate-400">
                Track your attendance records and check-in/out timestamps
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-xs"
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
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Loading records...</span>
                      </div>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No attendance records found matching the filters.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatTime(record.check_in_at)}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatTime(record.check_out_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.status === 'PRESENT'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {record.status === 'PRESENT' ? 'PRESENT' : 'LATE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <a
                          href={`https://maps.google.com/?q=${record.check_in_latitude},${record.check_in_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          {record.check_in_latitude?.toFixed(4)},{' '}
                          {record.check_in_longitude?.toFixed(4)}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {record.notes || <span className="text-slate-500 italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {record.check_in_photo && (
                            <button
                              onClick={() => setSelectedPhoto(record.check_in_photo)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[11px] font-medium border border-slate-700 transition"
                            >
                              In
                            </button>
                          )}
                          {record.check_out_photo && (
                            <button
                              onClick={() => setSelectedPhoto(record.check_out_photo || null)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded text-[11px] font-medium border border-slate-700 transition"
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
            <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
              <span>
                Showing page <strong className="text-slate-200">{pagination.page}</strong> of{' '}
                <strong className="text-slate-200">{pagination.totalPages}</strong> (
                {pagination.total} total logs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loadingHistory}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loadingHistory}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Live Webcam Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onSubmit={handleAttendanceSubmit}
        type={webcamType}
      />

      {/* Photo Preview Modal */}
      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photoPath={selectedPhoto}
      />
    </div>
  );
};

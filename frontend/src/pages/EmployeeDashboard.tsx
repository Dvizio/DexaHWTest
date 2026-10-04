import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { WebcamModal } from '../components/WebcamModal';
import { PhotoModal } from '../components/PhotoModal';
import { apiClient } from '../api/client';
import type { Employee, Attendance, PaginatedResponse } from '../types';
import axios from 'axios';
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Loading & Alert states
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [loadingToday, setLoadingToday] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [actionAlert, setActionAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch Employee Profile
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);

    try {
      const res = await apiClient.get<Employee>('/employees/me');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

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
        const params: Record<string, string | number> = {
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
  }, [fetchProfile, fetchTodayAttendance]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

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
        message: `Successfully recorded ${webcamType === 'check-in' ? 'Check-In' : 'Check-Out'
          }!`,
      });

      // Refresh data
      await fetchTodayAttendance();
      await fetchHistory(1);
    } catch (err: unknown) {
      console.error('Attendance submit error', err);

      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ||
        `Failed to submit ${webcamType === 'check-in' ? 'Check-In' : 'Check-Out'}`
        : `Failed to submit ${webcamType === 'check-in' ? 'Check-In' : 'Check-Out'}`;

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
    <div className="min-h-screen bg-white text-black flex flex-col pb-12">
      <Navbar title="Staff Portal" subtitle="Employee Attendance Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {/* Global Notification Banner */}
        {actionAlert && (
          <div
            className={`p-4 rounded-md flex items-center justify-between border ${actionAlert.type === 'success'
              ? 'bg-gray-50 border-gray-200 text-black'
              : 'bg-gray-50 border-gray-200 text-black'
              }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {actionAlert.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-black" />
              ) : (
                <AlertCircle className="w-5 h-5 text-black" />
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
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6  relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Employee Profile
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-50 text-black border border-gray-200">
                  {profile?.status || 'ACTIVE'}
                </span>
              </div>

              {loadingProfile ? (
                <div className="space-y-2 py-4 animate-pulse">
                  <div className="h-5 bg-gray-300/40 rounded w-2/3" />
                  <div className="h-4 bg-gray-300/40 rounded w-1/2" />
                  <div className="h-4 bg-gray-300/40 rounded w-3/4" />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-black">{profile?.name}</h2>
                  <p className="text-xs text-black font-mono mt-0.5">
                    {profile?.employee_number}
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-black">
                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Department</span>
                      <span className="font-medium text-black">
                        {profile?.department || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Position</span>
                      <span className="font-medium text-black">
                        {profile?.position || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-black">{profile?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-black">{profile?.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
              <span>Account: @{profile?.user?.username}</span>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-black hover:underline font-medium"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Today's Attendance Status Card (2 Columns Span on LG) */}
          <div className="lg:col-span-2 bg-gray-50/80 border border-gray-200 rounded-md p-6  flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-gray-50 text-black flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-black">
                      Today's Attendance
                    </h3>
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
                  onClick={fetchTodayAttendance}
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
                    onClick={() => handleOpenAttendanceModal('check-in')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 hover:bg-[#C5B5A9] text-black  text-sm font-bold rounded-md  transition duration-200 cursor-pointer flex-shrink-0"
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
                      onClick={() => handleOpenAttendanceModal('check-out')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 hover:bg-[#C5B5A9] text-black  text-sm font-bold rounded-md  transition duration-200 cursor-pointer flex-shrink-0"
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
                        onClick={() => setSelectedPhoto(todayAttendance.check_in_photo)}
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
                        onClick={() => setSelectedPhoto(todayAttendance.check_in_photo)}
                        className="text-black hover:underline font-medium"
                      >
                        View Photo
                      </button>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Check-Out Photo</span>
                      {todayAttendance.check_out_photo ? (
                        <button
                          onClick={() => setSelectedPhoto(todayAttendance.check_out_photo || null)}
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
        </div>

        {/* Attendance History Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6  space-y-4">
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
                      className="hover:bg-gray-300/40/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-black whitespace-nowrap">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="py-3 px-4 text-black font-mono">
                        {formatTime(record.check_in_at)}
                      </td>
                      <td className="py-3 px-4 text-black font-mono">
                        {formatTime(record.check_out_at)}
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
                              onClick={() => setSelectedPhoto(record.check_out_photo || null)}
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

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-sm rounded-md  p-6 relative">
            <h3 className="text-base font-bold text-black mb-2">Change Password</h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-black">
                {passwordError}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setPasswordLoading(true);
              setPasswordError(null);

              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('New passwords do not match');
                setPasswordLoading(false);
                return;
              }

              if (passwordForm.newPassword.length < 6) {
                setPasswordError('New password must be at least 6 characters');
                setPasswordLoading(false);
                return;
              }

              try {
                await apiClient.post('/employees/change-password', {
                  oldPassword: passwordForm.oldPassword,
                  newPassword: passwordForm.newPassword,
                });
                setActionAlert({ type: 'success', message: 'Password updated successfully!' });
                setIsPasswordModalOpen(false);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
              } catch (err: unknown) {
                const message = axios.isAxiosError(err)
                  ? err.response?.data?.message
                  : undefined;

                setPasswordError(message || 'Failed to change password');
              } finally {
                setPasswordLoading(false);
              }
            }}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gray-300 hover:bg-[#C5B5A9] text-black disabled:opacity-60  rounded-md text-xs font-semibold"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};







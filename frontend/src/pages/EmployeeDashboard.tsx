import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { WebcamModal } from '../components/WebcamModal';
import { PhotoModal } from '../components/PhotoModal';
import { EmployeeProfile } from '../components/EmployeeProfile';
import { EmployeeAttendanceStatusCard } from '../components/EmployeeAttendanceStatusCard';
import { apiClient } from '../api/client';
import type { Employee, Attendance, PaginatedResponse } from '../types';
import {
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { EmployeeAttendanceHistorySection } from '../components/EmployeeAttendanceHistorySection';

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
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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
    let ignore = false;

    const initData = async () => {
      if (!ignore) {
        await Promise.all([fetchProfile(), fetchTodayAttendance()]);
      }
    };

    initData();

    return () => {
      ignore = true;
    };
  }, [fetchProfile, fetchTodayAttendance]);

  useEffect(() => {
    let ignore = false;

    if (!ignore) {
      fetchHistory(1);
    }

    return () => {
      ignore = true;
    };
  }, [fetchHistory]);

  const handleOpenAttendanceModal = (type: 'check-in' | 'check-out') => {
    setWebcamType(type);
    setIsWebcamOpen(true);
  };

  const handleAttendanceSubmit = async (formData: FormData) => {
    setActionAlert(null);
    try {
      const endpoint =
        webcamType === 'check-in' ? '/attendances/check-in' : '/attendances/check-out';

      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActionAlert({
        type: 'success',
        message: `Successfully recorded ${webcamType === 'check-in' ? 'Check-In' : 'Check-Out'
          }!`,
      });

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
              ? 'bg-green-50 border-gray-200 text-black'
              : 'bg-red-50 border-gray-200 text-black'
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
          <EmployeeProfile
            profile={profile}
            loadingProfile={loadingProfile}
            setIsPasswordModalOpen={setIsPasswordModalOpen}
          />

          <EmployeeAttendanceStatusCard
            todayAttendance={todayAttendance}
            loadingToday={loadingToday}
            onRefresh={fetchTodayAttendance}
            onOpenModal={handleOpenAttendanceModal}
            onSelectPhoto={setSelectedPhoto}
            formatTime={formatTime}
          />
        </div>

        {/* Attendance History Section */}
        <EmployeeAttendanceHistorySection
          history={history}
          loadingHistory={loadingHistory}
          setLoadingHistory={setLoadingHistory}
          fetchHistory={fetchHistory}
          pagination={pagination}
          formatDate={formatDate}
          formatTime={formatTime}
          setSelectedPhoto={setSelectedPhoto}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          endDate={endDate}
          statusFilter={statusFilter}
        />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-sm rounded-md p-6 relative">
            <h3 className="text-base font-bold text-black mb-2">Change Password</h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-black">
                {passwordError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
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
                  setActionAlert({
                    type: 'success',
                    message: 'Password updated successfully!',
                  });
                  setIsPasswordModalOpen(false);
                  setPasswordForm({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                } catch (err: unknown) {
                  const message = axios.isAxiosError(err)
                    ? err.response?.data?.message
                    : undefined;

                  setPasswordError(message || 'Failed to change password');
                } finally {
                  setPasswordLoading(false);
                }
              }}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                    }
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
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
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
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded-md text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gray-300 hover:bg-[#C5B5A9] text-black disabled:opacity-60 rounded-md text-xs font-semibold transition"
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
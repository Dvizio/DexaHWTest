import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { PhotoModal } from '../components/PhotoModal';
import { apiClient } from '../api/client';
import type { Employee, Attendance, PaginatedResponse, EmployeeStatus, User } from '../types';
import {
  Users,
  ClipboardList,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  X,
  Key,
} from 'lucide-react';
import axios from 'axios';
import { EmployeeManagement } from '../components/EmployeeManagement';
import { AttendanceMonitoring } from '../components/AttendanceMonitoring';
import { HrdEditEmployee } from '../components/HrdEditEmployee';
import { HrdAttendanceDetailView } from '../components/HrdAttendanceDetailView';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const HrdDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendances'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empSearch, setEmpSearch] = useState<string>('');
  const [empStatusFilter, setEmpStatusFilter] = useState<string>('ALL');
  const [empPagination, setEmpPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newCredentials, setNewCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    name: string;
  } | null>(null);
  const [createForm, setCreateForm] = useState({
    employee_number: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attStartDate, setAttStartDate] = useState<string>('');
  const [attEndDate, setAttEndDate] = useState<string>('');
  const [attStatusFilter, setAttStatusFilter] = useState<string>('ALL');
  const [attEmployeeName, setAttEmployeeName] = useState<string>('');
  const [attPagination, setAttPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loadingAttendances, setLoadingAttendances] = useState<boolean>(false);
  const [detailAttendance, setDetailAttendance] = useState<Attendance | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  interface CreateEmployeePayload {
    employee_number: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
    position?: string;
  }

  const fetchEmployees = useCallback(
    async (page: number) => {
      setLoadingEmployees(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: empPagination.limit,
        };
        if (empSearch.trim()) params.search = empSearch.trim();
        if (empStatusFilter && empStatusFilter !== 'ALL') params.status = empStatusFilter;
        const res = await apiClient.get<PaginatedResponse<Employee>>('/employees', {
          params,
        });
        setEmployees(res.data.data || []);
        if (res.data.meta) {
          setEmpPagination(prev => ({
            ...prev,
            page: res.data.meta.page,
            limit: res.data.meta.limit,
            total: res.data.meta.total,
            totalPages: res.data.meta.totalPages || 1,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setLoadingEmployees(false);
      }
    },
    [empSearch, empStatusFilter, empPagination.limit]
  );

  const fetchAttendances = useCallback(
    async (page: number) => {
      setLoadingAttendances(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: attPagination.limit,
        };
        if (attStartDate) params.startDate = attStartDate;
        if (attEndDate) params.endDate = attEndDate;
        if (attStatusFilter && attStatusFilter !== 'ALL') params.status = attStatusFilter;
        if (attEmployeeName.trim()) params.employeeName = attEmployeeName.trim();
        const res = await apiClient.get<PaginatedResponse<Attendance>>('/attendances', {
          params,
        });
        setAttendances(res.data.data || []);
        if (res.data.meta) {
          setAttPagination(prev => ({
            ...prev,
            page: res.data.meta.page,
            limit: res.data.meta.limit,
            total: res.data.meta.total,
            totalPages: res.data.meta.totalPages || 1,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch attendances', err);
      } finally {
        setLoadingAttendances(false);
      }
    },
    [attStartDate, attEndDate, attStatusFilter, attEmployeeName, attPagination.limit]
  );

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees(1);
    } else {
      fetchAttendances(1);
    }
  }, [activeTab, empSearch, empStatusFilter, attStartDate, attEndDate, attStatusFilter, attEmployeeName, fetchEmployees, fetchAttendances]);

  const handleCreateEmployee = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);
    try {
      const payload: CreateEmployeePayload = {
        employee_number: createForm.employee_number.trim(),
        name: createForm.name.trim(),
        email: createForm.email.trim(),
      };
      if (createForm.phone.trim()) payload.phone = createForm.phone.trim();
      if (createForm.department.trim()) payload.department = createForm.department.trim();
      if (createForm.position.trim()) payload.position = createForm.position.trim();
      const res = await apiClient.post<{
        employee: Employee;
        user: User;
        temporaryPassword: string;
      }>('/employees', payload);
      setIsCreateOpen(false);
      setCreateForm({
        employee_number: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
      });
      setNewCredentials({
        name: res.data.employee.name,
        username: res.data.user.username,
        temporaryPassword: res.data.temporaryPassword,
      });
      setNotification({
        type: 'success',
        message: `Employee "${res.data.employee.name}" created successfully!`,
      });
      fetchEmployees(1);
    } catch (err: unknown) {
      console.error('Create employee error', err);
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to create employee'
        : 'Failed to create employee';
      setFormError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department || '',
      position: emp.position || '',
    });
    setFormError(null);
    setIsCreateOpen(false);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setFormError(null);
    setFormSubmitting(true);
    try {
      await apiClient.patch(`/employees/${selectedEmployee.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        department: editForm.department.trim() || undefined,
        position: editForm.position.trim() || undefined,
      });
      setIsCreateOpen(false);
      setSelectedEmployee(null);
      setNotification({
        type: 'success',
        message: 'Employee updated successfully!',
      });
      fetchEmployees(empPagination.page);
    } catch (err: unknown) {
      console.error('Update employee error', err);
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || 'Failed to update employee' : 'Failed to update employee';
      setFormError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus: EmployeeStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = nextStatus === 'INACTIVE'
      ? `Are you sure you want to deactivate ${emp.name}? This will disable their login and attendance recording immediately.`
      : `Activate ${emp.name}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await apiClient.patch(`/employees/${emp.id}/status`, {
        status: nextStatus,
      });
      setNotification({
        type: 'success',
        message: `Employee "${emp.name}" status updated to ${nextStatus}.`,
      });
      fetchEmployees(empPagination.page);
    } catch (err: unknown) {
      console.error('Toggle status error', err);
      setNotification({
        type: 'error',
        message: 'Failed to update employee status.',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handlePasswordSuccess = (message: string) => {
    setNotification({
      type: 'success',
      message,
    });
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pb-12">
      <Navbar title="HRD Portal" subtitle="Staff Management & Attendance Monitoring" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-md flex items-center justify-between border ${notification.type === 'success'
              ? 'bg-green-50 border-gray-200 text-black'
              : 'bg-red-50 border-gray-200 text-black'
              }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-black" />
              ) : (
                <AlertCircle className="w-5 h-5 text-black" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('employees')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition duration-200 cursor-pointer ${activeTab === 'employees'
                ? 'bg-gray-300 text-black  '
                : 'bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-300/40 border border-gray-200'
                }`}
            >
              <Users className="w-4 h-4" />
              Employee Management
            </button>

            <button
              onClick={() => setActiveTab('attendances')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition duration-200 cursor-pointer ${activeTab === 'attendances'
                ? 'bg-gray-300 text-black  '
                : 'bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-300/40 border border-gray-200'
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              Attendance Monitoring
            </button>
          </div>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold bg-gray-50 text-black hover: hover:bg-gray-300/40 border border-gray-200 transition cursor-pointer"
          >
            <Key className="w-4 h-4 text-black" />
            Change Password
          </button>
        </div>

        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={employees}
            empSearch={empSearch}
            setEmpSearch={setEmpSearch}
            empStatusFilter={empStatusFilter}
            setEmpStatusFilter={setEmpStatusFilter}
            empPagination={empPagination}
            loadingEmployees={loadingEmployees}
            onCreateClick={() => setIsCreateOpen(true)}
            onEditClick={handleOpenEdit}
            onToggleStatus={handleToggleStatus}
            onPageChange={fetchEmployees}
          />
        )}

        {activeTab === 'attendances' && (
          <AttendanceMonitoring
            attendances={attendances}
            attStartDate={attStartDate}
            setAttStartDate={setAttStartDate}
            attEndDate={attEndDate}
            setAttEndDate={setAttEndDate}
            attStatusFilter={attStatusFilter}
            setAttStatusFilter={setAttStatusFilter}
            attEmployeeName={attEmployeeName}
            setAttEmployeeName={setAttEmployeeName}
            attPagination={attPagination}
            loadingAttendances={loadingAttendances}
            onDetailClick={setDetailAttendance}
            onPhotoClick={setSelectedPhoto}
            onPageChange={fetchAttendances}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )}
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-lg rounded-md  overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-black" />
                Register New Employee
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-500 hover:text-black p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-black text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Employee Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP001"
                    value={createForm.employee_number}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, employee_number: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@wfh.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-gray-500">
                  Username will be automatically created as: {createForm.email ? createForm.email.split('@')[0] : '...'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Phone</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={createForm.department}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, department: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Position</label>
                  <input
                    type="text"
                    placeholder="Software Eng"
                    value={createForm.position}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, position: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-300 hover:bg-[#C5B5A9] text-black  rounded-md text-xs font-bold  transition disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Employee'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-md rounded-md  p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gray-50 text-black flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black">
                  Employee Account Created!
                </h3>
                <p className="text-xs text-gray-500">
                  Share these login credentials with {newCredentials.name}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 space-y-3">
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-mono">
                  Username
                </span>
                <span className="text-sm font-bold text-black font-mono">
                  {newCredentials.username}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block uppercase font-mono">
                  Temporary Password
                </span>
                <span className="text-sm font-bold text-black font-mono">
                  {newCredentials.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    `Staff Portal Credentials:\nUsername: ${newCredentials.username}\nPassword: ${newCredentials.temporaryPassword}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black text-xs font-semibold rounded-md border border-gray-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Credentials
                  </>
                )}
              </button>

              <button
                onClick={() => setNewCredentials(null)}
                className="px-5 py-2 bg-gray-300 hover:bg-[#C5B5A9] text-black  text-xs font-bold rounded-md transition "
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <HrdEditEmployee
        isOpen={!!selectedEmployee}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onSubmit={handleUpdateEmployee}
        formError={formError}
        formSubmitting={formSubmitting}
        editForm={editForm}
        setEditForm={setEditForm}
      />

      <HrdAttendanceDetailView
        attendance={detailAttendance}
        onClose={() => setDetailAttendance(null)}
        onPhotoClick={setSelectedPhoto}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photoPath={selectedPhoto}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

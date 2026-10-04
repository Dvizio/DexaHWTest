import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { PhotoModal } from '../components/PhotoModal';
import { apiClient, getPhotoUrl } from '../api/client';
import type {
  Employee,
  Attendance,
  PaginatedResponse,
  EmployeeStatus,
} from '../types';
import {
  Users,
  ClipboardList,
  Plus,
  Search,
  Edit2,
  Power,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Copy,
  Check,
  Mail,
  Phone,
  Key,
} from 'lucide-react';
import axios from 'axios';

export const HrdDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendances'>('employees');

  // --- Employee State ---
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

  // Modals for Employee
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newCredentials, setNewCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    name: string;
  } | null>(null);

  // Form states
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

  // --- Attendance State ---
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

  // Detail & Photo Modals
  const [detailAttendance, setDetailAttendance] = useState<Attendance | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // General Notification Alert
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fetch Employees List
  const fetchEmployees = useCallback(
    async (page = empPagination.page) => {
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
          setEmpPagination({
            page: res.data.meta.page,
            limit: res.data.meta.limit,
            total: res.data.meta.total,
            totalPages: res.data.meta.totalPages || 1,
          });
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
      } finally {
        setLoadingEmployees(false);
      }
    },
    [empSearch, empStatusFilter, empPagination.limit, empPagination.page]
  );

  // Fetch Company Attendances List
  const fetchAttendances = useCallback(
    async (page = attPagination.page) => {
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
          setAttPagination({
            page: res.data.meta.page,
            limit: res.data.meta.limit,
            total: res.data.meta.total,
            totalPages: res.data.meta.totalPages || 1,
          });
        }
      } catch (err) {
        console.error('Failed to fetch attendances', err);
      } finally {
        setLoadingAttendances(false);
      }
    },
    [attStartDate, attEndDate, attStatusFilter, attEmployeeName, attPagination.limit, attPagination.page]
  );

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees(1);
    } else {
      fetchAttendances(1);
    }
  }, [activeTab, empSearch, empStatusFilter, attStartDate, attEndDate, attStatusFilter, attEmployeeName]);

  // Handle Create Employee
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const payload: any = {
        employee_number: createForm.employee_number.trim(),
        name: createForm.name.trim(),
        email: createForm.email.trim(),
      };
      if (createForm.phone.trim()) payload.phone = createForm.phone.trim();
      if (createForm.department.trim()) payload.department = createForm.department.trim();
      if (createForm.position.trim()) payload.position = createForm.position.trim();

      const res = await apiClient.post<{
        employee: Employee;
        user: any;
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

      // Show credentials modal
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

  // Open Edit Modal
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
    setIsEditOpen(true);
  };

  // Handle Update Employee
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

      setIsEditOpen(false);
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

  // Toggle Employee Active Status
  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus: EmployeeStatus =
      emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const confirmMsg =
      nextStatus === 'INACTIVE'
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

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pb-12">
      <Navbar title="HRD Portal" subtitle="Staff Management & Attendance Monitoring" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {/* Global Notification */}
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

        {/* Top Navigation Tabs */}
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
            onClick={() => {
              setPasswordError(null);
              setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
              setIsPasswordModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold bg-gray-50 text-black hover: hover:bg-gray-300/40 border border-gray-200 transition cursor-pointer"
          >
            <Key className="w-4 h-4 text-black" />
            Change Password
          </button>
        </div>

        {/* TAB 1: EMPLOYEE MANAGEMENT */}
        {activeTab === 'employees' && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6  space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <Users className="w-4 h-4 text-black" />
                  Employees Directory
                </h3>
                <p className="text-xs text-gray-500">
                  Manage registered company employees and their account access
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="bg-white border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black w-44 sm:w-56 transition"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={empStatusFilter}
                  onChange={(e) => setEmpStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-black focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                {/* Create Employee Button */}
                <button
                  onClick={() => {
                    setFormError(null);
                    setIsCreateOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-300 hover:bg-[#C5B5A9] text-black  rounded-md text-xs font-bold  transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Emp No</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Department & Position</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingEmployees ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Loading employees...</span>
                        </div>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No employees found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-300/40/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-black">
                          {emp.employee_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-black">
                          {emp.name}
                        </td>
                        <td className="py-3 px-4 text-black">
                          <div>{emp.department || '-'}</div>
                          <div className="text-[11px] text-gray-500">
                            {emp.position || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-black space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span>{emp.email}</span>
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <span>{emp.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${emp.status === 'ACTIVE'
                              ? 'bg-gray-50 text-black border border-gray-200'
                              : 'bg-gray-50 text-black border border-gray-200'
                              }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              title="Edit Employee"
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-300/40 rounded-md transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(emp)}
                              title={
                                emp.status === 'ACTIVE'
                                  ? 'Deactivate Account'
                                  : 'Activate Account'
                              }
                              className={`p-1.5 rounded-md transition ${emp.status === 'ACTIVE'
                                ? 'text-gray-500 hover:text-black hover:bg-gray-50'
                                : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {empPagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <span>
                  Showing page <strong className="text-black">{empPagination.page}</strong> of{' '}
                  <strong className="text-black">{empPagination.totalPages}</strong> (
                  {empPagination.total} employees)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchEmployees(empPagination.page - 1)}
                    disabled={empPagination.page <= 1 || loadingEmployees}
                    className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchEmployees(empPagination.page + 1)}
                    disabled={
                      empPagination.page >= empPagination.totalPages || loadingEmployees
                    }
                    className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDANCE MONITORING */}
        {activeTab === 'attendances' && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-6  space-y-4">
            {/* Header & Filter Bar */}
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

              {/* Filters */}
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

            {/* Attendance Table */}
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
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${att.status === 'PRESENT'
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
                                onClick={() => setSelectedPhoto(att.check_in_photo)}
                                className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                              >
                                In
                              </button>
                            )}
                            {att.check_out_photo && (
                              <button
                                onClick={() => setSelectedPhoto(att.check_out_photo || null)}
                                className="px-2 py-1 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded text-[11px] font-medium border border-gray-200 transition"
                              >
                                Out
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDetailAttendance(att)}
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

            {/* Pagination Controls */}
            {attPagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <span>
                  Showing page <strong className="text-black">{attPagination.page}</strong> of{' '}
                  <strong className="text-black">{attPagination.totalPages}</strong> (
                  {attPagination.total} total records)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAttendances(attPagination.page - 1)}
                    disabled={attPagination.page <= 1 || loadingAttendances}
                    className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchAttendances(attPagination.page + 1)}
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
        )}
      </main>

      {/* MODAL 1: CREATE EMPLOYEE */}
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

      {/* MODAL 2: AUTO-GENERATED CREDENTIALS REVEAL */}
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

      {/* MODAL 3: EDIT EMPLOYEE */}
      {isEditOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-lg rounded-md  overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-black" />
                Edit Employee ({selectedEmployee.employee_number})
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-500 hover:text-black p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-black text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-black">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-black">Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) =>
                      setEditForm({ ...editForm, position: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ATTENDANCE DETAIL VIEW */}
      {detailAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-2xl rounded-md  overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <div>
                <h3 className="text-base font-bold text-black flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-black" />
                  Attendance Detail Log
                </h3>
                <p className="text-xs text-gray-500">
                  Date: {formatDate(detailAttendance.attendance_date)}
                </p>
              </div>
              <button
                onClick={() => setDetailAttendance(null)}
                className="text-gray-500 hover:text-black p-1.5 rounded-md hover:bg-gray-300/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Employee Summary Card */}
              <div className="bg-white p-4 rounded-md border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-black">
                    {detailAttendance.employee?.name || `Employee #${detailAttendance.employee_id}`}
                  </h4>
                  <p className="text-xs text-black font-mono">
                    {detailAttendance.employee?.employee_number} &bull;{' '}
                    {detailAttendance.employee?.department || 'No Department'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold ${detailAttendance.status === 'PRESENT'
                    ? 'bg-gray-50 text-black border border-gray-200'
                    : 'bg-gray-50 text-black border border-gray-200'
                    }`}
                >
                  {detailAttendance.status}
                </span>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check-In Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-black block">
                    Check-In Photo (at {formatTime(detailAttendance.check_in_at)})
                  </span>
                  <div className="aspect-[4/3] bg-white rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                    {detailAttendance.check_in_photo ? (
                      <img
                        src={getPhotoUrl(detailAttendance.check_in_photo)}
                        alt="Check-In Selfie"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedPhoto(detailAttendance.check_in_photo)}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">No Photo</span>
                    )}
                  </div>
                </div>

                {/* Check-Out Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-black block">
                    Check-Out Photo (at {formatTime(detailAttendance.check_out_at)})
                  </span>
                  <div className="aspect-[4/3] bg-white rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                    {detailAttendance.check_out_photo ? (
                      <img
                        src={getPhotoUrl(detailAttendance.check_out_photo)}
                        alt="Check-Out Selfie"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedPhoto(detailAttendance.check_out_photo || null)}
                      />
                    ) : (
                      <span className="text-xs text-gray-500">Not Checked Out Yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinates & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3 rounded-md border border-gray-200 space-y-1">
                  <span className="text-gray-500 font-medium block">GPS Location</span>
                  <a
                    href={`https://maps.google.com/?q=${detailAttendance.check_in_latitude},${detailAttendance.check_in_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-black hover:underline font-mono"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Lat: {detailAttendance.check_in_latitude}, Lng:{' '}
                    {detailAttendance.check_in_longitude}
                  </a>
                </div>

                <div className="bg-white p-3 rounded-md border border-gray-200 space-y-1">
                  <span className="text-gray-500 font-medium block">Staff Notes</span>
                  <p className="text-black italic">
                    {detailAttendance.notes ? `"${detailAttendance.notes}"` : 'No notes submitted'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50/80 text-right">
              <button
                onClick={() => setDetailAttendance(null)}
                className="px-5 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black text-xs font-semibold rounded-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photoPath={selectedPhoto}
      />

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 w-full max-w-sm rounded-md  p-6 relative">
            <h3 className="text-base font-bold text-black mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-black" />
              Change Password
            </h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-black flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                <span>{passwordError}</span>
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
                setNotification({ type: 'success', message: 'Password updated successfully!' });
                setIsPasswordModalOpen(false);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
              } catch (err: unknown) {
                setPasswordError(axios.isAxiosError(err) ? err.response?.data?.message || 'Failed to change password' : 'Failed to change password');
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
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError(null);
                  }}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-gray-300/40 hover:bg-[#C5B5A9] text-black rounded-md text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-[#C5B5A9] text-black disabled:opacity-60  rounded-md text-xs font-semibold transition"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};







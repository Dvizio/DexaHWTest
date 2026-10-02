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
} from 'lucide-react';

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
  const [attEmployeeId, setAttEmployeeId] = useState<string>('');
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

  // Fetch Employees List
  const fetchEmployees = useCallback(
    async (page = empPagination.page) => {
      setLoadingEmployees(true);
      try {
        const params: any = {
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
        const params: any = {
          page,
          limit: attPagination.limit,
        };
        if (attStartDate) params.startDate = attStartDate;
        if (attEndDate) params.endDate = attEndDate;
        if (attStatusFilter && attStatusFilter !== 'ALL') params.status = attStatusFilter;
        if (attEmployeeId.trim()) params.employeeId = parseInt(attEmployeeId.trim(), 10);

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
    [attStartDate, attEndDate, attStatusFilter, attEmployeeId, attPagination.limit, attPagination.page]
  );

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees(1);
    } else {
      fetchAttendances(1);
    }
  }, [activeTab, empSearch, empStatusFilter, attStartDate, attEndDate, attStatusFilter, attEmployeeId]);

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
    } catch (err: any) {
      console.error('Create employee error', err);
      const msg =
        err.response?.data?.message || 'Failed to create employee';
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
    } catch (err: any) {
      console.error('Update employee error', err);
      const msg = err.response?.data?.message || 'Failed to update employee';
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
    } catch (err: any) {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      <Navbar title="HRD Portal" subtitle="Staff Management & Attendance Monitoring" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        {/* Global Notification */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
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
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('employees')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Employee Management
          </button>

          <button
            onClick={() => setActiveTab('attendances')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
              activeTab === 'attendances'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Attendance Monitoring
          </button>
        </div>

        {/* TAB 1: EMPLOYEE MANAGEMENT */}
        {activeTab === 'employees' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Employees Directory
                </h3>
                <p className="text-xs text-slate-400">
                  Manage registered company employees and their account access
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-56 transition"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={empStatusFilter}
                  onChange={(e) => setEmpStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Emp No</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Department & Position</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingEmployees ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Loading employees...</span>
                        </div>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No employees found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-blue-400">
                          {emp.employee_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-100">
                          {emp.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{emp.department || '-'}</div>
                          <div className="text-[11px] text-slate-400">
                            {emp.position || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{emp.email}</span>
                          </div>
                          {emp.phone && (
                            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{emp.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
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
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
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
                              className={`p-1.5 rounded-lg transition ${
                                emp.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
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
              <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
                <span>
                  Showing page <strong className="text-slate-200">{empPagination.page}</strong> of{' '}
                  <strong className="text-slate-200">{empPagination.totalPages}</strong> (
                  {empPagination.total} employees)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchEmployees(empPagination.page - 1)}
                    disabled={empPagination.page <= 1 || loadingEmployees}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchEmployees(empPagination.page + 1)}
                    disabled={
                      empPagination.page >= empPagination.totalPages || loadingEmployees
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Header & Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  Company Attendance Logs
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect daily remote staff check-ins, lateness statuses, and selfie verifications
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                  <span className="text-slate-400">From:</span>
                  <input
                    type="date"
                    value={attStartDate}
                    onChange={(e) => setAttStartDate(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                  <span className="text-slate-400">To:</span>
                  <input
                    type="date"
                    value={attEndDate}
                    onChange={(e) => setAttEndDate(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Filter by Emp ID..."
                  value={attEmployeeId}
                  onChange={(e) => setAttEmployeeId(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-32"
                />

                <select
                  value={attStatusFilter}
                  onChange={(e) => setAttStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                </select>

                {(attStartDate || attEndDate || attStatusFilter !== 'ALL' || attEmployeeId) && (
                  <button
                    onClick={() => {
                      setAttStartDate('');
                      setAttEndDate('');
                      setAttStatusFilter('ALL');
                      setAttEmployeeId('');
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">GPS Location</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center">Selfie Photos</th>
                    <th className="py-3 px-4 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingAttendances ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Loading company attendance logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : attendances.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No attendance records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((att) => (
                      <tr
                        key={att.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                          {formatDate(att.attendance_date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100">
                            {att.employee?.name || `Emp #${att.employee_id}`}
                          </div>
                          <div className="text-[11px] text-blue-400 font-mono">
                            {att.employee?.employee_number}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {formatTime(att.check_in_at)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {formatTime(att.check_out_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'PRESENT'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          <a
                            href={`https://maps.google.com/?q=${att.check_in_latitude},${att.check_in_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                          >
                            <MapPin className="w-3 h-3" />
                            {att.check_in_latitude?.toFixed(4)},{' '}
                            {att.check_in_longitude?.toFixed(4)}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                          {att.notes || <span className="text-slate-500 italic">None</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {att.check_in_photo && (
                              <button
                                onClick={() => setSelectedPhoto(att.check_in_photo)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[11px] font-medium border border-slate-700 transition"
                              >
                                In
                              </button>
                            )}
                            {att.check_out_photo && (
                              <button
                                onClick={() => setSelectedPhoto(att.check_out_photo || null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded text-[11px] font-medium border border-slate-700 transition"
                              >
                                Out
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDetailAttendance(att)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
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
              <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
                <span>
                  Showing page <strong className="text-slate-200">{attPagination.page}</strong> of{' '}
                  <strong className="text-slate-200">{attPagination.totalPages}</strong> (
                  {attPagination.total} total records)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAttendances(attPagination.page - 1)}
                    disabled={attPagination.page <= 1 || loadingAttendances}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchAttendances(attPagination.page + 1)}
                    disabled={
                      attPagination.page >= attPagination.totalPages || loadingAttendances
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Register New Employee
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-500">
                  Username will be automatically created as: {createForm.email ? createForm.email.split('@')[0] : '...'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={createForm.department}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, department: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Position</label>
                  <input
                    type="text"
                    placeholder="Software Eng"
                    value={createForm.position}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, position: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Employee Account Created!
                </h3>
                <p className="text-xs text-slate-400">
                  Share these login credentials with {newCredentials.name}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-mono">
                  Username
                </span>
                <span className="text-sm font-bold text-blue-400 font-mono">
                  {newCredentials.username}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-mono">
                  Temporary Password
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT EMPLOYEE */}
      {isEditOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Edit Employee ({selectedEmployee.employee_number})
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Position</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) =>
                      setEditForm({ ...editForm, position: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  Attendance Detail Log
                </h3>
                <p className="text-xs text-slate-400">
                  Date: {formatDate(detailAttendance.attendance_date)}
                </p>
              </div>
              <button
                onClick={() => setDetailAttendance(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Employee Summary Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {detailAttendance.employee?.name || `Employee #${detailAttendance.employee_id}`}
                  </h4>
                  <p className="text-xs text-blue-400 font-mono">
                    {detailAttendance.employee?.employee_number} &bull;{' '}
                    {detailAttendance.employee?.department || 'No Department'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    detailAttendance.status === 'PRESENT'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {detailAttendance.status}
                </span>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check-In Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Check-In Photo (at {formatTime(detailAttendance.check_in_at)})
                  </span>
                  <div className="aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    {detailAttendance.check_in_photo ? (
                      <img
                        src={getPhotoUrl(detailAttendance.check_in_photo)}
                        alt="Check-In Selfie"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedPhoto(detailAttendance.check_in_photo)}
                      />
                    ) : (
                      <span className="text-xs text-slate-500">No Photo</span>
                    )}
                  </div>
                </div>

                {/* Check-Out Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Check-Out Photo (at {formatTime(detailAttendance.check_out_at)})
                  </span>
                  <div className="aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    {detailAttendance.check_out_photo ? (
                      <img
                        src={getPhotoUrl(detailAttendance.check_out_photo)}
                        alt="Check-Out Selfie"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedPhoto(detailAttendance.check_out_photo || null)}
                      />
                    ) : (
                      <span className="text-xs text-slate-500">Not Checked Out Yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinates & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium block">GPS Location</span>
                  <a
                    href={`https://maps.google.com/?q=${detailAttendance.check_in_latitude},${detailAttendance.check_in_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:underline font-mono"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Lat: {detailAttendance.check_in_latitude}, Lng:{' '}
                    {detailAttendance.check_in_longitude}
                  </a>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium block">Staff Notes</span>
                  <p className="text-slate-200 italic">
                    {detailAttendance.notes ? `"${detailAttendance.notes}"` : 'No notes submitted'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/80 text-right">
              <button
                onClick={() => setDetailAttendance(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
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
    </div>
  );
};

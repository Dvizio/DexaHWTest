import React from 'react';
import type { Employee } from '../types';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Power,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  empSearch: string;
  setEmpSearch: (value: string) => void;
  empStatusFilter: string;
  setEmpStatusFilter: (value: string) => void;
  empPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadingEmployees: boolean;
  onCreateClick: () => void;
  onEditClick: (emp: Employee) => void;
  onToggleStatus: (emp: Employee) => void;
  onPageChange: (page: number) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  empSearch,
  setEmpSearch,
  empStatusFilter,
  setEmpStatusFilter,
  empPagination,
  loadingEmployees,
  onCreateClick,
  onEditClick,
  onToggleStatus,
  onPageChange,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-6  space-y-4">
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

          <select
            value={empStatusFilter}
            onChange={(e) => setEmpStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-black focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-300 hover:bg-[#C5B5A9] text-black  rounded-md text-xs font-bold  transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

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
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        emp.status === 'ACTIVE'
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
                        onClick={() => onEditClick(emp)}
                        title="Edit Employee"
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-300/40 rounded-md transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleStatus(emp)}
                        title={
                          emp.status === 'ACTIVE'
                            ? 'Deactivate Account'
                            : 'Activate Account'
                        }
                        className={`p-1.5 rounded-md transition ${
                          emp.status === 'ACTIVE'
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

      {empPagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
          <span>
            Showing page <strong className="text-black">{empPagination.page}</strong> of{' '}
            <strong className="text-black">{empPagination.totalPages}</strong> (
            {empPagination.total} employees)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(empPagination.page - 1)}
              disabled={empPagination.page <= 1 || loadingEmployees}
              className="p-1.5 rounded-md bg-gray-300/40 hover:bg-[#C5B5A9] disabled:opacity-40 disabled:cursor-not-allowed text-black transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(empPagination.page + 1)}
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
  );
};

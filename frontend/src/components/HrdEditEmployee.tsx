import React from 'react';
import type { Employee } from '../types';
import { Edit2, X, AlertCircle, Loader2 } from 'lucide-react';

interface HrdEditEmployeeProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  formSubmitting: boolean;
  editForm: {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      phone: string;
      department: string;
      position: string;
    }>
  >;
}

export const HrdEditEmployee: React.FC<HrdEditEmployeeProps> = ({
  isOpen,
  employee,
  onClose,
  onSubmit,
  formError,
  formSubmitting,
  editForm,
  setEditForm,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-fadeIn">
      <div className="bg-gray-50 border border-gray-200 w-full max-w-lg rounded-md  overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <h3 className="text-base font-bold text-black flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-black" />
            Edit Employee ({employee.employee_number})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
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
              onClick={onClose}
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
  );
};

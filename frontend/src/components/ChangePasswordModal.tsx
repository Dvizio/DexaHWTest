import React from 'react';
import { apiClient } from '../api/client';
import { Key, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = React.useState<boolean>(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
      onSuccess('Password updated successfully!');
      onClose();
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      setPasswordError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to change password'
          : 'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPasswordError(null);
  };

  if (!isOpen) return null;

  return (
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

        <form onSubmit={handleSubmit}>
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
              onClick={handleClose}
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
  );
};

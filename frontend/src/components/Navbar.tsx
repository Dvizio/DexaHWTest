import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck, Clock } from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Staff Attendance',
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-400 font-normal">{subtitle}</p>
              )}
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-800 border border-slate-700/60 rounded-md py-1 px-3">
                <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-300">
                  {user.role === 'HRD' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">
                    {user.username}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    user.role === 'HRD'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600/20 border border-slate-700 hover:border-red-500/40 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

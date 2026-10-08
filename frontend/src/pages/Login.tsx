import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { AuthResponse } from '../types';
import { Clock, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

export const Login: React.FC = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to proper dashboard
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'HRD' ? '/hrd' : '/employee'} replace />;
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        username: username.trim(),
        password: password
      });

      login(response.data);

      if (response.data.user.role === 'HRD') {
        navigate('/hrd');
      } else {
        navigate('/employee');
      }
    } catch (err: unknown) {
      console.error('Login error', err);

      const serverMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Invalid username or password'
        : 'An unexpected error occurred';

      setError(
        Array.isArray(serverMessage) ? serverMessage[0] : serverMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-black text-white mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Staff Attendance
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Work-From-Home & Remote Staff Attendance Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-50 border border-gray-300 rounded-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-gray-200 border border-black rounded-md p-3 flex items-start gap-2.5 text-black text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-black uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  disabled={loading}
                  autoComplete="username"
                  className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-black uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full bg-white border border-gray-300 rounded-md pl-9 pr-10 py-2 text-xs text-black placeholder-gray-400 focus:outline-none focus:border-black transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Fill Demo Helper */}
          <div className="mt-5 pt-4 border-t border-gray-300 text-center">
            <p className="text-[11px] text-gray-600 mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Default Seed Account:
            </p>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'Admin123!')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-100 text-black text-xs rounded-md border border-gray-300 transition"
            >
              Fill Admin (admin / Admin123!)
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; 2023 Dexa Employee Management. All rights reserved.
        </p>
      </div>
    </div>
  );
};

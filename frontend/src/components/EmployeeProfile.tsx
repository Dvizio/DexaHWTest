import React from 'react';
import type { Employee } from '../types';

interface EmployeeProfileProps {
    profile: Employee | null;
    loadingProfile: boolean;
    setIsPasswordModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
    profile,
    loadingProfile,
    setIsPasswordModalOpen,
}) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 relative overflow-hidden flex flex-col justify-between">
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
                        <h2 className="text-xl font-bold text-black">
                            {profile?.name}
                        </h2>

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
                                <span className="font-medium text-black">
                                    {profile?.email}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium text-black">
                                    {profile?.phone || '-'}
                                </span>
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
    );
};
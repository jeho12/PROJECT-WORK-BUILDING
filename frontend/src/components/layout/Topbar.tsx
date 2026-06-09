'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { Menu, Bell, User, LogOut } from 'lucide-react';

export default function Topbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { user, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive title from pathname
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Welcome';
    
    // Check role sub-routes
    const primary = parts[1];
    if (!primary) return 'Dashboard';

    switch (primary) {
      case 'profile': return 'My Profile';
      case 'logbook': return 'SIWES Logbook';
      case 'attendance': return 'Daily Attendance Tracker';
      case 'supervision': return 'Online Supervision Room';
      case 'students': return parts[2] ? 'Student Details' : 'Assigned Students';
      case 'ai-reviews': return 'AI Performance Summaries';
      case 'sessions': return 'Supervision Schedules';
      case 'supervisors': return 'Manage Supervisors';
      case 'assignments': return 'Student Allocation Board';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-surface border-b border-border-custom px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Mobile Hamburguer & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-text-secondary hover:bg-slate-100 hover:text-text-primary rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg text-text-primary md:ml-0">
          {getPageTitle()}
        </span>
      </div>

      {/* Header actions */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
          >
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full text-xs font-bold uppercase shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-primary line-clamp-1">{user?.name}</span>
              <span className="text-[10px] text-text-secondary capitalize leading-none">{role}</span>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border-custom rounded-xl shadow-lg z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-border-custom">
                  <p className="text-xs text-text-secondary">Logged in as</p>
                  <p className="text-xs font-semibold text-text-primary truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-all gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

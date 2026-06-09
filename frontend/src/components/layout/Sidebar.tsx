'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { 
  LayoutDashboard, 
  UserCircle, 
  BookOpen, 
  MapPin, 
  Video, 
  Users, 
  BrainCircuit, 
  UserCheck, 
  CalendarRange,
  LogOut,
  Building
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role, logout, user } = useAuth();
  const { setSidebarOpen } = useUIStore();

  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
          { label: 'My Profile', href: '/student/profile', icon: UserCircle },
          { label: 'Logbook', href: '/student/logbook', icon: BookOpen },
          { label: 'Attendance', href: '/student/attendance', icon: MapPin },
          { label: 'Supervision Sessions', href: '/student/supervision', icon: Video },
        ];
      case 'supervisor':
        return [
          { label: 'Dashboard', href: '/supervisor', icon: LayoutDashboard },
          { label: 'My Students', href: '/supervisor/students', icon: Users },
          { label: 'AI Reviews', href: '/supervisor/ai-reviews', icon: BrainCircuit },
          { label: 'Sessions', href: '/supervisor/sessions', icon: CalendarRange },
        ];
      case 'admin':
        return [
          { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { label: 'Supervisors', href: '/admin/supervisors', icon: UserCheck },
          { label: 'Students', href: '/admin/students', icon: Users },
          { label: 'Assignments', href: '/admin/assignments', icon: LinkIcon },
        ];
      default:
        return [];
    }
  };

  // Helper link icon for assignments link in admin sidebar
  function LinkIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className}
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  }

  const links = getLinks();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-text flex flex-col h-full border-r border-slate-800">
      {/* Brand logo header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/20">
        <Building className="w-6 h-6 text-primary-light mr-3" />
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white tracking-wider">AUL SIWES PORTAL</span>
          <span className="text-[10px] text-slate-400">Anchor University, Lagos</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 gap-3 ${
                isActive
                  ? 'bg-primary/10 text-white border-l-4 border-primary-light pl-3'
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-light' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Student profile banner / Logout section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/10 flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-light/10 border border-slate-700 flex items-center justify-center rounded-full text-white font-bold uppercase text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/30 border border-rose-900/30 hover:border-rose-900 rounded-lg transition-all gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

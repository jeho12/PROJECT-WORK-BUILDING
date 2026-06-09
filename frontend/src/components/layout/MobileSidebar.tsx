'use client';

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';

export default function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar drawer content */}
      <div className="relative flex flex-col w-64 max-w-xs bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar inner list */}
        <div className="h-full flex flex-col">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

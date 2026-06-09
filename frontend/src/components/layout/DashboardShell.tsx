'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileSidebar from './MobileSidebar';
import Chatbot from './Chatbot';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Container */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}


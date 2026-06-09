import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border-custom rounded-2xl shadow-md p-8">
        {children}
      </div>
    </div>
  );
}

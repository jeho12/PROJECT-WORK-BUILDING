'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isProfilePage = pathname === '/student/profile';
  const isIncomplete = user?.role === 'student' && user?.profileComplete === false;

  useEffect(() => {
    if (isIncomplete && !isProfilePage) {
      router.replace('/student/profile');
    }
  }, [isIncomplete, isProfilePage, router]);

  return (
    <div className="flex flex-col space-y-4">
      {isIncomplete && (
        <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-pulse">
          <span className="text-xs sm:text-sm font-semibold">
            ⚠️ Complete your SIWES profile to unlock logbook submission and weekly reports.
          </span>
          {!isProfilePage && (
            <Link 
              href="/student/profile" 
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
            >
              Configure Profile
            </Link>
          )}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

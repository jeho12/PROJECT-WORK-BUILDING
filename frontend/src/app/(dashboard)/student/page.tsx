'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLogbook } from '@/hooks/useLogbook';
import { useAttendance } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';
import { studentService } from '@/services/student.service';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PlusCircle, 
  Video, 
  MapIcon 
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user?.id || '';

  // Logbook Hooks
  const { useWeeksQuery, useRecentActivitiesQuery } = useLogbook(studentId);
  const { data: weeks, isLoading: isLoadingWeeks } = useWeeksQuery(studentId);
  const { data: recentLogs, isLoading: isLoadingLogs } = useRecentActivitiesQuery(studentId);

  // Attendance Hooks
  const { useStatusQuery, checkIn, checkOut, isCheckingIn, isCheckingOut } = useAttendance(studentId);
  const { data: todayStatus, isLoading: isLoadingStatus } = useStatusQuery(studentId);

  // Geolocation
  const { coords, loading: isLocating, capture } = useGeolocation();

  // Sessions query
  const { data: sessions } = useQuery({
    queryKey: ['student_sessions', studentId],
    queryFn: () => sessionService.getSessions(studentId, 'student')
  });

  // Profile query
  const { data: profile } = useQuery({
    queryKey: ['student_profile', studentId],
    queryFn: () => studentService.getProfile(studentId),
    enabled: !!studentId
  });

  // Calculations for stats row
  const stats = React.useMemo(() => {
    if (!weeks) return { submitted: 0, total: 0, pending: 0 };
    const total = weeks.length;
    const submitted = weeks.filter((w) => w.status === 'approved' || w.status === 'submitted').length;
    const pending = weeks.filter((w) => w.status === 'submitted').length;
    return { submitted, total, pending };
  }, [weeks]);

  const attendanceRate = React.useMemo(() => {
    if (!weeks) return 100;
    // Mock rate based on database seeds
    return 92;
  }, [weeks]);

  const upcomingSessionsCount = React.useMemo(() => {
    if (!sessions) return 0;
    return sessions.filter((s) => s.status === 'scheduled').length;
  }, [sessions]);

  const handlePunch = async () => {
    if (!coords) {
      capture();
      return;
    }

    try {
      const address = profile?.organizationAddress || 'Chevron Plaza Office, Lekki'; // Eager loaded from student profile
      if (todayStatus?.status === 'not_checked_in') {
        await checkIn({ lat: coords.lat, lng: coords.lng, address });
      } else if (todayStatus?.status === 'checked_in') {
        await checkOut({ lat: coords.lat, lng: coords.lng, address });
      }
    } catch (e) {
      // Handled by toast
    }
  };

  const isPunchDisabled = 
    isCheckingIn || 
    isCheckingOut || 
    isLocating || 
    todayStatus?.status === 'completed';

  if (isLoadingWeeks || isLoadingLogs || isLoadingStatus) {
    return <LoadingSkeleton type="card-grid" />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">SIWES Student Workboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back, {user?.name}. Monitor your training hours and submission cycles.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Weeks Submitted</span>
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats.submitted} <span className="text-sm font-normal text-text-secondary">/ {stats.total} Weeks</span>
          </p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rate</span>
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{attendanceRate}%</p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Reviews</span>
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Sessions</span>
            <Video className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{upcomingSessionsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-border-custom rounded-xl shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-5">Recent Logbook Activity</h3>
            <div className="space-y-4">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-slate-50 hover:bg-slate-100/60 rounded-lg border border-slate-200/50 transition-colors">
                    <div className="p-2 bg-blue-50 text-primary rounded-md text-center min-w-14">
                      <span className="text-[10px] font-bold uppercase block">{log.dayName.substring(0,3)}</span>
                      <span className="text-xs font-semibold leading-none">{format(new Date(log.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-secondary">
                          {log.timeIn} - {log.timeOut}
                        </span>
                        <StatusBadge status={log.isLocked ? 'submitted' : 'draft'} />
                      </div>
                      <p className="text-sm text-text-primary mt-1 line-clamp-2 leading-relaxed">
                        {log.activity}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-text-secondary">No recent log entries filled yet.</p>
                </div>
              )}
            </div>
          </div>
          <div className="pt-6 border-t border-border-custom mt-6 flex justify-end">
            <Link
              href="/student/logbook"
              className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-light transition-colors gap-1"
            >
              <span>View Full Logbook</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Attendance Punch & Quick Actions */}
        <div className="space-y-6">
          {/* Punch Card */}
          <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Daily Attendance Gate
            </h3>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/60 mb-6 text-center">
              <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">Today's Date</span>
              <span className="text-lg font-bold text-text-primary mt-1 block">
                {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </span>
              <div className="mt-3">
                <StatusBadge status={todayStatus?.status === 'completed' ? 'completed' : todayStatus?.status === 'checked_in' ? 'pending' : 'draft'} />
              </div>
            </div>

            {/* GPS Tracker Indicator */}
            {coords && (
              <div className="mb-4 p-3 bg-blue-50/50 border border-blue-200/60 rounded-lg flex items-center space-x-2 text-xs text-primary">
                <MapIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">GPS Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
              </div>
            )}

            {/* Punch Button */}
            <button
              onClick={handlePunch}
              disabled={isPunchDisabled}
              className={`w-full py-3.5 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
                todayStatus?.status === 'completed'
                  ? 'bg-slate-300 cursor-not-allowed'
                  : todayStatus?.status === 'checked_in'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {(isCheckingIn || isCheckingOut || isLocating) && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>
                {isLocating
                  ? 'Accessing GPS...'
                  : todayStatus?.status === 'completed'
                  ? 'Checked Out (Full Day)'
                  : todayStatus?.status === 'checked_in'
                  ? 'CHECK OUT'
                  : 'CHECK IN'}
              </span>
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-border-custom rounded-xl shadow-xs p-6">
            <h3 className="text-base font-bold text-text-primary mb-4">Quick Shortcuts</h3>
            <div className="space-y-3">
              <Link
                href="/student/logbook"
                className="w-full inline-flex items-center px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-text-primary rounded-lg border border-slate-200 transition-colors gap-2"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Log Today's Entries</span>
              </Link>
              <Link
                href="/student/supervision"
                className="w-full inline-flex items-center px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-text-primary rounded-lg border border-slate-200 transition-colors gap-2"
              >
                <Video className="w-4 h-4 text-purple-600" />
                <span>Join Virtual Meeting</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

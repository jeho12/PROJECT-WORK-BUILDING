'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import { useGeolocation } from '@/hooks/useGeolocation';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Calendar, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const rad = (deg: number) => deg * (Math.PI / 180);
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const studentId = user?.id || '';

  const { useHistoryQuery, useStatusQuery, checkIn, checkOut, isCheckingIn, isCheckingOut } = useAttendance(studentId);
  const { data: history, isLoading: isLoadingHistory } = useHistoryQuery(studentId);
  const { data: todayStatus, isLoading: isLoadingStatus } = useStatusQuery(studentId);

  const { coords, loading: isLocating, capture } = useGeolocation();
  const [addressResolved, setAddressResolved] = useState('');

  // Profile query
  const { data: profile } = useQuery({
    queryKey: ['student_profile', studentId],
    queryFn: () => studentService.getProfile(studentId),
    enabled: !!studentId
  });

  // Handle auto resolve address on coords capture
  useEffect(() => {
    if (coords) {
      setAddressResolved(profile?.organizationAddress || 'Chevron Corporate HQ Plaza, Lekki Peninsular, Lagos');
    }
  }, [coords, profile]);

  const handlePunch = async (type: 'in' | 'out') => {
    if (!coords) {
      toast.error('Please authorize GPS location to continue.');
      capture();
      return;
    }

    if (profile?.orgLatitude && profile?.orgLongitude) {
      const dist = getDistanceInMeters(coords.lat, coords.lng, profile.orgLatitude, profile.orgLongitude);
      if (dist > 500) {
        toast.error(`GPS Verification Failed: You are currently located ${Math.round(dist)}m away from your SIWES training placement. You must be within 500m to clock ${type}.`);
        return;
      }
    } else {
      toast.error('SIWES placement coordinates not configured. Please set them in My Profile first.');
      return;
    }

    try {
      if (type === 'in') {
        await checkIn({ lat: coords.lat, lng: coords.lng, address: addressResolved });
      } else {
        await checkOut({ lat: coords.lat, lng: coords.lng, address: addressResolved });
      }
    } catch (e) {}
  };

  if (isLoadingHistory || isLoadingStatus) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Columns for history DataTable
  const columns = [
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      cell: (row: any) => format(new Date(row.date), 'EEEE, MMM dd, yyyy')
    },
    {
      header: 'Check-In',
      accessorKey: 'checkInTime',
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-mono font-semibold">{row.checkInTime}</span>
          <span className="text-[10px] text-text-secondary truncate max-w-xs">{row.checkInAddress}</span>
        </div>
      )
    },
    {
      header: 'Check-Out',
      accessorKey: 'checkOutTime',
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-mono font-semibold">{row.checkOutTime || '--:--:--'}</span>
          {row.checkOutAddress && (
            <span className="text-[10px] text-text-secondary truncate max-w-xs">{row.checkOutAddress}</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Daily Attendance Registry</h1>
        <p className="text-sm text-text-secondary mt-1">
          Punch in and out of your placement daily to log your verified training hours.
        </p>
      </div>

      {/* Today's Punch Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-border-custom rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Active Session Portal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border-custom bg-slate-50/50 p-4 rounded-xl space-y-2 text-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Today's Date</span>
                <span className="text-base font-bold text-text-primary">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
                <div className="pt-2">
                  <StatusBadge 
                    status={
                      todayStatus?.status === 'completed' 
                        ? 'completed' 
                        : todayStatus?.status === 'checked_in' 
                        ? 'pending' 
                        : 'draft'
                    } 
                  />
                </div>
              </div>

              <div className="border border-border-custom bg-slate-50/50 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Location Status</span>
                {coords ? (
                  <div className="mt-1 space-y-1">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> GPS Locked
                    </span>
                    <span className="text-[10px] text-text-secondary line-clamp-1 max-w-xs">{addressResolved}</span>
                  </div>
                ) : (
                  <button 
                    onClick={capture}
                    disabled={isLocating}
                    className="mt-2 inline-flex items-center text-xs font-bold text-primary hover:text-primary-light transition-colors gap-1 focus:outline-none"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isLocating ? 'Locating...' : 'Authorize Location'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 border-t border-border-custom pt-6">
            <button
              onClick={() => handlePunch('in')}
              disabled={todayStatus?.status !== 'not_checked_in' || isCheckingIn || isLocating}
              className="w-full sm:w-1/2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              {isCheckingIn && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>CLOCK IN</span>
            </button>
            
            <button
              onClick={() => handlePunch('out')}
              disabled={todayStatus?.status !== 'checked_in' || isCheckingOut || isLocating}
              className="w-full sm:w-1/2 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none"
            >
              {isCheckingOut && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>CLOCK OUT</span>
            </button>
          </div>
        </div>

        {/* Static Map View box */}
        <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm flex flex-col justify-center space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <MapPin className="w-4.5 h-4.5 text-primary" /> Captured GPS Pin
          </h3>
          <div className="h-44 bg-slate-100 rounded-lg overflow-hidden border border-border-custom relative">
            {coords ? (
              <iframe 
                title="Student SIWES Placement Organization Google Map Location"
                width="100%" 
                height="100%" 
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0}
                className="pointer-events-none"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-secondary p-4 text-center">
                Waiting for coordinates lock. Please click 'CLOCK IN' or 'CLOCK OUT' to trigger.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary">Attendance History Logs</h3>
        {history ? (
          <DataTable 
            columns={columns} 
            data={history} 
            searchKey="date" 
            searchPlaceholder="Search by date (YYYY-MM-DD)..."
          />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary">
            No attendance history logged yet.
          </div>
        )}
      </div>
    </div>
  );
}

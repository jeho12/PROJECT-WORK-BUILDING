'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';
import { studentService } from '@/services/student.service';
import { useGeolocation } from '@/hooks/useGeolocation';
import JitsiFrame from '@/components/jitsi/JitsiFrame';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import DataTable from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import { Video, Calendar, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Distance calculation in meters using Haversine formula
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

export default function StudentSupervisionPage() {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const queryClient = useQueryClient();

  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [showLocationBlock, setShowLocationBlock] = useState(false);
  const [distanceCalculated, setDistanceCalculated] = useState<number | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const { coords, loading: isLocating, capture } = useGeolocation();

  // Queries
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['student_sessions', studentId],
    queryFn: () => sessionService.getSessions(studentId, 'student')
  });

  const handleJoinClick = async (session: any) => {
    setVerificationLoading(true);
    try {
      // 1. Capture current location
      if (!coords) {
        toast.error('Please authorize browser GPS coordinates access to verify your location.');
        capture();
        setVerificationLoading(false);
        return;
      }

      // 2. Call backend to verify location
      const verifyResult = await sessionService.verifyGPSLocation(session.id, coords.lat, coords.lng);
      setDistanceCalculated(verifyResult.distance_meters ?? null);

      if (verifyResult.verified) {
        // 3. Call backend to join session
        await sessionService.joinSession(session.id);
        toast.success('Location verified! Connecting to room...');
        setActiveSession(session);
      } else {
        setShowLocationBlock(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'GPS coordinate verification failed.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCloseSession = () => {
    if (activeSession) {
      queryClient.invalidateQueries({ queryKey: ['student_sessions', studentId] });
      toast.success('Supervision session completed.');
    }
    setActiveSession(null);
  };

  if (isLoadingSessions) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  const upcomingSessions = sessions?.filter((s) => s.status === 'scheduled') || [];
  const pastSessions = sessions?.filter((s) => s.status === 'completed' || s.status === 'cancelled') || [];

  // Table columns
  const columns = [
    {
      header: 'Session Title',
      accessorKey: 'title',
      sortable: true,
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary">{row.title}</span>
          <span className="text-[10px] text-text-secondary leading-relaxed">{row.description}</span>
        </div>
      )
    },
    {
      header: 'Supervisor',
      accessorKey: 'supervisorName'
    },
    {
      header: 'Scheduled Date/Time',
      accessorKey: 'scheduledAt',
      cell: (row: any) => format(new Date(row.scheduledAt), 'MMM dd, yyyy HH:mm')
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: (row: any) => `${row.duration} mins`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => {
        const colors = 
          row.status === 'completed' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${colors}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {activeSession && (
        <JitsiFrame 
          roomName={activeSession.roomName} 
          displayName={user?.name || 'Student'} 
          onClose={handleCloseSession} 
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Online Supervision Room</h1>
        <p className="text-sm text-text-secondary mt-1">
          Join scheduled video check-ins with your assigned academic supervisor.
        </p>
      </div>

      {/* Geolocation status bar */}
      <div className="bg-slate-50 border border-border-custom rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <Navigation className="w-5 h-5 text-primary shrink-0 animate-pulse" />
          <p className="text-text-primary leading-relaxed">
            {coords 
              ? `GPS Coordinates Verified: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`
              : 'GPS coordinate tracking is active. Lock location below before joining meetings.'
            }
          </p>
        </div>
        <button
          onClick={capture}
          disabled={isLocating}
          className="px-3.5 py-1.5 bg-white border border-border-custom rounded-lg font-bold hover:bg-slate-100 disabled:opacity-50 text-text-primary transition-all shrink-0 focus:outline-none"
        >
          {isLocating ? 'Locking GPS...' : 'Verify Location'}
        </button>
      </div>

      {/* Upcoming supervision roster */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary">Scheduled Supervision Meetings</h3>
        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingSessions.map((session) => {
              const dateObj = new Date(session.scheduledAt);
              const timeDiff = dateObj.getTime() - Date.now();
              const isJoinable = timeDiff <= 10 * 60 * 1000; // joinable within 10 mins

              return (
                <div key={session.id} className="bg-white border border-border-custom p-6 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                        Active Call Setup
                      </span>
                      <span className="text-xs text-text-secondary font-semibold font-mono">
                        {session.duration} minutes
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-text-primary">{session.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{session.description}</p>
                    
                    <div className="border-t border-slate-100 pt-3 text-xs space-y-1.5 text-text-secondary">
                      <div className="flex justify-between">
                        <span>Supervisor:</span>
                        <span className="font-semibold text-text-primary">{session.supervisorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Scheduled:</span>
                        <span className="font-semibold text-text-primary">{format(dateObj, 'EEEE, MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleJoinClick(session)}
                      disabled={verificationLoading}
                      className="px-4 py-2 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 focus:outline-none"
                    >
                      {verificationLoading && (
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      <Video className="w-4 h-4 shrink-0" />
                      <span>{verificationLoading ? 'Verifying coordinates...' : 'JOIN MEETING'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Video}
            title="No Scheduled Sessions"
            description="You do not have any upcoming supervision video meetings scheduled. Your academic supervisor will configure a date."
          />
        )}
      </div>

      {/* History table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary">Meeting Log History</h3>
        {pastSessions.length > 0 ? (
          <DataTable columns={columns} data={pastSessions} searchKey="title" searchPlaceholder="Search sessions..." />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-6 text-center text-text-secondary text-xs">
            No past video check-ins found.
          </div>
        )}
      </div>

      {/* Location Block Dialog */}
      {showLocationBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-border-custom rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-full">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-1">GPS Boundary Verification Failed</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    You are currently located{' '}
                    <span className="font-semibold text-rose-600 font-mono">
                      {distanceCalculated ? Math.round(distanceCalculated) : '---'} meters
                    </span>{' '}
                    away from your designated SIWES training placement.
                  </p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Under Anchor University supervision policy, you must check into the supervision meeting **from your physical organization location** (500m radius limit).
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-border-custom space-x-3">
              <button
                onClick={() => setShowLocationBlock(false)}
                className="px-4 py-2 text-xs font-bold text-text-primary bg-white border border-border-custom hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

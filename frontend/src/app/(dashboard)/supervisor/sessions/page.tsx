'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/hooks/useSupervisor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';
import JitsiFrame from '@/components/jitsi/JitsiFrame';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { format } from 'date-fns';
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisorSessionsPage() {
  const { user } = useAuth();
  const supervisorId = user?.id || '';
  const queryClient = useQueryClient();

  const { useStudentsQuery } = useSupervisor(supervisorId);
  const { data: students } = useStudentsQuery(supervisorId);

  // States
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [sessionToCancel, setSessionToCancel] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [isScheduling, setIsScheduling] = useState(false);

  // Sessions Query
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['supervisor_sessions', supervisorId],
    queryFn: () => sessionService.getSessions(supervisorId, 'supervisor')
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !title || !description || !scheduledAt) {
      toast.error('Please fill in all session details.');
      return;
    }

    setIsScheduling(true);
    try {
      await sessionService.createSession({
        studentId: selectedStudentId,
        title,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        supervisorId,
        supervisorName: user?.name || 'Supervisor'
      });

      queryClient.invalidateQueries({ queryKey: ['supervisor_sessions', supervisorId] });
      toast.success('Supervision session scheduled successfully! Invitation email sent.');
      
      // Reset
      setShowScheduleForm(false);
      setSelectedStudentId('');
      setTitle('');
      setDescription('');
      setScheduledAt('');
      setDuration(30);
    } catch (err) {
      toast.error('Failed to schedule session.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel) return;
    try {
      await sessionService.cancelSession(sessionToCancel.id);
      queryClient.invalidateQueries({ queryKey: ['supervisor_sessions', supervisorId] });
      toast.success('Session cancelled successfully.');
      setSessionToCancel(null);
    } catch (err) {
      toast.error('Failed to cancel session.');
    }
  };

  const handleJoinClick = async (session: any) => {
    try {
      await sessionService.joinSession(session.id);
      setActiveSession(session);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to join supervision room.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  const upcomingSessions = sessions?.filter((s) => s.status === 'scheduled') || [];
  const pastSessions = sessions?.filter((s) => s.status === 'completed' || s.status === 'cancelled') || [];

  return (
    <div className="space-y-8">
      {activeSession && (
        <JitsiFrame 
          roomName={activeSession.roomName} 
          displayName={user?.name || 'Supervisor'} 
          onClose={() => {
            queryClient.invalidateQueries({ queryKey: ['supervisor_sessions', supervisorId] });
            setActiveSession(null);
            toast.success('Supervision check-in complete.');
          }} 
        />
      )}

      <ConfirmModal
        isOpen={sessionToCancel !== null}
        title="Cancel Supervision Session"
        message="Are you sure you want to cancel this scheduled check-in meeting? An email notification will be sent to the student."
        confirmLabel="Cancel Session"
        isDanger={true}
        onConfirm={handleCancelSession}
        onCancel={() => setSessionToCancel(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-custom">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Supervision Sessions</h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure online consultations and launch Jitsi Meet video frames.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <form onSubmit={handleScheduleSubmit} className="bg-white border border-border-custom p-6 rounded-xl shadow-sm max-w-2xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-base font-bold text-text-primary border-b border-slate-100 pb-2">Schedule Consultation Room</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
              >
                <option value="">Select Student</option>
                {students?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Call Duration (Minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Session Title
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly SIWES Review Check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Consultation Agenda / Description
              </label>
              <textarea
                placeholder="Details about what topics will be evaluated during the video meeting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary leading-relaxed resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowScheduleForm(false)}
              className="px-4 py-2 text-xs font-bold text-text-primary bg-white border border-border-custom hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="inline-flex items-center justify-center px-5 py-2 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
            >
              {isScheduling && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>Schedule Session</span>
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      <div className="space-y-4">
        <div className="flex border-b border-border-custom bg-white p-1 rounded-xl shadow-xs border max-w-xs">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize focus:outline-none ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming Meetings' : 'Past Consultations'}
            </button>
          ))}
        </div>

        {activeTab === 'upcoming' ? (
          upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="bg-white border border-border-custom p-6 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                        Virtual Room Active
                      </span>
                      <span className="text-xs text-text-secondary font-mono font-semibold">
                        {session.duration} mins
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-text-primary">{session.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{session.description}</p>
                    
                    <div className="border-t border-slate-100 pt-3 text-xs space-y-1.5 text-text-secondary">
                      <div className="flex justify-between">
                        <span>Student:</span>
                        <span className="font-semibold text-text-primary">{session.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Date/Time:</span>
                        <span className="font-semibold text-text-primary">{format(new Date(session.scheduledAt), 'EEEE, MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      onClick={() => setSessionToCancel(session)}
                      className="p-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-all focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                      onClick={() => handleJoinClick(session)}
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-xs font-bold text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 focus:outline-none"
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      <span>LAUNCH JITSI ROOM</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary text-xs">
              No upcoming supervision consultations scheduled. Use button in header to schedule a check-in.
            </div>
          )
        ) : (
          pastSessions.length > 0 ? (
            <div className="bg-white border border-border-custom rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-border-custom">
                {pastSessions.map((session) => (
                  <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/40 transition-colors gap-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2 bg-slate-100 text-slate-400 rounded-lg shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{session.title}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">{session.description}</p>
                        <p className="text-[10px] text-text-secondary font-semibold mt-1.5">
                          Student: {session.studentName} | Duration: {session.duration} mins | Scheduled: {format(new Date(session.scheduledAt), 'yyyy-MM-dd HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${
                        session.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary text-xs">
              No historical supervision sessions found.
            </div>
          )
        )}
      </div>
    </div>
  );
}

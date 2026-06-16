'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLogbook } from '@/hooks/useLogbook';
import { DayEntry, WeeklyReport } from '@/types/logbook.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dailyEntrySchema, DailyEntryInput, weeklyReportSchema, WeeklyReportInput } from '@/lib/validations/logbook.schema';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Lock, 
  FileText, 
  UploadCloud, 
  Paperclip, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAttendance } from '@/hooks/useAttendance';

export default function StudentLogbookDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const studentId = user?.id || '';
  
  const weekId = params.weekId as string;
  const { 
    useWeekQuery, 
    submitDay, 
    isSubmittingDay, 
    submitWeeklyReport, 
    isSubmittingReport, 
    uploadAttachment, 
    isUploadingAttachment, 
    deleteAttachment 
  } = useLogbook(studentId);

  const { data: week, isLoading } = useWeekQuery(weekId);

  const { useStatusQuery } = useAttendance(studentId);
  const { data: todayStatus, isLoading: isLoadingStatus } = useStatusQuery(studentId);

  // Handle file uploads
  const onDrop = async (acceptedFiles: File[]) => {
    if (!week) return;
    if (week.status !== 'draft') {
      toast.error('You can only upload evidence to draft weeks.');
      return;
    }
    const file = acceptedFiles[0];
    if (file) {
      try {
        await uploadAttachment({ weekId, file });
      } catch (err) {
        // Handled by toast
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'] 
    },
    disabled: week?.status !== 'draft'
  });

  if (isLoading) {
    return <LoadingSkeleton type="profile" />;
  }

  if (!week) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to overview
        </button>
        <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary">
          Logbook week not found.
        </div>
      </div>
    );
  }

  const isEditable = week.status === 'draft';

  return (
    <div className="space-y-8">
      {/* Header breadcrumb & info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-border-custom gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/student/logbook')}
            className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-light transition-colors mb-2 gap-1 focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SIWES Logbook Overviews</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Week {week.weekNumber} Entries</h1>
            <StatusBadge status={week.status} />
          </div>
          <p className="text-xs text-text-secondary">
            Timeline: {format(new Date(week.startDate), 'MMMM dd')} to {format(new Date(week.endDate), 'MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Side-by-side grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Forms and Stack (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Daily Logbook Cards Stack */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <h2 className="text-lg font-bold text-text-primary">Daily Activity Logs</h2>
              <span className="text-xs text-text-secondary">Monday – Friday</span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/50 text-blue-800 p-4 rounded-xl flex items-start space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
              <div className="leading-relaxed">
                <span className="font-bold">Important:</span> Once you submit a daily entry, it will be **permanently locked** and cannot be edited. Ensure you write at least 50 characters summarizing your exact activities.
              </div>
            </div>

            <div className="space-y-4">
              {week.dayEntries.map((day) => (
                <DailyLogCard 
                  key={day.id} 
                  day={day} 
                  onSubmit={submitDay}
                  isWeekEditable={isEditable}
                  loading={isSubmittingDay}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Weekly Summary Report Form */}
          <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-border-custom">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-text-primary">Weekly Summary Report</h3>
            </div>
            
            <WeeklyReportForm 
              week={week} 
              onSubmit={submitWeeklyReport}
              isWeekEditable={isEditable}
              loading={isSubmittingReport}
            />
          </div>

          {/* Section 3: Evidence Documents & Attachments Upload Widget */}
          <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-text-primary mb-1">Evidence Documents & Attachments</h3>
              <p className="text-xs text-text-secondary">Upload PDF reports or PNG/JPG screenshots of your work as evidence for validation.</p>
            </div>

            {/* Upload Dropzone */}
            {isEditable && (
              <div 
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border-custom hover:bg-slate-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-text-primary">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-text-secondary mt-1">Supports PDF, JPEG, and PNG (Max 5MB)</p>
              </div>
            )}

            {/* Attachments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Uploaded Evidence ({week.attachments?.length || 0})</h4>
              {week.attachments && week.attachments.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-border-custom rounded-lg overflow-hidden">
                  {week.attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3.5 bg-slate-50/30 text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-text-primary block truncate">{file.name}</span>
                          <span className="text-[10px] text-text-secondary block">
                            {Math.round(file.size ? file.size / 1024 : 0)} KB • Uploaded {format(new Date(file.uploadedAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); toast.success('Mock downloading file...'); }}
                          className="text-primary hover:text-primary-light font-bold"
                        >
                          Download
                        </a>
                        {isEditable && (
                          <button
                            onClick={() => deleteAttachment({ weekId, attachmentId: file.id })}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete attachment"
                            aria-label="Delete attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-xs text-text-secondary">
                  No attachments uploaded for this week yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebars (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Week Progress Checklist Card */}
          {(() => {
            const completedDays = week.dayEntries.filter((d) => d.isLocked).length;
            const progressPercent = Math.round((completedDays / 5) * 100);
            
            const getStatusIndicator = (day: DayEntry) => {
              if (day.isLocked) {
                return { 
                  icon: '🔒', 
                  text: 'Locked', 
                  colorClass: 'text-text-secondary bg-slate-100 border border-slate-200' 
                };
              }
              if (day.activity && day.activity.trim().length > 0) {
                return { 
                  icon: '✅', 
                  text: 'Draft Filled', 
                  colorClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                };
              }
              return { 
                icon: '⏳', 
                text: 'Empty', 
                colorClass: 'text-amber-700 bg-amber-50 border border-amber-200' 
              };
            };

            const widthClass = 
              completedDays === 1 ? 'w-1/5' : 
              completedDays === 2 ? 'w-2/5' : 
              completedDays === 3 ? 'w-3/5' : 
              completedDays === 4 ? 'w-4/5' : 
              completedDays === 5 ? 'w-full' : 'w-0';

            return (
              <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Week Progress</h3>
                  
                  {/* Progress bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-text-secondary">Logs Locked</span>
                      <span className="font-bold text-primary">{completedDays} / 5 days</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`bg-primary h-2 rounded-full transition-all duration-500 ${widthClass}`}
                      />
                    </div>
                  </div>

                  {/* List of days */}
                  <div className="space-y-3">
                    {week.dayEntries.map((day) => {
                      const status = getStatusIndicator(day);
                      return (
                        <div key={day.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                          <div>
                            <span className="text-xs font-bold text-text-primary block">{day.dayName}</span>
                            <span className="text-[10px] text-text-secondary">{format(new Date(day.date), 'MMM dd')}</span>
                          </div>
                          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${status.colorClass}`}>
                            <span>{status.icon}</span>
                            <span>{status.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Live Attendance Details Card */}
          <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Today's Attendance</h3>
            </div>
            
            {isLoadingStatus ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ) : todayStatus?.record ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-text-secondary uppercase block">Clock In</span>
                    <span className="text-xs text-text-primary font-mono mt-0.5 block">{todayStatus.record.checkInTime}</span>
                    <div className="flex items-start space-x-1 mt-1 text-[10px] text-text-secondary">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{todayStatus.record.checkInAddress || 'Location captured'}</span>
                    </div>
                  </div>

                  {todayStatus.record.checkOutTime && (
                    <div className="pt-2.5 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-text-secondary uppercase block">Clock Out</span>
                      <span className="text-xs text-text-primary font-mono mt-0.5 block">{todayStatus.record.checkOutTime}</span>
                      <div className="flex items-start space-x-1 mt-1 text-[10px] text-text-secondary">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{todayStatus.record.checkOutAddress || 'Location captured'}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {todayStatus.status === 'checked_in' && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span>Currently clocked in. Remember to check out at the end of the day.</span>
                  </div>
                )}
                {todayStatus.status === 'completed' && (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>Attendance registry completed for today.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl text-xs text-text-secondary">
                  No attendance logged for today yet.
                </div>
                <Link 
                  href="/student/attendance"
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-text-primary rounded-xl transition-all border border-border-custom text-center"
                >
                  Go to Attendance Panel
                </Link>
              </div>
            )}
          </div>

          {/* Supervisor Feedback / Comment Panel */}
          {(() => {
            const hasFeedback = (week.status === 'approved' || week.status === 'rejected') && week.supervisorComment;
            
            return (
              <div className="bg-white border border-border-custom rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Supervisor Status</h3>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs text-text-secondary">Sign-off Status:</span>
                  <StatusBadge status={week.status} />
                </div>

                {hasFeedback ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs">
                      <span className="text-[10px] font-bold text-text-secondary uppercase block">Comment:</span>
                      <p className="text-xs text-text-primary mt-1 leading-relaxed italic">
                        "{week.supervisorComment}"
                      </p>
                    </div>
                    <div className="text-[10px] text-text-secondary font-semibold">
                      Signed: {week.supervisorSignature} ({week.supervisorRank})
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-text-secondary italic bg-slate-50/30 rounded-xl border border-slate-100/50">
                    No supervisor comments available yet.
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}

// Inline Sub-component for Daily Logs
interface DailyCardProps {
  day: DayEntry;
  onSubmit: (data: { dayId: string; timeIn: string; timeOut: string; activity: string }) => Promise<any>;
  isWeekEditable: boolean;
  loading: boolean;
}

function DailyLogCard({ day, onSubmit, isWeekEditable, loading }: DailyCardProps) {
  const [expanded, setExpanded] = useState(!day.isLocked);
  const { register, handleSubmit, formState: { errors } } = useForm<DailyEntryInput>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      timeIn: day.timeIn,
      timeOut: day.timeOut,
      activity: day.activity
    }
  });

  const onLocalSubmit = async (data: DailyEntryInput) => {
    try {
      await onSubmit({
        dayId: day.id,
        timeIn: data.timeIn,
        timeOut: data.timeOut,
        activity: data.activity
      });
      setExpanded(false);
    } catch (e) {}
  };

  return (
    <div className={`border rounded-xl shadow-xs overflow-hidden transition-all duration-200 ${
      day.isLocked 
        ? 'bg-slate-50 border-slate-200' 
        : 'bg-white border-border-custom hover:border-slate-300'
    }`}>
      {/* Header trigger */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-lg ${day.isLocked ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-primary'}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">{day.dayName}</h4>
            <p className="text-xs text-text-secondary mt-0.5">{format(new Date(day.date), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {day.isLocked ? (
              <span className="inline-flex items-center text-[10px] font-semibold text-text-secondary bg-slate-100 border border-slate-200 px-2 py-0.5 rounded gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Locked
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                Draft Open
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {day.isLocked ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-text-secondary uppercase text-[10px] block">Time Checked In</span>
                  <span className="text-sm text-text-primary mt-0.5 block font-mono">{day.timeIn}</span>
                </div>
                <div>
                  <span className="font-semibold text-text-secondary uppercase text-[10px] block">Time Checked Out</span>
                  <span className="text-sm text-text-primary mt-0.5 block font-mono">{day.timeOut}</span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-text-secondary uppercase text-[10px] block">Detailed Work Log Description</span>
                <p className="text-sm text-text-primary mt-1.5 leading-relaxed bg-white border border-slate-200 rounded-lg p-3.5 font-sans whitespace-pre-wrap shadow-xs">
                  {day.activity}
                </p>
              </div>
              {day.submittedAt && (
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Submitted and locked on {format(new Date(day.submittedAt), 'MMMM dd, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Time Checked In
                  </label>
                  <input
                    type="time"
                    disabled={!isWeekEditable || loading}
                    {...register('timeIn')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.timeIn ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.timeIn && (
                    <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.timeIn.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Time Checked Out
                  </label>
                  <input
                    type="time"
                    disabled={!isWeekEditable || loading}
                    {...register('timeOut')}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
                      errors.timeOut ? 'border-rose-400' : ''
                    }`}
                  />
                  {errors.timeOut && (
                    <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.timeOut.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  Detailed Work Log Description (Min 50 characters)
                </label>
                <textarea
                  placeholder="Summarize the systems, modules, or tasks you worked on today..."
                  disabled={!isWeekEditable || loading}
                  rows={4}
                  {...register('activity')}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary leading-relaxed resize-none ${
                    errors.activity ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/25' : ''
                  }`}
                />
                {errors.activity && (
                  <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.activity.message}</p>
                )}
              </div>

              {isWeekEditable && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1 focus:outline-none"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    <span>Submit & Lock Day</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// Inline Sub-component for Weekly Report
interface ReportProps {
  week: any;
  onSubmit: (data: { weekId: string; report: any }) => Promise<any>;
  isWeekEditable: boolean;
  loading: boolean;
}

function WeeklyReportForm({ week, onSubmit, isWeekEditable, loading }: ReportProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<WeeklyReportInput>({
    resolver: zodResolver(weeklyReportSchema),
    defaultValues: {
      projectsWorkedOn: week.weeklyReport?.projectsWorkedOn || '',
      sectionOrDepartment: week.weeklyReport?.sectionOrDepartment || '',
      workDoneSummary: week.weeklyReport?.workDoneSummary || '',
      studentComment: week.weeklyReport?.studentComment || ''
    }
  });

  const onLocalReportSubmit = async (data: WeeklyReportInput) => {
    // Before submission, verify all day entries are locked!
    const unlockedDaysCount = week.dayEntries.filter((d: any) => !d.isLocked).length;
    if (unlockedDaysCount > 0) {
      toast.error(`Please complete and lock all daily logs (Monday-Friday) before submitting the weekly report.`);
      return;
    }

    try {
      await onSubmit({
        weekId: week.id,
        report: data
      });
    } catch (e) {}
  };

  const isReadOnly = week.status !== 'draft';

  return (
    <form onSubmit={handleSubmit(onLocalReportSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Projects Worked On
          </label>
          <input
            type="text"
            placeholder="e.g. Chevron Inventory Tracker"
            disabled={isReadOnly || loading}
            {...register('projectsWorkedOn')}
            className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
              errors.projectsWorkedOn ? 'border-rose-400' : ''
            }`}
          />
          {errors.projectsWorkedOn && (
            <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.projectsWorkedOn.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Section / Department
          </label>
          <input
            type="text"
            placeholder="e.g. Software Engineering Division"
            disabled={isReadOnly || loading}
            {...register('sectionOrDepartment')}
            className={`w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary ${
              errors.sectionOrDepartment ? 'border-rose-400' : ''
            }`}
          />
          {errors.sectionOrDepartment && (
            <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.sectionOrDepartment.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Detailed Work Summary (Min 20 chars)
        </label>
        <textarea
          placeholder="Briefly state the milestone accomplishments or tools explored during this week..."
          disabled={isReadOnly || loading}
          rows={5}
          {...register('workDoneSummary')}
          className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary leading-relaxed resize-none ${
            errors.workDoneSummary ? 'border-rose-400' : ''
          }`}
        />
        {errors.workDoneSummary && (
          <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.workDoneSummary.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
          My Comment (Optional)
        </label>
        <textarea
          placeholder="Add any personal feedback or request comments here..."
          disabled={isReadOnly || loading}
          rows={2}
          {...register('studentComment')}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary leading-relaxed resize-none"
        />
      </div>

      {isWeekEditable && (
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-xl shadow-md transition-all gap-1 focus:outline-none"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <FileText className="w-4 h-4" />
            <span>Submit Weekly Report</span>
          </button>
        </div>
      )}
    </form>
  );
}

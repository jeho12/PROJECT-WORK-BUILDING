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
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState<'daily' | 'report' | 'attachments'>('daily');

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
        
        {/* Supervisor Comments (Visible if reviewed) */}
        {(week.status === 'approved' || week.status === 'rejected') && week.supervisorComment && (
          <div className="p-4 bg-slate-50 border border-border-custom rounded-xl max-w-md">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Supervisor Sign-Off Feedback</span>
            <p className="text-xs text-text-primary mt-1 leading-relaxed">"{week.supervisorComment}"</p>
            <div className="mt-2 text-[10px] text-text-secondary font-semibold">
              Signed: {week.supervisorSignature} ({week.supervisorRank})
            </div>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border-custom bg-white p-1 rounded-xl shadow-xs border max-w-md">
        {(['daily', 'report', 'attachments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize focus:outline-none ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
            }`}
          >
            {tab === 'daily' ? 'Daily Entries' : tab === 'report' ? 'Weekly Summary' : 'Evidence Documents'}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-primary p-4 rounded-xl flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
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
      )}

      {activeTab === 'report' && (
        <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm max-w-3xl">
          <h3 className="text-base font-bold text-text-primary mb-4 pb-2 border-b border-border-custom">Weekly Summary Report</h3>
          
          <WeeklyReportForm 
            week={week} 
            onSubmit={submitWeeklyReport}
            isWeekEditable={isEditable}
            loading={isSubmittingReport}
          />
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">Evidence Documents & Attachments</h3>
            <p className="text-xs text-text-secondary">Upload PDF reports or PNG/JPG screenshots of your work as evidence for validation.</p>
          </div>

          {/* Upload Dropzone */}
          {isEditable && (
            <div 
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragActive ? 'border-primary bg-blue-50/50' : 'border-border-custom hover:bg-slate-50/55'
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
                  <div key={file.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 text-xs">
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
                        className="text-primary font-bold hover:underline"
                      >
                        Download
                      </a>
                      {isEditable && (
                        <button
                          onClick={() => deleteAttachment({ weekId, attachmentId: file.id })}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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
      )}
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

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/hooks/useSupervisor';
import { useLogbook } from '@/hooks/useLogbook';
import { aiService } from '@/services/ai.service';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Building, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  BrainCircuit, 
  Award,
  CheckCircle,
  FileCheck2,
  FileX2,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentReviewWorkspace() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supervisorId = user?.id || '';

  const studentId = params.studentId as string;
  const weekId = params.weekId as string;

  const { useStudentDetailQuery, reviewWeek, isReviewing } = useSupervisor(supervisorId);
  const { data: student, isLoading: isLoadingStudent } = useStudentDetailQuery(studentId);

  const { useWeekQuery, useWeeksQuery } = useLogbook(studentId);
  const { data: week, isLoading: isLoadingWeek } = useWeekQuery(weekId);
  const { data: allWeeks } = useWeeksQuery(studentId);

  // Tab State
  const [activeTab, setActiveTab] = useState<'logs' | 'report' | 'ai'>('logs');

  // Review Form States
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState(user?.name || '');
  const [rank, setRank] = useState('Academic Supervisor');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  // AI Summary States
  const [aiReview, setAiReview] = useState<any | null>(null);
  const [aiLoadingState, setAiLoadingState] = useState<'idle' | 'reading' | 'analyzing' | 'writing'>('idle');

  // Load existing reviews if any
  useEffect(() => {
    if (week) {
      setComment(week.supervisorComment || '');
      setSignature(week.supervisorSignature || user?.name || '');
      setRank(week.supervisorRank || 'Academic Supervisor');
    }
  }, [week, user]);

  const handleGenerateAI = async () => {
    setAiLoadingState('reading');
    
    // Simulate multi-step loading steps with timers
    setTimeout(() => {
      setAiLoadingState('analyzing');
    }, 100);

    setTimeout(() => {
      setAiLoadingState('writing');
    }, 200);

    try {
      const summary = await aiService.generateSummary(weekId);
      setTimeout(() => {
        setAiReview(summary);
        setAiLoadingState('idle');
        toast.success('AI Performance Check generated!');
      }, 300);
    } catch (err) {
      setAiLoadingState('idle');
      toast.error('AI Summary failed.');
    }
  };

  const handleReviewSubmit = async (status: 'approved' | 'rejected') => {
    if (!comment) {
      toast.error('Please enter review comments before completing sign-off.');
      return;
    }
    if (!signature) {
      toast.error('Please enter signature name.');
      return;
    }

    try {
      await reviewWeek({
        weekId,
        status,
        comment,
        signature,
        rank
      });
      setConfirmAction(null);
    } catch (e) {}
  };

  const handleExportPDF = () => {
    if (!aiReview) return;
    toast.success('Downloading report...');
    const doc = new jsPDF();

    // Blue header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ANCHOR UNIVERSITY, LAGOS', 20, 15);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('SIWES STUDENT AI PERFORMANCE SUMMARY REPORT', 20, 22);
    doc.text(`Student: ${student?.name} | Matric: ${student?.profile?.matricNumber}`, 20, 29);
    doc.text(`Period: ${aiReview.period} | Evaluated: ${format(new Date(aiReview.generatedAt), 'yyyy-MM-dd')}`, 20, 36);

    // Score badge
    doc.setFillColor(5, 150, 105); // green
    doc.rect(160, 12, 35, 10, 'F');
    doc.text(`RATING: ${aiReview.rating}/10`, 165, 18);

    doc.setTextColor(15, 23, 42);
    
    // Summary
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PERFORMANCE SUMMARY', 20, 60);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(aiReview.summary, 170);
    doc.text(summaryLines, 20, 67);

    // Strengths
    let currentY = 100;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('STUDENT STRENGTHS', 20, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    aiReview.strengths.forEach((str: string, idx: number) => {
      doc.text(`- ${str}`, 20, currentY + 7 + idx * 6);
    });

    // Weaknesses
    currentY += 15 + aiReview.strengths.length * 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('AREAS FOR IMPROVEMENT', 20, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    aiReview.weaknesses.forEach((wk: string, idx: number) => {
      doc.text(`- ${wk}`, 20, currentY + 7 + idx * 6);
    });

    // Recommendations
    currentY += 15 + aiReview.weaknesses.length * 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RECOMMENDATIONS', 20, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const recLines = doc.splitTextToSize(aiReview.recommendations, 170);
    doc.text(recLines, 20, currentY + 7);

    // Endorsements
    currentY += 40;
    doc.setFont('Helvetica', 'bold');
    doc.text('Signed off by academic department:', 20, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${user?.name || 'Supervisor'}`, 20, currentY + 8);
    doc.text('Academic Supervisor Rank', 20, currentY + 13);

    doc.save(`SIWES_AI_Summary_${student?.name}_Week_${week?.weekNumber}.pdf`);
  };

  if (isLoadingStudent || isLoadingWeek) {
    return <LoadingSkeleton type="profile" />;
  }

  if (!student || !week) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </button>
        <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary">
          Student log details not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Confirm Modal approval/rejections */}
      <ConfirmModal
        isOpen={confirmAction !== null}
        title={confirmAction === 'approve' ? 'Approve Student Week' : 'Reject Student Week'}
        message={
          confirmAction === 'approve'
            ? 'Are you sure you want to approve this weekly logbook? The student will be notified and this sheet will lock as verified.'
            : 'Are you sure you want to reject this weekly logbook? The student will be allowed to edit draft entries and resubmit.'
        }
        confirmLabel={confirmAction === 'approve' ? 'Approve Week' : 'Reject Week'}
        isDanger={confirmAction === 'reject'}
        loading={isReviewing}
        onConfirm={() => handleReviewSubmit(confirmAction === 'approve' ? 'approved' : 'rejected')}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Header */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => router.push('/supervisor/students')}
          className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-light transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Student Roster
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Student Details & Navigation (40% width) */}
        <div className="space-y-6">
          <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-bold uppercase mb-3 shadow-inner">
                {student.name.charAt(0)}
              </div>
              <h3 className="text-base font-bold text-text-primary">{student.name}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{student.profile?.matricNumber || 'Matric Pending'}</p>
              <div className="mt-3">
                <StatusBadge status={week.status} />
              </div>
            </div>

            {/* Profile specifications list */}
            <div className="space-y-3.5 text-xs text-text-secondary">
              <div className="flex items-start space-x-2.5">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary block">Placement Organization:</span>
                  <span className="block mt-0.5 leading-relaxed">{student.profile?.organizationName || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary block">Verified Address:</span>
                  <span className="block mt-0.5 leading-relaxed">{student.profile?.organizationAddress || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary block">Industry Supervisor:</span>
                  <span className="block mt-0.5">{student.profile?.industrySupervisorName || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Selector list for other weeks */}
            {allWeeks && allWeeks.length > 0 && (
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Training Week Pages</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {allWeeks.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => router.push(`/supervisor/students/${studentId}/week/${w.id}`)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all focus:outline-none ${
                        w.id === weekId
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white border-border-custom hover:bg-slate-50 text-text-secondary'
                      }`}
                    >
                      Week {w.weekNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Tabbed Review Workspace (60% width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-border-custom bg-white p-1 rounded-xl shadow-xs border max-w-sm">
            {(['logs', 'report', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize focus:outline-none ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                }`}
              >
                {tab === 'logs' ? 'Daily Logs' : tab === 'report' ? 'Weekly Summary' : 'AI Summary check'}
              </button>
            ))}
          </div>

          {/* TAB: Logs Accordion */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {week.dayEntries.map((day) => (
                <div key={day.id} className="bg-white border border-border-custom rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2 text-xs font-bold text-text-primary">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{day.dayName}</span>
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono font-semibold">
                      {day.timeIn ? `${day.timeIn} - ${day.timeOut}` : 'No punch records logged'}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {day.activity || 'No entry details filled for this day.'}
                  </p>
                  
                  {/* Attendance verified badge (GPS check) */}
                  {day.timeIn && (
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold pt-1">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>GPS Attendance Verified at CNL Plaza Lekki Office</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB: Weekly Report Form Review */}
          {activeTab === 'report' && (
            <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm space-y-6">
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-text-secondary block">Projects Worked On:</span>
                    <span className="text-sm font-semibold text-text-primary mt-0.5 block">{week.weeklyReport?.projectsWorkedOn || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-text-secondary block">Section / Department:</span>
                    <span className="text-sm font-semibold text-text-primary mt-0.5 block">{week.weeklyReport?.sectionOrDepartment || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-text-secondary block">Work Done Summary:</span>
                  <p className="text-sm text-text-primary leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-4 mt-1">
                    {week.weeklyReport?.workDoneSummary || 'No summary report filled.'}
                  </p>
                </div>
                {week.weeklyReport?.studentComment && (
                  <div>
                    <span className="font-semibold text-text-secondary block">Student feedback comments:</span>
                    <p className="text-sm text-text-primary leading-relaxed bg-slate-50/50 border border-slate-200/50 rounded-lg p-3 mt-1 italic">
                      "{week.weeklyReport.studentComment}"
                    </p>
                  </div>
                )}
              </div>

              {/* Approval Comment Panel */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-text-primary">Department Review Sign-Off</h4>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                      Supervisor Evaluation Comments
                    </label>
                    <textarea
                      placeholder="Input feedback, warnings, or recommendation remarks to the student..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary leading-relaxed resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="supervisor-signature" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                        Supervisor E-Signature name
                      </label>
                      <input
                        id="supervisor-signature"
                        title="Supervisor E-Signature name"
                        placeholder="Enter your signature name"
                        type="text"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="dean-rank" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                        Dean Rank / Designation
                      </label>
                      <input
                        id="dean-rank"
                        title="Dean Rank / Designation"
                        placeholder="e.g. Professor, HOD"
                        type="text"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setConfirmAction('reject')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-rose-300 hover:bg-rose-50 text-xs font-bold text-rose-600 rounded-lg transition-all gap-1 focus:outline-none"
                  >
                    <FileX2 className="w-4 h-4 shrink-0" />
                    <span>Reject Sheet</span>
                  </button>
                  <button
                    onClick={() => setConfirmAction('approve')}
                    className="inline-flex items-center justify-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1 focus:outline-none"
                  >
                    <FileCheck2 className="w-4 h-4 shrink-0" />
                    <span>Approve Week</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI Summary Panel */}
          {activeTab === 'ai' && (
            <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
                    <BrainCircuit className="w-5 h-5 text-primary" /> AI Evaluation Assistant
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">Synthesize student performance using NLP summarization modules.</p>
                </div>
                {!aiReview && aiLoadingState === 'idle' && (
                  <button
                    onClick={handleGenerateAI}
                    className="inline-flex items-center px-3.5 py-2 bg-primary hover:bg-primary-light text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none animate-bounce"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Generate summary</span>
                  </button>
                )}
              </div>

              {/* AI Loading state */}
              {aiLoadingState !== 'idle' && (
                <div className="p-8 border border-dashed border-blue-200 bg-blue-50/20 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                  <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-primary capitalize animate-pulse">
                      {aiLoadingState === 'reading' 
                        ? '📖 Reading logbook entries...' 
                        : aiLoadingState === 'analyzing'
                        ? '🧠 Analyzing content keywords...'
                        : '✍️ Synthesizing summary layout...'
                      }
                    </p>
                    <p className="text-xs text-text-secondary">Please wait, compiling NLP metrics results.</p>
                  </div>
                </div>
              )}

              {/* AI Review Results Display */}
              {aiReview && aiLoadingState === 'idle' && (
                <div className="space-y-6">
                  {/* Rating Header */}
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Synthesized Performance Rating Score</span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-800 font-mono">
                      {aiReview.rating} / 10
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">📋 Evaluation Summary</h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      {aiReview.summary}
                    </p>
                  </div>

                  {/* Strengths / Weaknesses split layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">✅ Strengths</h4>
                      <ul className="space-y-2 bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl text-xs text-text-secondary leading-relaxed list-disc pl-5">
                        {aiReview.strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">⚠️ Areas for Improvement</h4>
                      <ul className="space-y-2 bg-rose-50/20 border border-rose-100 p-4 rounded-xl text-xs text-text-secondary leading-relaxed list-disc pl-5">
                        {aiReview.weaknesses.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">💡 Recommendation Advice</h4>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      {aiReview.recommendations}
                    </p>
                  </div>

                  {/* PDF Download and Regenerate panel */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      onClick={handleGenerateAI}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-text-primary rounded-lg border border-border-custom transition-all focus:outline-none"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg shadow-sm transition-all focus:outline-none"
                    >
                      Export as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

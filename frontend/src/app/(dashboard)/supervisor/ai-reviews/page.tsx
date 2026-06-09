'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/hooks/useSupervisor';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { BrainCircuit, Search, Calendar, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function SupervisorAIReviewsPage() {
  const { user } = useAuth();
  const supervisorId = user?.id || '';

  const { useStudentsQuery } = useSupervisor(supervisorId);
  const { data: students, isLoading: isLoadingStudents } = useStudentsQuery(supervisorId);

  // States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  // AI reviews query
  const { data: reviews, isLoading: isLoadingReviews, refetch } = useQuery({
    queryKey: ['supervisor_all_reviews', selectedStudentId],
    queryFn: () => aiService.getReviews(selectedStudentId),
    enabled: !!selectedStudentId
  });

  const handleGenerateMonthlyReview = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student.');
      return;
    }

    setIsGenerating(true);
    toast.success('Analyzing student monthly log sheets...');
    
    try {
      const monthsMap: Record<string, number> = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
        January: 1, February: 2, March: 3, April: 4, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
      };
      const monthNum = monthsMap[selectedMonth] || 1;
      const yearNum = Number(selectedYear);

      await aiService.generateMonthlyReview(selectedStudentId, monthNum, yearNum);
      await refetch();
      setIsGenerating(false);
      toast.success('Monthly evaluation report compiled!');
    } catch (e: any) {
      setIsGenerating(false);
      toast.error(e.response?.data?.message || e.message || 'Failed to compile report.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Performance Summaries</h1>
        <p className="text-sm text-text-secondary mt-1">
          Select a student and period to generate or view periodic NLP evaluations.
        </p>
      </div>

      {/* Filter Options card */}
      <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text-primary mb-4">Compile Periodic Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Select Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
            >
              <option value="">Choose Student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.profile?.matricNumber || 'Profile Incomplete'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Evaluation Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
            >
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Evaluation Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <button
            onClick={handleGenerateMonthlyReview}
            disabled={isGenerating || !selectedStudentId}
            className="w-full inline-flex items-center justify-center py-2 px-4 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing logs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compile evaluation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable card list of reviews */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary">Generated Performance Reports</h3>

        {isLoadingReviews ? (
          <LoadingSkeleton type="profile" />
        ) : selectedStudentId ? (
          reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev) => {
                const isExpanded = expandedReviewId === rev.id;
                return (
                  <div key={rev.id} className="bg-white border border-border-custom rounded-xl shadow-xs overflow-hidden">
                    <div 
                      onClick={() => setExpandedReviewId(isExpanded ? null : rev.id)}
                      className="px-5 py-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-primary rounded-lg">
                          <Calendar className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{rev.period} Summary Sheet</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5">Generated on {format(new Date(rev.generatedAt), 'MMMM dd, yyyy')}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Rating Score: {rev.rating} / 10
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-4 border-t border-slate-100 text-xs space-y-4">
                        <div>
                          <h5 className="font-bold text-text-primary mb-1">📋 Periodic Summary</h5>
                          <p className="leading-relaxed text-text-secondary bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-sm">
                            {rev.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-bold text-emerald-700 mb-1">Strengths Checked</h5>
                            <ul className="list-disc pl-5 leading-relaxed text-text-secondary space-y-1">
                              {rev.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-bold text-rose-700 mb-1">Areas for Development</h5>
                            <ul className="list-disc pl-5 leading-relaxed text-text-secondary space-y-1">
                              {rev.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-bold text-text-primary mb-1">💡 Recommendations</h5>
                          <p className="leading-relaxed text-text-secondary bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            {rev.recommendations}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary text-xs">
              No periodic reviews generated for this student yet. Choose parameters above to compile.
            </div>
          )
        ) : (
          <EmptyState
            icon={BrainCircuit}
            title="Select a Student to Start"
            description="Choose an assigned student from the search dropdown menu above to read, compile, and manage AI evaluations."
          />
        )}
      </div>
    </div>
  );
}

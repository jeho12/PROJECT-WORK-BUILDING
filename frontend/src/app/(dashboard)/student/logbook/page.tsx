'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLogbook } from '@/hooks/useLogbook';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { Calendar, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentLogbookOverview() {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const { useWeeksQuery, createWeek, isCreatingWeek } = useLogbook(studentId);
  const { data: weeks, isLoading } = useWeeksQuery(studentId);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startDate || !endDate) {
      setErrorMsg('Please specify both start and end dates.');
      return;
    }

    try {
      await createWeek({ startDate, endDate });
      setModalOpen(false);
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize week.');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-custom">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SIWES Logbook</h1>
          <p className="text-sm text-text-secondary mt-1">
            Initialize new weeks and fill your daily activities logbook pages.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light transition-all rounded-lg shadow-sm gap-2 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Initialize New Week</span>
        </button>
      </div>

      {/* Week Cards Grid */}
      {weeks && weeks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeks.map((week) => {
            const progressPct = Math.round((week.daysFilled / 5) * 100);
            
            return (
              <div 
                key={week.id} 
                className="bg-surface border border-border-custom rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-bold text-text-primary">
                      Week {week.weekNumber}
                    </span>
                    <StatusBadge status={week.status} />
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-text-secondary mb-5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {format(new Date(week.startDate), 'MMM dd')} - {format(new Date(week.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span>Daily entries completed</span>
                      <span>{week.daysFilled} / 5 days</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          week.status === 'approved' ? 'bg-emerald-600' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-custom flex items-center justify-end">
                  <Link
                    href={`/student/logbook/${week.id}`}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      week.status === 'draft' || week.status === 'rejected'
                        ? 'bg-primary border-primary hover:bg-primary-light text-white hover:border-primary-light shadow-sm'
                        : 'bg-white border-border-custom text-text-primary hover:bg-slate-50'
                    }`}
                  >
                    {week.status === 'draft' || week.status === 'rejected' ? 'Edit Log' : 'View Logs'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Weeks Initialized"
          description="Your SIWES digital logbook is currently empty. Get started by initializing your first week of industrial training."
          actionLabel="Initialize Week 1"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Initialize Week Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form 
            onSubmit={handleCreateWeek}
            className="bg-white border border-border-custom rounded-xl shadow-lg max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-2">Initialize Training Week</h3>
              <p className="text-xs text-text-secondary mb-4">
                Select the start and end dates for your industrial training week.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-lg flex items-center space-x-2 text-xs border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Week Start Date (Monday)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                    Week End Date (Friday)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-border-custom space-x-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={isCreatingWeek}
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingWeek}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light disabled:bg-blue-300 rounded-lg shadow-sm transition-all gap-1 focus:outline-none"
              >
                {isCreatingWeek && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>{isCreatingWeek ? 'Initializing...' : 'Initialize'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

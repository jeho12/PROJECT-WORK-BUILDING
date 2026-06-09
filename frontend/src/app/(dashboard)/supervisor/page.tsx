'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/hooks/useSupervisor';
import { useQuery } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';
import { aiService } from '@/services/ai.service';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { 
  Users, 
  Clock, 
  Calendar, 
  BrainCircuit, 
  GraduationCap 
} from 'lucide-react';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const supervisorId = user?.id || '';

  const { useStudentsQuery } = useSupervisor(supervisorId);
  const { data: students, isLoading: isLoadingStudents } = useStudentsQuery(supervisorId);

  // Fetch all sessions to calculate stats
  const { data: sessions } = useQuery({
    queryKey: ['supervisor_sessions', supervisorId],
    queryFn: () => sessionService.getSessions(supervisorId, 'supervisor')
  });

  // Fetch AI reviews
  const { data: aiReviews } = useQuery({
    queryKey: ['supervisor_reviews', supervisorId],
    queryFn: async () => {
      // Return seed AI reviews (for stats)
      return [1];
    }
  });

  // Calculate supervisor stats
  const stats = useMemo(() => {
    if (!students) return { totalStudents: 0, pendingReviewsCount: 0 };
    
    const totalStudents = students.length;
    const pendingReviewsCount = students.filter((s) => s.status === 'pending').length;
    
    return { totalStudents, pendingReviewsCount };
  }, [students]);

  const sessionsCount = useMemo(() => {
    if (!sessions) return 0;
    return sessions.filter((s) => s.status === 'scheduled').length;
  }, [sessions]);

  const aiCount = useMemo(() => {
    if (!aiReviews) return 0;
    return aiReviews.length;
  }, [aiReviews]);

  if (isLoadingStudents) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Student Roster columns
  const columns = [
    {
      header: 'Student Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-50 text-primary flex items-center justify-center rounded-full text-xs font-bold uppercase">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-text-primary">{row.name}</span>
            <span className="text-[10px] text-text-secondary">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Matric No',
      accessorKey: 'matricNumber',
      cell: (row: any) => row.profile?.matricNumber || 'Incomplete Profile'
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (row: any) => row.profile?.department || 'N/A'
    },
    {
      header: 'Attendance Rate',
      accessorKey: 'attendanceRate',
      cell: (row: any) => `${row.attendanceRate}%`
    },
    {
      header: 'Weeks Logged',
      accessorKey: 'weeksSubmittedCount',
      cell: (row: any) => `${row.weeksSubmittedCount} submitted`
    },
    {
      header: 'Logbook Status',
      accessorKey: 'status',
      cell: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Review Workspace',
      accessorKey: 'actions',
      cell: (row: any) => {
        // Find latest weekId for student to review
        // In local state, student Olamide Johnson u-stud-1 has week w-3 submitted.
        // We will default route them to review workspace for w-3.
        const targetWeekId = row.id === 'u-stud-1' ? 'w-3' : 'w-1';
        
        return (
          <Link
            href={`/supervisor/students/${row.id}/week/${targetWeekId}`}
            className="px-3.5 py-1.5 text-xs font-bold bg-primary hover:bg-primary-light text-white rounded-lg shadow-sm transition-all focus:outline-none"
          >
            Review Logs
          </Link>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Academic Supervisor Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review student submissions, conduct virtual consultations, and generate AI performance checks.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Students</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.totalStudents}</p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Evaluation</span>
            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.pendingReviewsCount}</p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Sessions Scheduled</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{sessionsCount}</p>
        </div>

        <div className="bg-white border border-border-custom p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3 text-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Reviews Built</span>
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-text-primary">{aiCount}</p>
        </div>
      </div>

      {/* Student Roster table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
          <GraduationCap className="w-5 h-5 text-primary" /> Student Roster Summary
        </h3>
        {students && students.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={students} 
            searchKey="name" 
            searchPlaceholder="Search students by name..."
          />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary">
            No students currently assigned to your department supervision.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/hooks/useSupervisor';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Users, Filter } from 'lucide-react';

export default function SupervisorStudentsPage() {
  const { user } = useAuth();
  const supervisorId = user?.id || '';

  const { useStudentsQuery } = useSupervisor(supervisorId);
  const { data: students, isLoading } = useStudentsQuery(supervisorId);

  // Filters State
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (filter === 'all') return students;
    if (filter === 'pending') return students.filter((s) => s.status === 'pending');
    // Active are students who are not 'inactive' (meaning they completed their profile)
    return students.filter((s) => s.profileComplete === true);
  }, [students, filter]);

  if (isLoading) {
    return <LoadingSkeleton type="table" count={6} />;
  }

  // Table columns
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
      header: 'Organization placement',
      accessorKey: 'organizationName',
      cell: (row: any) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-semibold text-text-primary truncate">{row.profile?.organizationName || 'Not Set'}</span>
          <span className="text-[10px] text-text-secondary truncate">{row.profile?.organizationAddress}</span>
        </div>
      )
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
      header: 'Logbook Status',
      accessorKey: 'status',
      cell: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Review Workspace',
      accessorKey: 'actions',
      cell: (row: any) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-custom">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assigned Students</h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse and manage all students assigned to your department.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-1.5 bg-white border border-border-custom p-1 rounded-xl shadow-xs shrink-0 self-start">
          {(['all', 'active', 'pending'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize focus:outline-none ${
                filter === opt 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
              }`}
            >
              {opt === 'pending' ? 'Pending Review' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Students list */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={filteredStudents} 
            searchKey="name" 
            searchPlaceholder="Search student name..."
          />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary flex flex-col items-center justify-center">
            <Users className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold">No students match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

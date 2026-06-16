'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { Calendar, User, Building, GraduationCap, X, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Filters State
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Queries
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin_students_list'],
    queryFn: adminService.getStudents
  });

  const { data: supervisors } = useQuery({
    queryKey: ['admin_supervisors_list'],
    queryFn: adminService.getSupervisors
  });

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      // Dept filter
      if (selectedDept !== 'All') {
        const sDept = s.profile?.department || 'N/A';
        if (sDept !== selectedDept) return false;
      }
      // Level filter
      if (selectedLevel !== 'All') {
        const sLvl = s.profile?.level || 'N/A';
        if (sLvl !== selectedLevel) return false;
      }
      // Status filter
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Assigned' && !s.supervisorId) return false;
        if (selectedStatus === 'Unassigned' && s.supervisorId) return false;
        if (selectedStatus === 'Inactive' && s.status !== 'inactive') return false;
      }
      return true;
    });
  }, [students, selectedDept, selectedLevel, selectedStatus]);

  if (isLoading) {
    return <LoadingSkeleton type="table" count={6} />;
  }

  // Departments List for filter
  const departments = ['All', 'Computer Science', 'Software Engineering', 'Information Technology'];

  const columns = [
    {
      header: 'Student Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row: any) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-50 text-primary flex items-center justify-center rounded-full text-xs font-bold uppercase shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-text-primary truncate">{row.name}</span>
            <span className="text-[10px] text-text-secondary truncate">{row.email}</span>
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
      header: 'Assigned Supervisor',
      accessorKey: 'supervisorId',
      cell: (row: any) => {
        if (!row.supervisorId) return <span className="text-rose-500 font-semibold text-xs">Unassigned</span>;
        const supervisor = supervisors?.find((sup) => sup.id === row.supervisorId);
        return <span className="font-semibold">{supervisor ? supervisor.name : 'Prof. Elizabeth Alao'}</span>;
      }
    },
    {
      header: 'Compliance Rate',
      accessorKey: 'attendanceRate',
      cell: (row: any) => `${row.attendanceRate}%`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Profile Details',
      accessorKey: 'id',
      cell: (row: any) => (
        <button
          onClick={() => setSelectedStudent(row)}
          className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-text-primary border border-border-custom rounded-lg transition-all focus:outline-none"
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-custom">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SIWES Students</h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse registered students, monitor placement metrics, and verify supervisors.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-border-custom p-2 rounded-xl shadow-xs self-start">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-text-secondary">
            <span>Faculty:</span>
            <select
              title="Filter by Faculty"
              aria-label="Filter by Faculty"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-border-custom px-2 py-1 rounded outline-none text-text-primary"
            >
              {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-medium text-text-secondary">
            <span>Level:</span>
            <select
              title="Filter by Level"
              aria-label="Filter by Level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-50 border border-border-custom px-2 py-1 rounded outline-none text-text-primary"
            >
              <option value="All">All</option>
              <option value="400">400 Lvl</option>
              <option value="500">500 Lvl</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-medium text-text-secondary">
            <span>Assignment:</span>
            <select
              title="Filter by Assignment Status"
              aria-label="Filter by Assignment Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-border-custom px-2 py-1 rounded outline-none text-text-primary"
            >
              <option value="All">All</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
              <option value="Inactive">Incomplete Profile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students list */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          <DataTable columns={columns} data={filteredStudents} searchKey="name" searchPlaceholder="Search student name..." />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary text-sm">
            No students found matching the selected filters.
          </div>
        )}
      </div>

      {/* Details modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-border-custom rounded-xl shadow-lg max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-border-custom flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">Student SIWES Log Sheet Card</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 focus:outline-none"
                title="Close details dialog"
                aria-label="Close details dialog"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 flex items-center justify-center rounded-full text-lg font-bold text-primary shrink-0 uppercase">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedStudent.name}</h4>
                  <p className="text-text-secondary mt-0.5">{selectedStudent.email}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-semibold text-text-secondary">Matric:</span>
                    <span className="font-mono font-bold text-text-primary">{selectedStudent.profile?.matricNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>

              {selectedStudent.profileComplete ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-text-secondary leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">Department Details</span>
                    <span className="block">{selectedStudent.profile?.department} ({selectedStudent.profile?.level} Lvl)</span>
                    <span className="block">{selectedStudent.profile?.faculty}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">Placement Partner</span>
                    <span className="font-semibold text-text-primary block">{selectedStudent.profile?.organizationName}</span>
                    <span className="block">{selectedStudent.profile?.organizationAddress}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">Training Timeline</span>
                    <span className="block">{selectedStudent.profile?.trainingStartDate} to {selectedStudent.profile?.trainingEndDate}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">Industry Contact</span>
                    <span className="block font-semibold text-text-primary">{selectedStudent.profile?.industrySupervisorName}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl leading-relaxed">
                  Student has not completed their SIWES profile details yet.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-border-custom space-x-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-bold text-text-primary bg-white border border-border-custom hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

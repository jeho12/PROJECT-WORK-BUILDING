'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import DataTable from '@/components/shared/DataTable';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Users, UserPlus, Link2, Unlink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAssignmentsPage() {
  const queryClient = useQueryClient();

  // Selection states
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // De-allocation states
  const [allocationToClear, setAllocationToClear] = useState<any | null>(null);
  const [clearing, setClearing] = useState(false);

  // Queries
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['admin_students_allocation'],
    queryFn: adminService.getStudents
  });

  const { data: supervisors, isLoading: isLoadingSupervisors } = useQuery({
    queryKey: ['admin_supervisors_allocation'],
    queryFn: adminService.getSupervisors
  });

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSupervisorId) {
      toast.error('Select both a student and a supervisor.');
      return;
    }

    setIsAssigning(true);
    try {
      await adminService.assignStudent(selectedStudentId, selectedSupervisorId);
      queryClient.invalidateQueries({ queryKey: ['admin_students_allocation'] });
      queryClient.invalidateQueries({ queryKey: ['admin_supervisors_allocation'] });
      
      toast.success('Student assigned to supervisor successfully!');
      setSelectedStudentId('');
    } catch (err) {
      toast.error('Failed to register assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!allocationToClear) return;
    setClearing(true);
    try {
      await adminService.assignStudent(allocationToClear.id, null);
      queryClient.invalidateQueries({ queryKey: ['admin_students_allocation'] });
      queryClient.invalidateQueries({ queryKey: ['admin_supervisors_allocation'] });
      
      toast.success('Supervisor de-allocated.');
      setAllocationToClear(null);
    } catch (err) {
      toast.error('Failed to de-allocate supervisor.');
    } finally {
      setClearing(false);
    }
  };

  if (isLoadingStudents || isLoadingSupervisors) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  // Segment allocations
  const unassignedStudents = students?.filter((s) => !s.supervisorId && s.profileComplete) || [];
  const assignedStudents = students?.filter((s) => s.supervisorId) || [];

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
            <span className="text-[10px] text-text-secondary truncate">{row.profile?.matricNumber || 'Matric Pending'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Placement organization',
      accessorKey: 'organizationName',
      cell: (row: any) => row.profile?.organizationName || 'N/A'
    },
    {
      header: 'Assigned Supervisor',
      accessorKey: 'supervisorId',
      cell: (row: any) => {
        const sup = supervisors?.find((s) => s.id === row.supervisorId);
        return <span className="font-semibold">{sup ? sup.name : 'Prof. Elizabeth Alao'}</span>;
      }
    },
    {
      header: 'Action',
      accessorKey: 'id',
      cell: (row: any) => (
        <button
          onClick={() => setAllocationToClear(row)}
          className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors gap-1.5 focus:outline-none"
        >
          <Unlink className="w-3.5 h-3.5" />
          <span>De-allocate</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <ConfirmModal
        isOpen={allocationToClear !== null}
        title="De-allocate Student"
        message={`Are you sure you want to remove the supervisor assignment for ${allocationToClear?.name}? They will return to the unallocated list.`}
        confirmLabel="De-allocate"
        isDanger={true}
        loading={clearing}
        onConfirm={handleUnassign}
        onCancel={() => setAllocationToClear(null)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Student Allocation Board</h1>
        <p className="text-sm text-text-secondary mt-1">
          Connect unallocated students to academic faculty supervisors.
        </p>
      </div>

      {/* Assignment splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: assignment creation */}
        <div className="lg:col-span-1 bg-white border border-border-custom p-6 rounded-xl shadow-sm space-y-4 self-start">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
            <UserPlus className="w-5 h-5 text-primary" /> Allocate Student
          </h3>

          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="select-student" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Select Unallocated Student
              </label>
              <select
                id="select-student"
                title="Select Unallocated Student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
              >
                <option value="">Choose Student</option>
                {unassignedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.profile?.matricNumber})
                  </option>
                ))}
              </select>
              {unassignedStudents.length === 0 && (
                <p className="text-[10px] text-text-secondary mt-1 font-semibold">✓ All active student profiles are allocated.</p>
              )}
            </div>

            <div>
              <label htmlFor="select-supervisor" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Select Faculty Supervisor
              </label>
              <select
                id="select-supervisor"
                title="Select Faculty Supervisor"
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
              >
                <option value="">Choose Supervisor</option>
                {supervisors?.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.assignedStudentsCount} assigned)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isAssigning || !selectedStudentId || !selectedSupervisorId}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
            >
              {isAssigning && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <Link2 className="w-4 h-4 shrink-0" />
              <span>Link Student</span>
            </button>
          </form>
        </div>

        {/* Right pane: current allocations grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-1.5">
            <Users className="w-5 h-5 text-primary" /> Active Supervisor Placements ({assignedStudents.length})
          </h3>
          
          {assignedStudents.length > 0 ? (
            <DataTable columns={columns} data={assignedStudents} searchKey="name" searchPlaceholder="Search allocated students..." />
          ) : (
            <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary text-sm">
              No students currently assigned. Link them using the forms panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

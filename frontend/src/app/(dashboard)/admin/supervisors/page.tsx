'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSupervisorsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletions state
  const [supervisorToDelete, setSupervisorToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Queries
  const { data: supervisors, isLoading } = useQuery({
    queryKey: ['admin_supervisors'],
    queryFn: adminService.getSupervisors
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please fill in name and email fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createSupervisor({ name, email, department });
      queryClient.invalidateQueries({ queryKey: ['admin_supervisors'] });
      toast.success('Supervisor onboarding complete!');
      setShowForm(false);
      setName('');
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Onboarding failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!supervisorToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteSupervisor(supervisorToDelete.id);
      queryClient.invalidateQueries({ queryKey: ['admin_supervisors'] });
      toast.success('Supervisor profile removed.');
      setSupervisorToDelete(null);
    } catch (err) {
      toast.error('Failed to remove supervisor.');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  const columns = [
    {
      header: 'Supervisor Name',
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
      header: 'Department Faculty',
      accessorKey: 'department'
    },
    {
      header: 'Students Managed',
      accessorKey: 'assignedStudentsCount',
      cell: (row: any) => `${row.assignedStudentsCount} students`
    },
    {
      header: 'Active Status',
      accessorKey: 'status',
      cell: (row: any) => <StatusBadge status={row.status} />
    },
    {
      header: 'Administrative Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <button
          onClick={() => setSupervisorToDelete(row)}
          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
          title="Delete Supervisor"
          aria-label="Delete Supervisor"
        >
          <Trash2 className="w-4 h-4 shrink-0" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <ConfirmModal
        isOpen={supervisorToDelete !== null}
        title="Remove Supervisor"
        message="Are you sure you want to delete this supervisor profile? This action will de-allocate all their students."
        confirmLabel="Remove Profile"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSupervisorToDelete(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-custom">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Academic Supervisors</h1>
          <p className="text-sm text-text-secondary mt-1">
            Register academic supervisors, verify departments, and monitor student loads.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Register Supervisor</span>
        </button>
      </div>

      {/* Registration Slide Drawer Form */}
      {showForm && (
        <form onSubmit={handleCreateSubmit} className="bg-white border border-border-custom p-6 rounded-xl shadow-sm max-w-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-base font-bold text-text-primary border-b border-slate-100 pb-2">Onboard Supervisor</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. John Kayode"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                placeholder="e.g. j.kayode@anchor.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary"
              />
            </div>
            <div>
              <label htmlFor="select-department" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Academic Faculty Department
              </label>
              <select
                id="select-department"
                title="Academic Faculty Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:border-primary transition-all text-text-primary font-medium"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-text-primary bg-white border border-border-custom hover:bg-slate-50 rounded-lg transition-all focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-5 py-2 bg-primary hover:bg-primary-light disabled:bg-blue-300 text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      )}

      {/* Roster table */}
      <div className="space-y-4">
        {supervisors && supervisors.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={supervisors} 
            searchKey="name" 
            searchPlaceholder="Search supervisor by name..."
          />
        ) : (
          <div className="bg-white border border-border-custom rounded-xl p-8 text-center text-text-secondary">
            No supervisors onboarded yet.
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { LogbookStatus } from '@/types/logbook.types';

interface StatusBadgeProps {
  status: LogbookStatus | 'pending' | 'active' | 'inactive' | 'completed' | 'partial' | 'scheduled' | 'cancelled';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'submitted':
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
      case 'inactive':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'draft':
      case 'partial':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const capitalize = (val: string) => {
    if (val === 'partial') return 'Incomplete Punch';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      {capitalize(status)}
    </span>
  );
}

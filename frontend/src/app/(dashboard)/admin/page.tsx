'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { 
  Users, 
  UserCheck, 
  Activity, 
  BookOpen, 
  Clock, 
  BrainCircuit,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: adminService.getStats
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin_events'],
    queryFn: adminService.getSystemEvents
  });

  // Mock charts data
  const barData = [
    { name: 'Week 1', submissions: 12 },
    { name: 'Week 2', submissions: 18 },
    { name: 'Week 3', submissions: 22 },
    { name: 'Week 4', submissions: 28 },
    { name: 'Week 5', submissions: 26 },
    { name: 'Week 6', submissions: 32 },
    { name: 'Week 7', submissions: 35 },
    { name: 'Week 8', submissions: 41 }
  ];

  const pieData = [
    { name: 'Computer Science', value: 15 },
    { name: 'Software Engineering', value: 10 },
    { name: 'Information Technology', value: 8 },
    { name: 'Computer Engineering', value: 7 }
  ];

  const COLORS = ['#1E40AF', '#3B82F6', '#059669', '#F59E0B'];

  const lineData = Array.from({ length: 15 }).map((_, idx) => ({
    day: `Day ${idx + 1}`,
    rate: Math.round(85 + Math.random() * 10)
  }));

  if (isLoadingStats || isLoadingEvents) {
    return <LoadingSkeleton type="card-grid" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">SIWES Administrative Hub</h1>
        <p className="text-sm text-text-secondary mt-1">
          Anchor University tripartite compliance board, user registers, and system analytics.
        </p>
      </div>

      {/* Stats Cards Row (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.totalStudents}</p>
        </div>

        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Supervisors</span>
            <UserCheck className="w-4 h-4 text-secondary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.totalSupervisors}</p>
        </div>

        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Users</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.activeUsers}</p>
        </div>

        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Logs Filed</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.logbookSubmissionsCount}</p>
        </div>

        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Reviews</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.pendingReviews}</p>
        </div>

        <div className="bg-white border border-border-custom p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Summaries</span>
            <BrainCircuit className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-text-primary">{stats?.aiReviewsCount}</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Submissions BarChart (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 bg-white border border-border-custom rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-primary" /> Logbook Submission Rates (Last 8 Weeks)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="submissions" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Department Demographics PieChart */}
        <div className="bg-white border border-border-custom rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-secondary" /> Students by Department
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Rates LineChart (3 cols full width) */}
        <div className="lg:col-span-3 bg-white border border-border-custom rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-purple-600" /> Attendance Compliance Trend (Last 15 Days)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Audit log (Recent Activity Feed) */}
      <div className="bg-white border border-border-custom rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text-primary mb-5 flex items-center gap-1.5">
          <Calendar className="w-5 h-5 text-primary" /> SIWES Portal System Audit Logs
        </h3>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
          {events && events.length > 0 ? (
            events.map((ev) => (
              <div key={ev.id} className="py-3 flex items-start justify-between text-xs gap-4 hover:bg-slate-50/20 px-2 rounded transition-colors">
                <div className="flex items-start space-x-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    ev.type === 'register' ? 'bg-blue-500' : ev.type === 'review' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  <div>
                    <p className="text-text-primary font-medium leading-relaxed">{ev.message}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5 capitalize">{ev.type} activity log</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-text-secondary shrink-0 font-semibold">
                  {format(new Date(ev.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-text-secondary">
              No audit logs captured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

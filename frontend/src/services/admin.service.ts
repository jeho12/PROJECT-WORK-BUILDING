import { User, StudentDetail, SupervisorDetail } from '@/types/user.types';
import { StudentProfile } from '@/types/user.types';
import { SystemEvent } from './mockData';
import api from '@/lib/axios';

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
    : 'http://localhost:5001';
};

const mapBackendProfileToFrontend = (p: any): StudentProfile | null => {
  if (!p) return null;
  const baseUrl = getBackendBaseUrl();
  return {
    matricNumber: p.matric_number,
    department: p.department,
    faculty: p.faculty,
    level: p.level,
    organizationName: p.organization_name || '',
    organizationAddress: p.organization_address || '',
    orgLatitude: p.organization_latitude || undefined,
    orgLongitude: p.organization_longitude || undefined,
    industrySupervisorName: p.industry_supervisor_name || '',
    trainingStartDate: p.training_start_date ? new Date(p.training_start_date).toISOString().split('T')[0] : '',
    trainingEndDate: p.training_end_date ? new Date(p.training_end_date).toISOString().split('T')[0] : '',
    passportUrl: p.passport_path ? (p.passport_path.startsWith('http') ? p.passport_path : `${baseUrl}${p.passport_path}`) : undefined
  };
};

export const adminService = {
  getStats: async (): Promise<{
    totalStudents: number;
    totalSupervisors: number;
    activeUsers: number;
    logbookSubmissionsCount: number;
    pendingReviews: number;
    aiReviewsCount: number;
  }> => {
    const response = await api.get('/admin/dashboard');
    const stats = response.data.data;
    return {
      totalStudents: stats.totalStudents || 0,
      totalSupervisors: stats.totalSupervisors || 0,
      activeUsers: stats.activeUsers || 0,
      logbookSubmissionsCount: stats.entriesThisMonth || 0, // Maps to submitted logs
      pendingReviews: stats.pendingReviews || 0,
      aiReviewsCount: stats.aiReviews || 0
    };
  },

  getSupervisors: async (): Promise<SupervisorDetail[]> => {
    const response = await api.get('/admin/supervisors', { params: { limit: 100 } });
    // backend response has data list directly under response.data.data due to pagination mapping
    const list = response.data.data || [];
    return list.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: 'supervisor',
      department: 'Computer Science',
      assignedStudentsCount: s.supervised_students?.length || 0,
      status: s.is_active ? 'active' : 'inactive'
    }));
  },

  createSupervisor: async (data: { name: string; email: string; department: string }): Promise<User> => {
    const payload = {
      name: data.name,
      email: data.email,
      password: 'password' // Default placeholder password for supervisors
    };
    const response = await api.post('/admin/supervisors', payload);
    const s = response.data.data;
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      role: 'supervisor',
      profileComplete: true
    };
  },

  deleteSupervisor: async (supervisorId: string): Promise<void> => {
    await api.delete(`/admin/users/${supervisorId}`);
  },

  getStudents: async (): Promise<StudentDetail[]> => {
    const response = await api.get('/admin/students', { params: { limit: 100 } });
    const list = response.data.data || [];
    
    return list.map((p: any) => {
      const weeks = p.user?.logbook_weeks || [];
      const totalWeeksCount = weeks.length || 1;
      const weeksSubmittedCount = weeks.filter((w: any) => w.status !== 'draft').length;
      
      const attendanceCount = p.user?.attendance_logs?.length || 0;
      const attendanceRate = attendanceCount > 0 ? Math.min(100, Math.round((attendanceCount / 60) * 100)) : 100;
      
      const status = weeks.some((w: any) => w.status === 'submitted') ? 'pending' : (p.profile_complete ? 'active' : 'inactive');

      return {
        id: p.user_id,
        name: p.user?.name || 'Student',
        email: p.user?.email || '',
        role: 'student',
        profileComplete: p.profile_complete,
        profile: mapBackendProfileToFrontend(p)!,
        supervisorId: p.supervisor_id || undefined,
        weeksSubmittedCount,
        totalWeeksCount,
        attendanceRate,
        status
      };
    });
  },

  assignStudent: async (studentId: string, supervisorId: string | null): Promise<void> => {
    await api.post('/admin/assignments', {
      student_id: studentId,
      supervisor_id: supervisorId
    });
  },

  getSystemEvents: async (): Promise<SystemEvent[]> => {
    try {
      const response = await api.get('/admin/users');
      const users = response.data.data || [];
      return users.slice(0, 10).map((u: any) => ({
        id: `ev-${u.id}`,
        type: u.role === 'supervisor' ? 'supervisor_created' : 'register',
        message: `${u.role.toUpperCase()} registered: ${u.name} (${u.email})`,
        timestamp: u.created_at
      }));
    } catch {
      return [];
    }
  }
};

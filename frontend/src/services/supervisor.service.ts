import { StudentDetail, StudentProfile } from '@/types/user.types';
import { LogbookWeek, DayEntry, WeeklyReport, LogbookAttachment } from '@/types/logbook.types';
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

const mapBackendWeekToFrontend = (w: any): LogbookWeek => {
  const dayEntries: DayEntry[] = (w.logbook_days || []).map((d: any) => ({
    id: d.id,
    weekId: w.id,
    date: new Date(d.date).toISOString().split('T')[0],
    dayName: d.day_name,
    timeIn: d.time_in || '',
    timeOut: d.time_out || '',
    activity: d.activity || '',
    isLocked: d.locked || false,
    submittedAt: d.locked_at || undefined,
    evidenceUrl: d.attachments?.[0]?.file_url || undefined
  }));

  const daysFilled = dayEntries.filter(d => d.activity !== '').length;

  let weeklyReport: WeeklyReport | undefined = undefined;
  if (w.weekly_report) {
    weeklyReport = {
      projectsWorkedOn: w.weekly_report.projects || '',
      sectionOrDepartment: w.weekly_report.section_department || '',
      workDoneSummary: w.weekly_report.work_done || '',
      studentComment: w.weekly_report.student_comment || '',
      submittedAt: w.weekly_report.submitted_at || undefined
    };
  }

  const baseUrl = getBackendBaseUrl();
  const attachments: LogbookAttachment[] = (w.logbook_days || []).flatMap((d: any) =>
    (d.attachments || []).map((att: any) => ({
      id: att.id,
      name: att.file_name,
      url: att.file_url.startsWith('http') ? att.file_url : `${baseUrl}${att.file_url}`,
      size: att.file_size,
      uploadedAt: att.uploaded_at
    }))
  );

  return {
    id: w.id,
    studentId: w.user_id,
    weekNumber: w.week_number,
    startDate: new Date(w.week_start_date).toISOString().split('T')[0],
    endDate: new Date(w.week_end_date).toISOString().split('T')[0],
    status: w.status,
    daysFilled,
    dayEntries,
    weeklyReport,
    attachments,
    supervisorComment: w.weekly_report?.supervisor_comment || undefined,
    supervisorSignature: w.weekly_report?.supervisor_name || undefined,
    supervisorRank: w.weekly_report?.supervisor_rank || undefined,
    reviewedAt: w.weekly_report?.approved_at || undefined
  };
};

export const supervisorService = {
  getStudents: async (supervisorId: string): Promise<StudentDetail[]> => {
    const response = await api.get('/supervisor/students');
    const profiles = response.data.data || [];
    
    // In parallel, fetch details and weeks for each student to display accurate rates and counts
    const detailPromises = profiles.map((p: any) => 
      api.get(`/supervisor/students/${p.user_id}`).catch(() => null)
    );
    const detailsResponses = await Promise.all(detailPromises);
    
    const weeksPromises = profiles.map((p: any) => 
      api.get(`/supervisor/students/${p.user_id}/weeks`).catch(() => null)
    );
    const weeksResponses = await Promise.all(weeksPromises);
    
    return profiles.map((p: any, index: number) => {
      const details = detailsResponses[index]?.data?.data;
      const weeks = weeksResponses[index]?.data?.data || [];
      
      const totalWeeksCount = weeks.length || 1;
      const submittedWeeksCount = weeks.filter((w: any) => w.status !== 'draft').length;
      
      const stats = details?.stats;
      const attendanceCount = stats?.totalAttendance || 0;
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
        weeksSubmittedCount: submittedWeeksCount,
        totalWeeksCount,
        attendanceRate,
        status
      };
    });
  },

  getStudentDetail: async (studentId: string): Promise<StudentDetail | null> => {
    const response = await api.get(`/supervisor/students/${studentId}`);
    const details = response.data.data;
    if (!details) return null;
    
    const p = details.profile;
    
    const weeksResponse = await api.get(`/supervisor/students/${studentId}/weeks`);
    const weeks = weeksResponse.data.data || [];
    
    const totalWeeksCount = weeks.length || 1;
    const submittedWeeksCount = weeks.filter((w: any) => w.status !== 'draft').length;
    
    const stats = details.stats;
    const attendanceCount = stats?.totalAttendance || 0;
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
      weeksSubmittedCount: submittedWeeksCount,
      totalWeeksCount,
      attendanceRate,
      status
    };
  },

  reviewWeek: async (
    weekId: string, 
    data: { status: 'approved' | 'rejected'; comment: string; signature: string; rank: string }
  ): Promise<LogbookWeek> => {
    await api.post(`/supervisor/weeks/${weekId}/review`, {
      review_status: data.status,
      supervisor_comment: data.comment,
      supervisor_name: data.signature,
      supervisor_rank: data.rank
    });
    
    // Fetch the updated logbook week details
    const weekResponse = await api.get(`/logbook/weeks/${weekId}`);
    return mapBackendWeekToFrontend(weekResponse.data.data);
  }
};

import { LogbookWeek, DayEntry, WeeklyReport, LogbookAttachment } from '@/types/logbook.types';
import api from '@/lib/axios';

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
    : 'http://localhost:5001';
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

export const logbookService = {
  getWeeks: async (studentId: string): Promise<LogbookWeek[]> => {
    const response = await api.get('/logbook/weeks');
    const weeks = response.data.data || [];
    
    // To ensure full mapping details (e.g. daysFilled count) map with mapper defaults
    return weeks.map(mapBackendWeekToFrontend).sort((a: any, b: any) => a.weekNumber - b.weekNumber);
  },

  getWeek: async (weekId: string): Promise<LogbookWeek | null> => {
    const response = await api.get(`/logbook/weeks/${weekId}`);
    return mapBackendWeekToFrontend(response.data.data);
  },

  createWeek: async (studentId: string, startDate: string, endDate: string): Promise<LogbookWeek> => {
    const response = await api.post('/logbook/weeks', {
      week_start_date: new Date(startDate).toISOString(),
      week_end_date: new Date(endDate).toISOString()
    });
    return mapBackendWeekToFrontend(response.data.data);
  },

  submitDay: async (dayId: string, data: { timeIn: string; timeOut: string; activity: string; evidenceUrl?: string }): Promise<DayEntry> => {
    const response = await api.post(`/logbook/days/${dayId}/submit`, {
      time_in: data.timeIn,
      time_out: data.timeOut,
      activity: data.activity
    });
    const d = response.data.data;
    return {
      id: d.id,
      weekId: d.logbook_week_id,
      date: new Date(d.date).toISOString().split('T')[0],
      dayName: d.day_name,
      timeIn: d.time_in || '',
      timeOut: d.time_out || '',
      activity: d.activity || '',
      isLocked: d.locked || false,
      submittedAt: d.locked_at || undefined
    };
  },

  submitWeeklyReport: async (weekId: string, data: WeeklyReport): Promise<LogbookWeek> => {
    const response = await api.post(`/logbook/weeks/${weekId}/report`, {
      projects: data.projectsWorkedOn,
      section_department: data.sectionOrDepartment,
      work_done: data.workDoneSummary,
      student_comment: data.studentComment
    });
    // Re-fetch the entire week detail after update to return populated response
    const weekResponse = await api.get(`/logbook/weeks/${weekId}`);
    return mapBackendWeekToFrontend(weekResponse.data.data);
  },

  uploadAttachment: async (weekId: string, file: File): Promise<LogbookAttachment> => {
    // 1. Fetch first logbook day ID of the week to attach file to
    const weekResponse = await api.get(`/logbook/weeks/${weekId}`);
    const weekDetail = weekResponse.data.data;
    const firstDayId = weekDetail.logbook_days?.[0]?.id;
    if (!firstDayId) {
      throw new Error('Unable to find day entries in the week to upload evidence.');
    }

    // 2. Prepare Form Data & Post to Backend
    const formData = new FormData();
    formData.append('attachment', file);
    
    const response = await api.post(`/logbook/days/${firstDayId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const att = response.data.data;
    const baseUrl = getBackendBaseUrl();
    return {
      id: att.id,
      name: att.file_name,
      url: att.file_url.startsWith('http') ? att.file_url : `${baseUrl}${att.file_url}`,
      size: att.file_size,
      uploadedAt: att.uploaded_at
    };
  },

  deleteAttachment: async (weekId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/logbook/attachments/${attachmentId}`);
  },

  getRecentActivities: async (studentId: string): Promise<DayEntry[]> => {
    const response = await api.get('/logbook/weeks');
    const weeks = response.data.data || [];
    
    const allDays: DayEntry[] = [];
    
    // Sort weeks descending to pull latest items
    const sortedWeeks = [...weeks].sort((a: any, b: any) => b.week_number - a.week_number);
    const recentWeeks = sortedWeeks.slice(0, 2);
    
    const detailsPromises = recentWeeks.map((w: any) => api.get(`/logbook/weeks/${w.id}`));
    const detailsResponses = await Promise.all(detailsPromises);
    
    for (const res of detailsResponses) {
      const weekDetail = res.data.data;
      const mappedWeek = mapBackendWeekToFrontend(weekDetail);
      allDays.push(...mappedWeek.dayEntries);
    }
    
    return allDays
      .filter((d) => d.activity !== '')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }
};

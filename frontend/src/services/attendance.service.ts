import { AttendanceRecord } from '@/types/attendance.types';
import api from '@/lib/axios';

const getHHMMSS = (dateStr: string | null) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return d.toTimeString().split(' ')[0]; // HH:MM:SS
};

const mapBackendAttendanceToFrontend = (log: any): AttendanceRecord => {
  const status = log.check_in_time && log.check_out_time ? 'completed' : 'partial';
  return {
    id: log.id,
    studentId: log.user_id,
    date: new Date(log.date).toISOString().split('T')[0],
    checkInTime: getHHMMSS(log.check_in_time) || '',
    checkOutTime: getHHMMSS(log.check_out_time),
    checkInLatitude: log.check_in_latitude,
    checkInLongitude: log.check_in_longitude,
    checkOutLatitude: log.check_out_latitude || undefined,
    checkOutLongitude: log.check_out_longitude || undefined,
    checkInAddress: log.check_in_address || '',
    checkOutAddress: log.check_out_address || undefined,
    status
  };
};

export const attendanceService = {
  getAttendanceHistory: async (studentId: string): Promise<AttendanceRecord[]> => {
    const response = await api.get('/attendance/history', { params: { limit: 100 } });
    // response.data.data holds the array of logs (as it's paginated on the backend)
    return (response.data.data || []).map(mapBackendAttendanceToFrontend);
  },

  getTodayStatus: async (studentId: string): Promise<{ status: 'not_checked_in' | 'checked_in' | 'completed'; record?: AttendanceRecord }> => {
    const response = await api.get('/attendance/today');
    const record = response.data.data;
    if (!record) {
      return { status: 'not_checked_in' };
    }
    const mapped = mapBackendAttendanceToFrontend(record);
    return {
      status: mapped.status === 'completed' ? 'completed' : 'checked_in',
      record: mapped
    };
  },

  checkIn: async (studentId: string, lat: number, lng: number, address: string): Promise<AttendanceRecord> => {
    // 1. Resolve today's logbook day ID by querying weeks
    const todayStr = new Date().toISOString().split('T')[0];
    const weeksResponse = await api.get('/logbook/weeks');
    const weeks = weeksResponse.data.data || [];
    
    let dayId = '';
    for (const week of weeks) {
      const day = week.logbook_days?.find((d: any) => d.date.split('T')[0] === todayStr);
      if (day) {
        dayId = day.id;
        break;
      }
    }

    // 2. If week page hasn't been created yet, let's auto-initialize it
    if (!dayId) {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      friday.setHours(23, 59, 59, 999);

      const createResponse = await api.post('/logbook/weeks', {
        week_start_date: monday.toISOString(),
        week_end_date: friday.toISOString()
      });
      
      const newWeek = createResponse.data.data;
      const day = newWeek.logbook_days?.find((d: any) => d.date.split('T')[0] === todayStr);
      if (day) {
        dayId = day.id;
      } else {
        dayId = newWeek.logbook_days?.[0]?.id || '';
      }
    }

    if (!dayId) {
      throw new Error('Unable to resolve or initialize a logbook day ID for today.');
    }

    const payload = {
      latitude: lat,
      longitude: lng,
      address,
      logbook_day_id: dayId,
      device_info: typeof window !== 'undefined' ? window.navigator.userAgent : 'Browser'
    };

    const response = await api.post('/attendance/check-in', payload);
    return mapBackendAttendanceToFrontend(response.data.data);
  },

  checkOut: async (studentId: string, lat: number, lng: number, address: string): Promise<AttendanceRecord> => {
    const payload = {
      latitude: lat,
      longitude: lng,
      address,
      device_info: typeof window !== 'undefined' ? window.navigator.userAgent : 'Browser'
    };

    const response = await api.post('/attendance/check-out', payload);
    return mapBackendAttendanceToFrontend(response.data.data);
  }
};

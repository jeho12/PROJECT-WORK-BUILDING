import { SupervisionSession } from '@/types/session.types';
import api from '@/lib/axios';

const mapBackendSessionToFrontend = (s: any): SupervisionSession => {
  return {
    id: s.id,
    studentId: s.student_id,
    studentName: s.student?.name || 'Student',
    supervisorId: s.supervisor_id,
    supervisorName: s.supervisor?.name || 'Supervisor',
    title: s.title,
    description: s.description || '',
    scheduledAt: new Date(s.scheduled_at).toISOString(),
    duration: s.duration_minutes,
    roomName: s.room_name,
    status: s.status
  };
};

export const sessionService = {
  getSessions: async (userId: string, role: 'student' | 'supervisor'): Promise<SupervisionSession[]> => {
    const endpoint = role === 'student' ? '/sessions/student' : '/sessions';
    const response = await api.get(endpoint);
    const list = response.data.data || [];
    return list.map(mapBackendSessionToFrontend);
  },

  createSession: async (data: {
    studentId: string;
    title: string;
    description: string;
    scheduledAt: string;
    duration: number;
    supervisorId: string;
    supervisorName: string;
  }): Promise<SupervisionSession> => {
    const payload = {
      student_id: data.studentId,
      title: data.title,
      description: data.description,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.duration
    };
    const response = await api.post('/sessions', payload);
    return mapBackendSessionToFrontend(response.data.data);
  },

  cancelSession: async (sessionId: string): Promise<void> => {
    await api.patch(`/sessions/${sessionId}/cancel`);
  },

  verifyGPSLocation: async (sessionId: string, latitude: number, longitude: number): Promise<{ verified: boolean; message: string; distance_meters?: number }> => {
    const response = await api.post(`/sessions/${sessionId}/verify-location`, { latitude, longitude });
    return response.data.data;
  },

  joinSession: async (sessionId: string): Promise<void> => {
    await api.patch(`/sessions/${sessionId}/join`);
  }
};

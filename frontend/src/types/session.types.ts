export interface SupervisionSession {
  id: string;
  studentId: string;
  studentName: string;
  supervisorId: string;
  supervisorName: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO String
  duration: number; // in minutes
  roomName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

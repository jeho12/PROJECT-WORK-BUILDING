export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM:SS
  checkOutTime?: string; // HH:MM:SS
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkInAddress: string;
  checkOutAddress?: string;
  status: 'completed' | 'partial' | 'absent';
}

export type UserRole = 'student' | 'supervisor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  profileComplete?: boolean;
}

export interface StudentProfile {
  matricNumber: string;
  department: string;
  faculty: string;
  level: '100' | '200' | '300' | '400' | '500';
  organizationName: string;
  organizationAddress: string;
  trainingStartDate: string;
  trainingEndDate: string;
  industrySupervisorName: string;
  orgLatitude?: number;
  orgLongitude?: number;
  passportUrl?: string;
}

export interface StudentDetail extends User {
  profile?: StudentProfile;
  supervisorId?: string;
  weeksSubmittedCount: number;
  totalWeeksCount: number;
  attendanceRate: number;
  status: 'active' | 'pending' | 'inactive';
  lastActivityDate?: string;
}

export interface SupervisorDetail extends User {
  department: string;
  assignedStudentsCount: number;
  status: 'active' | 'inactive';
}

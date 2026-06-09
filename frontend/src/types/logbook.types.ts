export type LogbookStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface DayEntry {
  id: string;
  weekId: string;
  date: string;
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeIn: string;
  timeOut: string;
  activity: string;
  evidenceUrl?: string;
  isLocked: boolean;
  submittedAt?: string;
}

export interface WeeklyReport {
  projectsWorkedOn: string;
  sectionOrDepartment: string;
  workDoneSummary: string;
  studentComment: string;
  submittedAt?: string;
}

export interface LogbookAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface LogbookWeek {
  id: string;
  studentId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: LogbookStatus;
  daysFilled: number; // 0 to 6
  dayEntries: DayEntry[];
  weeklyReport?: WeeklyReport;
  attachments: LogbookAttachment[];
  supervisorComment?: string;
  supervisorSignature?: string;
  supervisorRank?: string;
  reviewedAt?: string;
}

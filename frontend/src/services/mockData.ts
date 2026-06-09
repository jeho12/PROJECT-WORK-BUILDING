import { User, StudentProfile, StudentDetail, SupervisorDetail } from '@/types/user.types';
import { LogbookWeek, DayEntry } from '@/types/logbook.types';
import { AttendanceRecord } from '@/types/attendance.types';
import { SupervisionSession } from '@/types/session.types';
import { AIReview } from '@/types/review.types';

// Helper to write to local storage
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Seed keys
const KEYS = {
  USERS: 'siwes_users',
  PROFILES: 'siwes_profiles',
  WEEKS: 'siwes_weeks',
  ATTENDANCE: 'siwes_attendance',
  SESSIONS: 'siwes_sessions',
  AI_REVIEWS: 'siwes_ai_reviews',
  SYSTEM_EVENTS: 'siwes_system_events'
};

// System event logs
export interface SystemEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export const initializeMockDatabase = () => {
  if (typeof window === 'undefined') return;

  // 1. Users Seed
  if (!localStorage.getItem(KEYS.USERS)) {
    const initialUsers: User[] = [
      { id: 'u-admin-1', name: 'Dr. Samuel Adebayo', email: 'admin@anchor.edu.ng', role: 'admin' },
      { id: 'u-sup-1', name: 'Prof. Elizabeth Alao', email: 'supervisor@anchor.edu.ng', role: 'supervisor', profileComplete: true },
      { id: 'u-sup-2', name: 'Dr. John Kayode', email: 'j.kayode@anchor.edu.ng', role: 'supervisor', profileComplete: true },
      { id: 'u-stud-1', name: 'Olamide Johnson', email: 'student@anchor.edu.ng', role: 'student', profileComplete: true },
      { id: 'u-stud-2', name: 'Chioma Nwachukwu', email: 'c.nwachukwu@anchor.edu.ng', role: 'student', profileComplete: false },
      { id: 'u-stud-3', name: 'Babajide Cole', email: 'b.cole@anchor.edu.ng', role: 'student', profileComplete: true },
      { id: 'u-stud-4', name: 'Amina Bello', email: 'a.bello@anchor.edu.ng', role: 'student', profileComplete: false }
    ];
    setStorageItem(KEYS.USERS, initialUsers);
  }

  // 2. Profiles Seed
  if (!localStorage.getItem(KEYS.PROFILES)) {
    const initialProfiles: Record<string, StudentProfile> = {
      'u-stud-1': {
        matricNumber: 'AUL/CSC/22/1004',
        department: 'Computer Science',
        faculty: 'Science & Science Education',
        level: '400',
        organizationName: 'Chevron Nigeria Limited',
        organizationAddress: '2 Chevron Drive, Lekki, Lagos, Nigeria',
        trainingStartDate: '2026-05-01',
        trainingEndDate: '2026-10-30',
        industrySupervisorName: 'Engr. Festus Dada',
        orgLatitude: 6.4359,
        orgLongitude: 3.5303,
        passportUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop'
      },
      'u-stud-3': {
        matricNumber: 'AUL/CSC/22/1012',
        department: 'Computer Science',
        faculty: 'Science & Science Education',
        level: '400',
        organizationName: 'MTN Nigeria Plaza',
        organizationAddress: 'Falomo, Ikoyi, Lagos, Nigeria',
        trainingStartDate: '2026-05-01',
        trainingEndDate: '2026-10-30',
        industrySupervisorName: 'Mrs. Funke Opeke',
        orgLatitude: 6.4531,
        orgLongitude: 3.4244,
        passportUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop'
      }
    };
    setStorageItem(KEYS.PROFILES, initialProfiles);
  }

  // 3. Logbook Weeks Seed
  if (!localStorage.getItem(KEYS.WEEKS)) {
    const initialWeeks: LogbookWeek[] = [
      // Student 1 - Olamide Johnson
      {
        id: 'w-1',
        studentId: 'u-stud-1',
        weekNumber: 1,
        startDate: '2026-05-04',
        endDate: '2026-05-08',
        status: 'approved',
        daysFilled: 5,
        dayEntries: [
          { id: 'd-1-1', weekId: 'w-1', date: '2026-05-04', dayName: 'Monday', timeIn: '08:00', timeOut: '17:00', activity: 'Attended the company general onboarding session. Met with the team lead and discussed the architecture of the internal inventory tracker.', isLocked: true, submittedAt: '2026-05-04T17:05:00Z' },
          { id: 'd-1-2', weekId: 'w-1', date: '2026-05-05', dayName: 'Tuesday', timeIn: '08:15', timeOut: '16:45', activity: 'Configured local development environment. Installed Node.js, Next.js, and connected to the corporate staging environment database.', isLocked: true, submittedAt: '2026-05-05T17:00:00Z' },
          { id: 'd-1-3', weekId: 'w-1', date: '2026-05-06', dayName: 'Wednesday', timeIn: '08:00', timeOut: '17:30', activity: 'Created initial mockups for the dashboard. Developed custom components using Tailwind CSS and tested color variants.', isLocked: true, submittedAt: '2026-05-06T17:35:00Z' },
          { id: 'd-1-4', weekId: 'w-1', date: '2026-05-07', dayName: 'Thursday', timeIn: '07:55', timeOut: '17:00', activity: 'Implemented login form authorization checks. Integrated state persistence using Zustand, storing token in cookies.', isLocked: true, submittedAt: '2026-05-07T17:02:00Z' },
          { id: 'd-1-5', weekId: 'w-1', date: '2026-05-08', dayName: 'Friday', timeIn: '08:00', timeOut: '16:00', activity: 'Presented the initial dashboard layout to the team lead. Gathered feedback and planned adjustments for UI elements next week.', isLocked: true, submittedAt: '2026-05-08T16:05:00Z' }
        ],
        weeklyReport: {
          projectsWorkedOn: 'Internal Inventory Tracker',
          sectionOrDepartment: 'Software Engineering - IT Dept',
          workDoneSummary: 'Successfully completed onboarding, set up the development tools, built frontend prototypes, and implemented layout components.',
          studentComment: 'Great first week. The team has been very supportive and I learned about state persistence.'
        },
        attachments: [],
        supervisorComment: 'Excellent start, Olamide. You showed rapid understanding. Keep up the high standard.',
        supervisorSignature: 'Prof. Elizabeth Alao',
        supervisorRank: 'Professor / Dean of Science',
        reviewedAt: '2026-05-09T10:00:00Z'
      },
      {
        id: 'w-2',
        studentId: 'u-stud-1',
        weekNumber: 2,
        startDate: '2026-05-11',
        endDate: '2026-05-15',
        status: 'approved',
        daysFilled: 5,
        dayEntries: [
          { id: 'd-2-1', weekId: 'w-2', date: '2026-05-11', dayName: 'Monday', timeIn: '08:00', timeOut: '17:00', activity: 'Refactored state management. Replaced manual state handlers with TanStack Query hooks to streamline backend communication.', isLocked: true, submittedAt: '2026-05-11T17:01:00Z' },
          { id: 'd-2-2', weekId: 'w-2', date: '2026-05-12', dayName: 'Tuesday', timeIn: '08:05', timeOut: '17:10', activity: 'Optimized dashboard load speeds. Implemented image lazy-loading, added React loading skeletons, and eliminated render blocking.', isLocked: true, submittedAt: '2026-05-12T17:15:00Z' },
          { id: 'd-2-3', weekId: 'w-2', date: '2026-05-13', dayName: 'Wednesday', timeIn: '08:00', timeOut: '17:00', activity: 'Designed log entry validator constraints using Zod schemas. Handled error displays inside the user form interface.', isLocked: true, submittedAt: '2026-05-13T17:00:00Z' },
          { id: 'd-2-4', weekId: 'w-2', date: '2026-05-14', dayName: 'Thursday', timeIn: '08:00', timeOut: '17:00', activity: 'Built responsive grid layouts. Ensured smooth rendering on tablets and mobile screens with custom CSS breakpoints.', isLocked: true, submittedAt: '2026-05-14T17:02:00Z' },
          { id: 'd-2-5', weekId: 'w-2', date: '2026-05-15', dayName: 'Friday', timeIn: '08:00', timeOut: '16:00', activity: 'Integrated dropzone file upload fields. Verified uploads up to 2MB. Prepared weekly reports for review submissions.', isLocked: true, submittedAt: '2026-05-15T16:04:00Z' }
        ],
        weeklyReport: {
          projectsWorkedOn: 'Internal Inventory Tracker / Log system',
          sectionOrDepartment: 'Software Engineering - IT Dept',
          workDoneSummary: 'Integrated TanStack Query, optimized component load speed, built Zod validation logic, and added attachment dropzones.',
          studentComment: 'This week was focused on performance and security validation.'
        },
        attachments: [],
        supervisorComment: 'Very detailed technical entries. Impartial validation is a crucial trait in systems development. Approved.',
        supervisorSignature: 'Prof. Elizabeth Alao',
        supervisorRank: 'Professor / Dean of Science',
        reviewedAt: '2026-05-16T12:30:00Z'
      },
      {
        id: 'w-3',
        studentId: 'u-stud-1',
        weekNumber: 3,
        startDate: '2026-05-18',
        endDate: '2026-05-22',
        status: 'submitted',
        daysFilled: 5,
        dayEntries: [
          { id: 'd-3-1', weekId: 'w-3', date: '2026-05-18', dayName: 'Monday', timeIn: '08:00', timeOut: '17:00', activity: 'Configured Jitsi Meet integration setup. Designed full-viewport layouts and tested floating return-to-meeting controls.', isLocked: true, submittedAt: '2026-05-18T17:00:00Z' },
          { id: 'd-3-2', weekId: 'w-3', date: '2026-05-19', dayName: 'Tuesday', timeIn: '08:10', timeOut: '17:00', activity: 'Wrote location coordinate validation rules. Compared GPS outputs to placement settings and coded within 500m gates.', isLocked: true, submittedAt: '2026-05-19T17:03:00Z' },
          { id: 'd-3-3', weekId: 'w-3', date: '2026-05-20', dayName: 'Wednesday', timeIn: '08:00', timeOut: '17:00', activity: 'Built dynamic Recharts metrics for dashboard users. Represented attendance records using line graphs and calendars.', isLocked: true, submittedAt: '2026-05-20T17:00:00Z' },
          { id: 'd-3-4', weekId: 'w-3', date: '2026-05-21', dayName: 'Thursday', timeIn: '07:50', timeOut: '17:15', activity: 'Drafted export systems to download PDF reports. Configured page alignments and custom university header graphics.', isLocked: true, submittedAt: '2026-05-21T17:20:00Z' },
          { id: 'd-3-5', weekId: 'w-3', date: '2026-05-22', dayName: 'Friday', timeIn: '08:00', timeOut: '16:00', activity: 'Polished dashboard layout styling. Tested accessibility tags and audited page semantic structure for grading checks.', isLocked: true, submittedAt: '2026-05-22T16:01:00Z' }
        ],
        weeklyReport: {
          projectsWorkedOn: 'Jitsi Supervision Room / Report system',
          sectionOrDepartment: 'Software Engineering - IT Dept',
          workDoneSummary: 'Created the online session frame and location validation logic, formatted custom charts, and prepared PDF reports.',
          studentComment: 'Awaiting your feedback on the integration of location checking on the Jitsi screen.'
        },
        attachments: [
          { id: 'att-1', name: 'JitsiLocationCheckDoc.pdf', url: '#', size: 102450, uploadedAt: '2026-05-22T15:30:00Z' }
        ]
      },
      {
        id: 'w-4',
        studentId: 'u-stud-1',
        weekNumber: 4,
        startDate: '2026-05-25',
        endDate: '2026-05-29',
        status: 'draft',
        daysFilled: 2,
        dayEntries: [
          { id: 'd-4-1', weekId: 'w-4', date: '2026-05-25', dayName: 'Monday', timeIn: '08:00', timeOut: '17:00', activity: 'Researched natural language summarization techniques for log evaluation. Evaluated parsing logs to extract strengths.', isLocked: true, submittedAt: '2026-05-25T17:05:00Z' },
          { id: 'd-4-2', weekId: 'w-4', date: '2026-05-26', dayName: 'Tuesday', timeIn: '08:00', timeOut: '17:00', activity: 'Implemented simple local text analysis components. Parsed paragraphs to retrieve keywords matching engineering tasks.', isLocked: true, submittedAt: '2026-05-26T17:00:00Z' }
        ],
        attachments: []
      }
    ];
    setStorageItem(KEYS.WEEKS, initialWeeks);
  }

  // 4. Attendance Seed
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    const initialAttendance: AttendanceRecord[] = [
      { id: 'a-1', studentId: 'u-stud-1', date: '2026-05-18', checkInTime: '08:00:05', checkOutTime: '17:00:10', checkInLatitude: 6.4359, checkInLongitude: 3.5303, checkOutLatitude: 6.4359, checkOutLongitude: 3.5303, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' },
      { id: 'a-2', studentId: 'u-stud-1', date: '2026-05-19', checkInTime: '08:10:14', checkOutTime: '17:02:40', checkInLatitude: 6.4360, checkInLongitude: 3.5304, checkOutLatitude: 6.4360, checkOutLongitude: 3.5304, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' },
      { id: 'a-3', studentId: 'u-stud-1', date: '2026-05-20', checkInTime: '07:59:12', checkOutTime: '17:00:00', checkInLatitude: 6.4358, checkInLongitude: 3.5302, checkOutLatitude: 6.4358, checkOutLongitude: 3.5302, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' },
      { id: 'a-4', studentId: 'u-stud-1', date: '2026-05-21', checkInTime: '07:50:00', checkOutTime: undefined, checkInLatitude: 6.4359, checkInLongitude: 3.5303, checkInAddress: 'Chevron Nigeria Limited, Lekki', status: 'partial' },
      { id: 'a-5', studentId: 'u-stud-1', date: '2026-05-22', checkInTime: '08:00:00', checkOutTime: '16:00:00', checkInLatitude: 6.4359, checkInLongitude: 3.5303, checkOutLatitude: 6.4359, checkOutLongitude: 3.5303, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' },
      { id: 'a-6', studentId: 'u-stud-1', date: '2026-05-25', checkInTime: '08:00:00', checkOutTime: '17:00:00', checkInLatitude: 6.4359, checkInLongitude: 3.5303, checkOutLatitude: 6.4359, checkOutLongitude: 3.5303, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' },
      { id: 'a-7', studentId: 'u-stud-1', date: '2026-05-26', checkInTime: '08:02:10', checkOutTime: '17:01:05', checkInLatitude: 6.4361, checkInLongitude: 3.5305, checkOutLatitude: 6.4361, checkOutLongitude: 3.5305, checkInAddress: 'Chevron Nigeria Limited, Lekki', checkOutAddress: 'Chevron Nigeria Limited, Lekki', status: 'completed' }
    ];
    setStorageItem(KEYS.ATTENDANCE, initialAttendance);
  }

  // 5. Sessions Seed
  if (!localStorage.getItem(KEYS.SESSIONS)) {
    const initialSessions: SupervisionSession[] = [
      {
        id: 's-1',
        studentId: 'u-stud-1',
        studentName: 'Olamide Johnson',
        supervisorId: 'u-sup-1',
        supervisorName: 'Prof. Elizabeth Alao',
        title: 'SIWES Monthly Verification Interview',
        description: 'Review of Weeks 1-2, visual confirmation of student presence at CNL Lekki.',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        duration: 30,
        roomName: 'AUL-SIWES-CNL-1004',
        status: 'completed'
      },
      {
        id: 's-2',
        studentId: 'u-stud-1',
        studentName: 'Olamide Johnson',
        supervisorId: 'u-sup-1',
        supervisorName: 'Prof. Elizabeth Alao',
        title: 'Weekly Progress & Log Review Session',
        description: 'Verifying location coordinates and reviewing Jitsi Meet integration components.',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // in 2 hours
        duration: 15,
        roomName: 'AUL-SIWES-CNL-1004-W3',
        status: 'scheduled'
      }
    ];
    setStorageItem(KEYS.SESSIONS, initialSessions);
  }

  // 6. AI Reviews Seed
  if (!localStorage.getItem(KEYS.AI_REVIEWS)) {
    const initialAIReviews: AIReview[] = [
      {
        id: 'air-1',
        studentId: 'u-stud-1',
        studentName: 'Olamide Johnson',
        period: 'May 2026',
        summary: 'Student has completed 3 weeks of industrial training within Chevron IT Division. The logbook displays excellent technical detail, demonstrating continuous activity in setup, refactoring, validation logic, and frontend rendering metrics.',
        strengths: [
          'Excellent code-level documentation in daily entries',
          'Good architectural choices utilizing TanStack Query',
          'Consistent and precise GPS check-in times'
        ],
        weaknesses: [
          'Log entries focus entirely on coding; should document wider systems architecture checks',
          'One day missing check-out log in Week 3'
        ],
        recommendations: 'Continue refining systems performance testing. Focus on building and measuring layout metrics next week and document standard deployment frameworks.',
        rating: 8.5,
        generatedAt: '2026-05-24T18:00:00Z'
      }
    ];
    setStorageItem(KEYS.AI_REVIEWS, initialAIReviews);
  }

  // 7. System Events Seed
  if (!localStorage.getItem(KEYS.SYSTEM_EVENTS)) {
    const initialEvents: SystemEvent[] = [
      { id: 'ev-1', type: 'register', message: 'New Student: Olamide Johnson registered.', timestamp: '2026-05-01T09:12:00Z' },
      { id: 'ev-2', type: 'profile', message: 'Student Olamide Johnson completed SIWES profile.', timestamp: '2026-05-01T10:45:00Z' },
      { id: 'ev-3', type: 'logbook', message: 'Logbook Week 1 submitted by Olamide Johnson.', timestamp: '2026-05-08T16:05:00Z' },
      { id: 'ev-4', type: 'review', message: 'Logbook Week 1 approved by Prof. Elizabeth Alao.', timestamp: '2026-05-09T10:00:00Z' },
      { id: 'ev-5', type: 'logbook', message: 'Logbook Week 2 submitted by Olamide Johnson.', timestamp: '2026-05-15T16:04:00Z' },
      { id: 'ev-6', type: 'review', message: 'Logbook Week 2 approved by Prof. Elizabeth Alao.', timestamp: '2026-05-16T12:30:00Z' }
    ];
    setStorageItem(KEYS.SYSTEM_EVENTS, initialEvents);
  }
};
export { KEYS };

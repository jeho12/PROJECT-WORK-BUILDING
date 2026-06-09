import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';

export class SupervisorService {
  async getAssignedStudents(supervisorId: string) {
    return prisma.studentProfile.findMany({
      where: { supervisor_id: supervisorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            is_active: true,
          }
        }
      }
    });
  }

  async getStudentDetail(supervisorId: string, studentId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    if (profile.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    // Retrieve stats
    const totalWeeks = await prisma.logbookWeek.count({
      where: { user_id: studentId }
    });

    const pendingReviews = await prisma.logbookWeek.count({
      where: {
        user_id: studentId,
        status: 'submitted'
      }
    });

    const totalAttendance = await prisma.attendanceLog.count({
      where: { user_id: studentId }
    });

    return {
      profile,
      stats: {
        totalWeeks,
        pendingReviews,
        totalAttendance,
      }
    };
  }

  async getStudentWeeks(supervisorId: string, studentId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!profile || profile.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    return prisma.logbookWeek.findMany({
      where: { user_id: studentId },
      include: {
        weekly_report: {
          select: {
            review_status: true,
          }
        }
      },
      orderBy: { week_number: 'asc' },
    });
  }

  async getStudentWeekDetail(supervisorId: string, studentId: string, weekId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!profile || profile.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: {
        logbook_days: {
          include: {
            attachments: true,
            attendance_log: true,
          },
          orderBy: { date: 'asc' }
        },
        weekly_report: true,
      }
    });

    if (!week || week.user_id !== studentId) {
      throw new AppError('Week not found or mismatch', 404);
    }

    return week;
  }

  async reviewWeek(supervisorId: string, weekId: string, data: any) {
    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: {
        user: {
          include: { student_profile: true }
        },
        weekly_report: true,
      }
    });

    if (!week) {
      throw new AppError('Week not found', 404);
    }

    if (week.user.student_profile?.supervisor_id !== supervisorId) {
      throw new AppError('Unauthorized: This student is not assigned to you', 403);
    }

    if (!week.weekly_report) {
      throw new AppError('Student has not submitted a weekly report yet', 400);
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      // 1. Update weekly report
      const rep = await tx.weeklyReport.update({
        where: { logbook_week_id: weekId },
        data: {
          review_status: data.review_status === 'approved' ? 'approved' : 'rejected',
          reviewed_by: supervisorId,
          supervisor_comment: data.supervisor_comment,
          supervisor_name: data.supervisor_name,
          supervisor_rank: data.supervisor_rank,
          approved_at: data.review_status === 'approved' ? new Date() : null,
        }
      });

      // 2. Update week status to match
      await tx.logbookWeek.update({
        where: { id: weekId },
        data: {
          status: data.review_status === 'approved' ? 'approved' : 'rejected'
        }
      });

      return rep;
    });

    return updatedReport;
  }

  async getDashboardStats(supervisorId: string) {
    const students = await prisma.studentProfile.findMany({
      where: { supervisor_id: supervisorId },
      select: { user_id: true }
    });

    const studentIds = students.map(s => s.user_id);

    const totalStudents = studentIds.length;

    const pendingReviews = await prisma.logbookWeek.count({
      where: {
        user_id: { in: studentIds },
        status: 'submitted'
      }
    });

    const activeSessions = await prisma.supervisionSession.count({
      where: {
        supervisor_id: supervisorId,
        status: 'scheduled'
      }
    });

    const totalSubmissions = await prisma.logbookDay.count({
      where: {
        locked: true,
        logbook_week: {
          user_id: { in: studentIds }
        }
      }
    });

    return {
      totalStudents,
      pendingReviews,
      activeSessions,
      totalSubmissions,
    };
  }
}

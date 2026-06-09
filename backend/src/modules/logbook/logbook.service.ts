import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';
import { emailService } from '../../config/mailer';

export class LogbookService {
  async getWeeks(userId: string) {
    return prisma.logbookWeek.findMany({
      where: { user_id: userId },
      include: {
        logbook_days: {
          select: {
            id: true,
            date: true,
            day_name: true,
            locked: true,
          }
        },
        weekly_report: {
          select: {
            review_status: true,
          }
        }
      },
      orderBy: { week_number: 'asc' },
    });
  }

  async createWeek(userId: string, data: { week_start_date: Date; week_end_date: Date }) {
    // 1. Overlap validation
    const overlap = await prisma.logbookWeek.findFirst({
      where: {
        user_id: userId,
        OR: [
          {
            week_start_date: { lte: data.week_end_date },
            week_end_date: { gte: data.week_start_date },
          },
        ],
      },
    });

    if (overlap) {
      throw new AppError('Week dates overlap with an existing week', 409);
    }

    const weekCount = await prisma.logbookWeek.count({
      where: { user_id: userId },
    });

    // Auto-create 5 day entries (Mon-Fri) for the week
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    for (let i = 0; i < 5; i++) {
      const d = new Date(data.week_start_date);
      d.setDate(d.getDate() + i);
      
      // Ensure we format the date correctly
      d.setHours(0, 0, 0, 0);

      days.push({
        date: d,
        day_name: dayNames[i],
        locked: false,
      });
    }

    return prisma.logbookWeek.create({
      data: {
        user_id: userId,
        week_number: weekCount + 1,
        week_start_date: data.week_start_date,
        week_end_date: data.week_end_date,
        status: 'draft',
        logbook_days: {
          create: days,
        },
      },
      include: {
        logbook_days: true,
      },
    });
  }

  async getWeekDetail(weekId: string, userId: string, userRole: string) {
    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: {
        logbook_days: {
          include: {
            attachments: true,
            attendance_log: true,
          },
          orderBy: { date: 'asc' },
        },
        weekly_report: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            student_profile: true,
          }
        }
      },
    });

    if (!week) {
      throw new AppError('Week not found', 404);
    }

    // RBAC Checks
    if (userRole === 'student' && week.user_id !== userId) {
      throw new AppError('Unauthorized: You do not own this logbook week', 403);
    }

    if (userRole === 'supervisor') {
      const isAssigned = week.user.student_profile?.supervisor_id === userId;
      if (!isAssigned) {
        throw new AppError('Unauthorized: This student is not assigned to you', 403);
      }
    }

    return week;
  }

  async deleteWeek(weekId: string, userId: string) {
    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: { logbook_days: true },
    });

    if (!week) {
      throw new AppError('Week not found', 404);
    }

    if (week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (week.status !== 'draft') {
      throw new AppError('Cannot delete a week that has already been submitted or reviewed', 400);
    }

    const hasLockedDays = week.logbook_days.some(day => day.locked);
    if (hasLockedDays) {
      throw new AppError('Cannot delete a week containing submitted/locked day entries', 400);
    }

    await prisma.logbookWeek.delete({
      where: { id: weekId },
    });

    return { message: 'Week deleted successfully' };
  }

  async getDayDetail(dayId: string, userId: string, userRole: string) {
    const day = await prisma.logbookDay.findUnique({
      where: { id: dayId },
      include: {
        logbook_week: {
          include: {
            user: {
              include: { student_profile: true }
            }
          }
        },
        attachments: true,
      },
    });

    if (!day) {
      throw new AppError('Logbook day entry not found', 404);
    }

    if (userRole === 'student' && day.logbook_week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (userRole === 'supervisor' && day.logbook_week.user.student_profile?.supervisor_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return day;
  }

  async updateDay(dayId: string, userId: string, data: { time_in: string; time_out: string; activity: string }) {
    const day = await prisma.logbookDay.findUnique({
      where: { id: dayId },
      include: { logbook_week: true },
    });

    if (!day) {
      throw new AppError('Day not found', 404);
    }

    if (day.logbook_week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (day.locked) {
      throw new AppError('This entry has already been submitted and cannot be modified', 400);
    }

    return prisma.logbookDay.update({
      where: { id: dayId },
      data: {
        time_in: data.time_in,
        time_out: data.time_out,
        activity: data.activity,
      },
    });
  }

  async submitDay(dayId: string, userId: string, data: { time_in: string; time_out: string; activity: string }) {
    const day = await prisma.logbookDay.findUnique({
      where: { id: dayId },
      include: { logbook_week: true },
    });

    if (!day) {
      throw new AppError('Day not found', 404);
    }

    if (day.logbook_week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (day.locked) {
      throw new AppError('This entry has already been submitted and cannot be modified', 400);
    }

    const serverTimestamp = new Date();

    return prisma.logbookDay.update({
      where: { id: dayId },
      data: {
        time_in: data.time_in,
        time_out: data.time_out,
        activity: data.activity,
        locked: true,
        locked_at: serverTimestamp,
      },
    });
  }

  async uploadAttachment(dayId: string, userId: string, fileData: { url: string; name: string; type: string; size: number }) {
    const day = await prisma.logbookDay.findUnique({
      where: { id: dayId },
      include: { logbook_week: true },
    });

    if (!day) {
      throw new AppError('Day not found', 404);
    }

    if (day.logbook_week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (day.locked) {
      throw new AppError('Cannot add attachments to a locked day entry', 400);
    }

    return prisma.logbookAttachment.create({
      data: {
        logbook_day_id: dayId,
        file_url: fileData.url,
        file_name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size,
      },
    });
  }

  async deleteAttachment(attachId: string, userId: string) {
    const attachment = await prisma.logbookAttachment.findUnique({
      where: { id: attachId },
      include: {
        logbook_day: {
          include: { logbook_week: true },
        },
      },
    });

    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    if (attachment.logbook_day.logbook_week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (attachment.logbook_day.locked) {
      throw new AppError('Cannot delete attachments from a locked day entry', 400);
    }

    await prisma.logbookAttachment.delete({
      where: { id: attachId },
    });

    return { message: 'Attachment deleted successfully' };
  }

  async submitWeeklyReport(weekId: string, userId: string, data: { projects?: string | null; section_department?: string | null; student_comment?: string | null; work_done?: string | null }) {
    const week = await prisma.logbookWeek.findUnique({
      where: { id: weekId },
      include: {
        logbook_days: true,
      },
    });

    if (!week) {
      throw new AppError('Week not found', 404);
    }

    if (week.user_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Check that at least some days have locked activity
    const activeDays = week.logbook_days.filter(day => day.locked && day.activity);
    if (activeDays.length === 0) {
      throw new AppError('Cannot submit weekly report before locking at least one daily log activity', 400);
    }

    const report = await prisma.$transaction(async (tx) => {
      // Create or update weekly report
      const rep = await tx.weeklyReport.upsert({
        where: { logbook_week_id: weekId },
        create: {
          logbook_week_id: weekId,
          projects: data.projects,
          section_department: data.section_department,
          student_comment: data.student_comment,
          work_done: data.work_done,
          review_status: 'pending',
        },
        update: {
          projects: data.projects,
          section_department: data.section_department,
          student_comment: data.student_comment,
          work_done: data.work_done,
          review_status: 'pending',
          submitted_at: new Date(),
        },
      });

      // Update week status to submitted
      await tx.logbookWeek.update({
        where: { id: weekId },
        data: { status: 'submitted' },
      });

      return rep;
    });

    // Send email notification to supervisor
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: { supervisor: true, user: true },
    });

    if (studentProfile?.supervisor?.email) {
      emailService.sendWeeklyReportNotification(
        studentProfile.supervisor.email,
        studentProfile.user.name
      );
    }

    return report;
  }
}

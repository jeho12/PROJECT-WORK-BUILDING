import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';
import { calculateHaversineDistance } from '../../shared/geoUtils';
import { env } from '../../config/env';

export class AttendanceService {
  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  async checkIn(userId: string, data: any, ipAddress: string) {
    const { start, end } = this.getTodayRange();

    // 1. Check if already checked in today
    const existing = await prisma.attendanceLog.findFirst({
      where: {
        user_id: userId,
        date: { gte: start, lte: end }
      }
    });

    if (existing?.check_in_time) {
      throw new AppError('Already checked in today', 400);
    }

    // 2. Get student's registered org coordinates
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId }
    });

    if (!profile?.organization_latitude || !profile?.organization_longitude) {
      throw new AppError('Complete your profile with organization location first', 400);
    }

    // 3. Calculate GPS distance
    const distance = calculateHaversineDistance(
      { lat: data.latitude, lng: data.longitude },
      { lat: profile.organization_latitude, lng: profile.organization_longitude }
    );

    // Verify if within allowed radius
    const isVerified = distance <= Number(env.MAX_DISTANCE_METERS);

    // Ensure the day log isn't already linked to another attendance
    const duplicateDay = await prisma.attendanceLog.findUnique({
      where: { logbook_day_id: data.logbook_day_id }
    });
    if (duplicateDay) {
      throw new AppError('This day entry is already associated with an attendance log', 400);
    }

    // 4. Record Check-In
    return prisma.attendanceLog.create({
      data: {
        user_id: userId,
        logbook_day_id: data.logbook_day_id,
        date: new Date(),
        check_in_time: new Date(),
        check_in_latitude: data.latitude,
        check_in_longitude: data.longitude,
        check_in_address: data.address,
        ip_address: ipAddress,
        device_info: data.device_info || 'Unknown',
      }
    });
  }

  async checkOut(userId: string, data: any) {
    const { start, end } = this.getTodayRange();

    // 1. Get today's log
    const log = await prisma.attendanceLog.findFirst({
      where: {
        user_id: userId,
        date: { gte: start, lte: end }
      }
    });

    if (!log) {
      throw new AppError('Must check in first before checking out', 400);
    }

    if (log.check_out_time) {
      throw new AppError('Already checked out today', 400);
    }

    // 2. Calculate coordinates distance
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId }
    });

    if (!profile?.organization_latitude || !profile?.organization_longitude) {
      throw new AppError('Complete your profile with organization location first', 400);
    }

    const distance = calculateHaversineDistance(
      { lat: data.latitude, lng: data.longitude },
      { lat: profile.organization_latitude, lng: profile.organization_longitude }
    );

    // 3. Update check-out
    return prisma.attendanceLog.update({
      where: { id: log.id },
      data: {
        check_out_time: new Date(),
        check_out_latitude: data.latitude,
        check_out_longitude: data.longitude,
        check_out_address: data.address,
      }
    });
  }

  async getTodayStatus(userId: string) {
    const { start, end } = this.getTodayRange();
    return prisma.attendanceLog.findFirst({
      where: {
        user_id: userId,
        date: { gte: start, lte: end }
      }
    });
  }

  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.attendanceLog.findMany({
        where: { user_id: userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendanceLog.count({ where: { user_id: userId } }),
    ]);

    return { logs, total };
  }

  async getStats(userId: string) {
    const logs = await prisma.attendanceLog.findMany({
      where: { user_id: userId },
      include: {
        user: {
          include: { student_profile: true }
        }
      }
    });

    const total = logs.length;
    if (total === 0) {
      return {
        totalCheckins: 0,
        verifiedCheckins: 0,
        attendanceRate: 0,
      };
    }

    let verified = 0;
    logs.forEach(log => {
      const profile = log.user.student_profile;
      if (profile?.organization_latitude && log.check_in_latitude) {
        const distance = calculateHaversineDistance(
          { lat: log.check_in_latitude, lng: log.check_in_longitude || 0 },
          { lat: profile.organization_latitude, lng: profile.organization_longitude || 0 }
        );
        if (distance <= Number(env.MAX_DISTANCE_METERS)) {
          verified++;
        }
      }
    });

    // Assume 12 weeks of training (60 working days) for attendance percentage context
    const expectedDays = 60;
    const rate = Math.round((verified / expectedDays) * 100);

    return {
      totalCheckins: total,
      verifiedCheckins: verified,
      attendanceRate: Math.min(100, rate),
    };
  }

  async getStudentAttendance(supervisorId: string, studentId: string) {
    // Check allocation
    const profile = await prisma.studentProfile.findFirst({
      where: { user_id: studentId, supervisor_id: supervisorId }
    });

    if (!profile) {
      throw new AppError('Unauthorized: Student not assigned to you', 403);
    }

    return prisma.attendanceLog.findMany({
      where: { user_id: studentId },
      orderBy: { date: 'desc' }
    });
  }
}

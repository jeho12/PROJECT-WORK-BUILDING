import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';
import { generateJitsiRoom } from '../../shared/jitsiUtils';
import { calculateHaversineDistance } from '../../shared/geoUtils';
import { emailService } from '../../config/mailer';
import { env } from '../../config/env';

export class SessionsService {
  async scheduleSession(supervisorId: string, data: any) {
    // 1. Verify student is assigned to this supervisor
    const profile = await prisma.studentProfile.findFirst({
      where: { user_id: data.student_id, supervisor_id: supervisorId },
      include: { user: true }
    });

    if (!profile) {
      throw new AppError('Student is not assigned to you', 403);
    }

    // 2. Generate unique Jitsi room name
    const roomName = generateJitsiRoom(supervisorId, data.student_id);
    const joinUrl = `https://${env.JITSI_DOMAIN}/${roomName}`;

    // 3. Create session record
    const session = await prisma.supervisionSession.create({
      data: {
        supervisor_id: supervisorId,
        student_id: data.student_id,
        title: data.title,
        description: data.description || '',
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        room_name: roomName,
        join_url: joinUrl,
        status: 'scheduled',
      },
      include: {
        supervisor: { select: { name: true, email: true } },
        student: { select: { name: true, email: true } }
      }
    });

    // 4. Send email notification asynchronously
    emailService.sendSessionNotification({
      studentEmail: profile.user.email,
      studentName: profile.user.name,
      supervisorName: session.supervisor.name,
      title: session.title,
      scheduledAt: session.scheduled_at,
      joinUrl: session.join_url,
    });

    return session;
  }

  async getSupervisorSessions(supervisorId: string) {
    return prisma.supervisionSession.findMany({
      where: { supervisor_id: supervisorId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            student_profile: { select: { matric_number: true, department: true } }
          }
        }
      },
      orderBy: { scheduled_at: 'asc' }
    });
  }

  async getStudentSessions(studentId: string) {
    return prisma.supervisionSession.findMany({
      where: { student_id: studentId },
      include: {
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { scheduled_at: 'asc' }
    });
  }

  async getSessionDetail(sessionId: string, userId: string, role: string) {
    const session = await prisma.supervisionSession.findUnique({
      where: { id: sessionId },
      include: {
        supervisor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } }
      }
    });

    if (!session) {
      throw new AppError('Supervision session not found', 404);
    }

    if (role === 'student' && session.student_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (role === 'supervisor' && session.supervisor_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return session;
  }

  async verifyLocation(sessionId: string, studentId: string, coords: { latitude: number; longitude: number }) {
    const session = await prisma.supervisionSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.student_id !== studentId) {
      throw new AppError('Session not found', 404);
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!profile?.organization_latitude || !profile?.organization_longitude) {
      throw new AppError('Organization location not set in student profile', 400);
    }

    const distance = calculateHaversineDistance(
      { lat: coords.latitude, lng: coords.longitude },
      { lat: profile.organization_latitude, lng: profile.organization_longitude }
    );

    const verified = distance <= Number(env.MAX_DISTANCE_METERS);

    if (verified) {
      await prisma.supervisionSession.update({
        where: { id: sessionId },
        data: { location_verified: true }
      });
    }

    return {
      verified,
      distance_meters: Math.round(distance),
      message: verified
        ? 'Location verified. You may join the session.'
        : `You are ${Math.round(distance)}m away from your registered placement. You must be within ${env.MAX_DISTANCE_METERS}m to verify and join.`
    };
  }

  async joinSession(sessionId: string, userId: string, role: string) {
    const session = await prisma.supervisionSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (role === 'student') {
      if (session.student_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      if (!session.location_verified) {
        throw new AppError('GPS coordinates must be verified before joining the virtual consultation', 400);
      }

      return prisma.supervisionSession.update({
        where: { id: sessionId },
        data: {
          student_joined_at: new Date(),
          status: session.supervisor_joined_at ? 'completed' : 'scheduled'
        }
      });
    } else if (role === 'supervisor') {
      if (session.supervisor_id !== userId) {
        throw new AppError('Unauthorized', 403);
      }

      return prisma.supervisionSession.update({
        where: { id: sessionId },
        data: {
          supervisor_joined_at: new Date(),
          status: session.student_joined_at ? 'completed' : 'scheduled'
        }
      });
    }

    throw new AppError('Forbidden', 403);
  }

  async cancelSession(sessionId: string, supervisorId: string) {
    const session = await prisma.supervisionSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.supervisor_id !== supervisorId) {
      throw new AppError('Session not found or unauthorized', 404);
    }

    return prisma.supervisionSession.update({
      where: { id: sessionId },
      data: {
        status: 'cancelled'
      }
    });
  }
}

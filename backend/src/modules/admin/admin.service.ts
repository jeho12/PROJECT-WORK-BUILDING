import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';

export class AdminService {
  async getDashboardStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalSupervisors,
      activeUsers,
      pendingReviews,
      entriesThisMonth,
      aiReviews,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'supervisor' } }),
      prisma.user.count({ where: { is_active: true } }),
      prisma.weeklyReport.count({ where: { review_status: 'pending' } }),
      prisma.logbookDay.count({
        where: {
          locked: true,
          created_at: { gte: startOfMonth }
        }
      }),
      prisma.aIReview.count(),
    ]);

    return {
      totalStudents,
      totalSupervisors,
      activeUsers,
      pendingReviews,
      entriesThisMonth,
      aiReviews,
    };
  }

  async createSupervisor(data: any) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new AppError('Email is already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'supervisor',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
  }

  async listSupervisors(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [supervisors, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: { role: 'supervisor' },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
          created_at: true,
          supervised_students: {
            select: { id: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'supervisor' } }),
    ]);

    return { supervisors, total };
  }

  async assignStudent(studentId: string, supervisorId: string | null) {
    // Verify student profile exists
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: studentId }
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    if (supervisorId) {
      // Verify supervisor exists
      const supervisor = await prisma.user.findUnique({
        where: { id: supervisorId }
      });

      if (!supervisor || supervisor.role !== 'supervisor') {
        throw new AppError('Supervisor not found', 404);
      }
    }

    return prisma.studentProfile.update({
      where: { user_id: studentId },
      data: { supervisor_id: supervisorId },
      include: {
        user: { select: { name: true, email: true } },
        supervisor: { select: { name: true, email: true } }
      }
    });
  }

  async listAssignments() {
    return prisma.studentProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        supervisor: { select: { name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async listStudents(page: number, limit: number, department?: string, faculty?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (department) whereClause.department = department;
    if (faculty) whereClause.faculty = faculty;

    const [students, total] = await prisma.$transaction([
      prisma.studentProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              is_active: true,
              logbook_weeks: {
                select: {
                  status: true
                }
              },
              attendance_logs: {
                select: {
                  id: true
                }
              }
            }
          },
          supervisor: {
            select: {
              name: true,
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studentProfile.count({ where: whereClause }),
    ]);

    return { students, total };
  }

  async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async toggleUserActive(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { is_active: !user.is_active },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
      }
    });
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete logic: deactivate user
    return prisma.user.update({
      where: { id: userId },
      data: { is_active: false },
      select: {
        id: true,
        name: true,
        is_active: true,
      }
    });
  }

  async getAnalytics() {
    // Department breakdown
    const rawDepartments = await prisma.studentProfile.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
    });

    const departmentBreakdown = rawDepartments.map(item => ({
      name: item.department,
      value: item._count.id,
    }));

    // Generate simulated weekly submissions for past 6 weeks (for chart representation)
    const weeklySubmissions = [
      { name: 'Week 1', submissions: 15 },
      { name: 'Week 2', submissions: 28 },
      { name: 'Week 3', submissions: 42 },
      { name: 'Week 4', submissions: 35 },
      { name: 'Week 5', submissions: 50 },
      { name: 'Week 6', submissions: 58 },
    ];

    return {
      departmentBreakdown,
      weeklySubmissions,
    };
  }
}

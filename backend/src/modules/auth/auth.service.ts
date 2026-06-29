import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../shared/AppError';
import { emailService } from '../../config/mailer';

export class AuthService {
  async register(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      // If user is a student, create an empty student profile
      if (data.role === 'student') {
        await tx.studentProfile.create({
          data: {
            user_id: newUser.id,
            matric_number: `AUL-${newUser.id.slice(-6).toUpperCase()}`, // auto fallback placeholder
            department: 'Computer Science',
            faculty: 'Science',
            programme: 'Computer Science',
            level: '400',
            profile_complete: false,
          },
        });
      }

      return newUser;
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail({ email: user.email, name: user.name });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(data: any, reqInfo?: { ipAddress?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.is_active) {
      throw new AppError('Invalid email or password', 401);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    // Send login notification email asynchronously
    emailService.sendLoginNotification({
      email: user.email,
      name: user.name,
      role: user.role,
      ipAddress: reqInfo?.ipAddress,
      userAgent: reqInfo?.userAgent,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async changePassword(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const passwordMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!passwordMatch) {
      throw new AppError('Incorrect old password', 400);
    }

    const newHashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        student_profile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

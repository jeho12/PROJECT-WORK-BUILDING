import { prisma } from '../../config/database';
import { AppError } from '../../shared/AppError';

export class ProfileService {
  private checkRequiredFields(profile: any): boolean {
    const required = [
      profile.matric_number,
      profile.department,
      profile.faculty,
      profile.level,
      profile.organization_name,
      profile.organization_address,
      profile.organization_latitude,
      profile.organization_longitude,
      profile.training_start_date,
      profile.training_end_date,
      profile.passport_path,
    ];
    
    return required.every(field => field !== undefined && field !== null && field !== '');
  }

  async getProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        supervisor: {
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

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    const updatedData = { ...data };

    const mergedProfile = { ...profile, ...updatedData };
    const complete = this.checkRequiredFields(mergedProfile);

    return prisma.studentProfile.update({
      where: { user_id: userId },
      data: {
        ...updatedData,
        profile_complete: complete,
      },
    });
  }

  async updatePassport(userId: string, passportPath: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    const mergedProfile = { ...profile, passport_path: passportPath };
    const complete = this.checkRequiredFields(mergedProfile);

    return prisma.studentProfile.update({
      where: { user_id: userId },
      data: {
        passport_path: passportPath,
        profile_complete: complete,
      },
    });
  }

  async setLocation(userId: string, data: { organization_latitude: number; organization_longitude: number; organization_address: string }) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    const mergedProfile = {
      ...profile,
      organization_latitude: data.organization_latitude,
      organization_longitude: data.organization_longitude,
      organization_address: data.organization_address,
    };
    const complete = this.checkRequiredFields(mergedProfile);

    return prisma.studentProfile.update({
      where: { user_id: userId },
      data: {
        organization_latitude: data.organization_latitude,
        organization_longitude: data.organization_longitude,
        organization_address: data.organization_address,
        profile_complete: complete,
      },
    });
  }
}

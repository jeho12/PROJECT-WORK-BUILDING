import { StudentProfile } from '@/types/user.types';
import api from '@/lib/axios';

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
    : 'http://localhost:5001';
};

const mapBackendProfileToFrontend = (p: any): StudentProfile | null => {
  if (!p) return null;
  const baseUrl = getBackendBaseUrl();
  return {
    matricNumber: p.matric_number,
    department: p.department,
    faculty: p.faculty,
    level: p.level,
    organizationName: p.organization_name || '',
    organizationAddress: p.organization_address || '',
    orgLatitude: p.organization_latitude || undefined,
    orgLongitude: p.organization_longitude || undefined,
    industrySupervisorName: p.industry_supervisor_name || '',
    trainingStartDate: p.training_start_date ? new Date(p.training_start_date).toISOString().split('T')[0] : '',
    trainingEndDate: p.training_end_date ? new Date(p.training_end_date).toISOString().split('T')[0] : '',
    passportUrl: p.passport_path ? (p.passport_path.startsWith('http') ? p.passport_path : `${baseUrl}${p.passport_path}`) : undefined
  };
};

const mapFrontendProfileToBackend = (p: StudentProfile) => {
  return {
    matric_number: p.matricNumber,
    department: p.department,
    faculty: p.faculty,
    level: p.level,
    organization_name: p.organizationName,
    organization_address: p.organizationAddress,
    industry_supervisor_name: p.industrySupervisorName,
    training_start_date: p.trainingStartDate ? new Date(p.trainingStartDate).toISOString() : undefined,
    training_end_date: p.trainingEndDate ? new Date(p.trainingEndDate).toISOString() : undefined,
    organization_latitude: p.orgLatitude,
    organization_longitude: p.orgLongitude
  };
};

export const studentService = {
  getProfile: async (studentId: string): Promise<StudentProfile | null> => {
    // backend endpoint gets profile of the currently logged in user
    const response = await api.get('/profile');
    return mapBackendProfileToFrontend(response.data.data);
  },

  updateProfile: async (studentId: string, profileData: StudentProfile): Promise<StudentProfile> => {
    const payload = mapFrontendProfileToBackend(profileData);
    const response = await api.post('/profile', payload);
    return mapBackendProfileToFrontend(response.data.data)!;
  },

  uploadPassport: async (studentId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('passport', file);
    const response = await api.post('/profile/passport', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const profile = response.data.data;
    const baseUrl = getBackendBaseUrl();
    return profile.passport_path.startsWith('http') ? profile.passport_path : `${baseUrl}${profile.passport_path}`;
  }
};

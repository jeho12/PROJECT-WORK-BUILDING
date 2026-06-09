import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema';
import { User } from '@/types/user.types';
import api from '@/lib/axios';

export const authService = {
  login: async (data: LoginInput): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterInput): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  }
};

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, login: storeLogin, logout: storeLogout, isAuthenticated, role } = useAuthStore();

  const login = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      storeLogin(response.user, response.token);
      toast.success(`Welcome back, ${response.user.name}!`);
      
      // Role based redirect
      router.replace(`/${response.user.role}`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  return {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };
}

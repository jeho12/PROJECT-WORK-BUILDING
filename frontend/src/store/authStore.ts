import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      login: (user, token) => {
        if (typeof window !== 'undefined') {
          document.cookie = `siwes_token=${token}; path=/; max-age=86400`;
          document.cookie = `siwes_role=${user.role}; path=/; max-age=86400`;
        }
        set({
          user,
          token,
          isAuthenticated: true,
          role: user.role
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = `siwes_token=; path=/; max-age=0`;
          document.cookie = `siwes_role=; path=/; max-age=0`;
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null
        });
      },
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
    }),
    {
      name: 'anchor-siwes-auth',
    }
  )
);

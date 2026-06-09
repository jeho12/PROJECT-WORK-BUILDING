'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/user.types';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { role, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

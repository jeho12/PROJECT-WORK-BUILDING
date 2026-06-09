'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth.schema';
import { useAuth } from '@/hooks/useAuth';
import { Landmark, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex p-3 bg-blue-50 text-primary rounded-2xl mb-4 border border-blue-100">
          <Landmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Student Registration</h2>
        <p className="text-sm text-text-secondary mt-1">SIWES Account Sign-Up</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Olamide Johnson"
            {...register('name')}
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary ${
              errors.name ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/25' : ''
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            School Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. o.johnson@anchor.edu.ng"
            {...register('email')}
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary ${
              errors.email ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/25' : ''
            }`}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Password (Min 6 chars)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary ${
                errors.password ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/25' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-border-custom outline-none rounded-lg focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text-primary ${
              errors.confirmPassword ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/25' : ''
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-light disabled:bg-blue-300 rounded-lg shadow-sm transition-all focus:outline-none"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          <span>{loading ? 'Registering...' : 'Create Account'}</span>
        </button>
      </form>

      {/* Login link */}
      <div className="text-center pt-2">
        <p className="text-xs text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-light transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

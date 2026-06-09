'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth.schema';
import { useAuth } from '@/hooks/useAuth';
import { Landmark, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex p-3 bg-blue-50 text-primary rounded-2xl mb-4 border border-blue-100">
          <Landmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Portal Sign-in</h2>
        <p className="text-sm text-text-secondary mt-1">SIWES Management, Evaluation & Analytics</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Institutional Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. student@anchor.edu.ng"
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
            Security Password
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
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>
      </form>

      {/* Registration link */}
      <div className="text-center pt-2">
        <p className="text-xs text-text-secondary">
          Student self-registration?{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary-light transition-colors">
            Register Student
          </Link>
        </p>
      </div>

      {/* Demo helper logins */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Demo Access Credentials</h4>
        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between border-b border-slate-200/60 pb-1">
            <span>Student:</span>
            <span className="font-mono text-text-primary">student@anchor.edu.ng</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-1">
            <span>Supervisor (Faculty):</span>
            <span className="font-mono text-text-primary">supervisor@anchor.edu.ng</span>
          </div>
          <div className="flex justify-between">
            <span>Portal Admin:</span>
            <span className="font-mono text-text-primary">admin@anchor.edu.ng</span>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-semibold">Password for all mock accounts: <span className="font-mono text-text-secondary">password</span></p>
        </div>
      </div>
    </div>
  );
}

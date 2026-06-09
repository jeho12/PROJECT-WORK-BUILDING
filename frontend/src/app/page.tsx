'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, MapPin, BrainCircuit, Video, ArrowRight, ShieldCheck, Landmark } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header navbar */}
      <header className="h-20 bg-white border-b border-border-custom px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <Landmark className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary leading-tight tracking-wider">ANCHOR UNIVERSITY</span>
            <span className="text-xs text-text-secondary">SIWES Portal</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-text-primary hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
          >
            Access Portal
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg shadow-sm transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative bg-white py-20 sm:py-32 px-6 sm:px-12 overflow-hidden border-b border-border-custom">
          {/* Decorative geometric patterns */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200 mb-6 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Tripartite Industrial Training Management
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-tight leading-none mb-6">
              Modernizing SIWES at <span className="text-primary">Anchor University</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-10">
              Replacing paper logbooks with a secure, cloud-based digital workspace. Empowering students, supervisors, and admins with GPS check-ins, AI analysis, and online supervision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-light transition-all rounded-xl shadow-md gap-2"
              >
                <span>Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-text-primary bg-slate-100 hover:bg-slate-200 transition-all rounded-xl gap-2"
              >
                <span>Supervisor Access</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-4">Core System Features</h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Designed to optimize industrial internship monitoring, simplify compliance, and enrich students progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-border-custom p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 text-primary w-fit rounded-xl mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Digital Logbooks</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Log daily activities directly into your portal. Submit weekly summaries and upload evidence securely.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-border-custom p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-secondary w-fit rounded-xl mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-3">GPS Attendance</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Punch in and out daily with automatic browser coordinate stamp, validating placement presence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-border-custom p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-amber-50 text-accent w-fit rounded-xl mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-3">AI-Powered Summarization</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Supervisors generate AI reviews highlighting strengths, weaknesses, and scoring progress.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-border-custom p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-50 text-purple-600 w-fit rounded-xl mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Online Supervision</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Schedule and launch Jitsi Meet video consultations from the dashboard with location boundary gates.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-custom py-12 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-text-secondary text-xs sm:text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} Anchor University, Lagos. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-primary cursor-pointer">Support Desk</span>
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card-grid' | 'table' | 'profile' | 'single-card';
  count?: number;
}

export default function LoadingSkeleton({ type = 'single-card', count = 3 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card-grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: count * 2 }).map((_, idx) => (
              <div key={idx} className="bg-surface border border-border-custom rounded-xl p-5 h-32 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-1/4 self-end"></div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className="bg-surface border border-border-custom rounded-xl overflow-hidden animate-pulse">
            <div className="px-6 py-4 border-b border-border-custom bg-slate-50 flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="divide-y divide-border-custom px-6">
              {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                  <div className="h-8 bg-slate-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-surface border border-border-custom rounded-xl p-6 space-y-6">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      case 'single-card':
      default:
        return (
          <div className="bg-surface border border-border-custom rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5"></div>
            </div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
}

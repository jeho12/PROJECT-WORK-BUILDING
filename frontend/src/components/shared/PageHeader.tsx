import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-border-custom gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-3">{actions}</div>}
    </div>
  );
}

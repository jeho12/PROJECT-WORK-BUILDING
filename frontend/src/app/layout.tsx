import type { Metadata } from 'next';
import Providers from '@/components/shared/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anchor University SIWES Portal',
  description: 'Cloud-Based Industrial Work Experience Scheme (SIWES) Portal for Anchor University, Nigeria.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-text-primary flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

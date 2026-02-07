'use client';

import AuthProvider from '@/components/dashboard/AuthProvider';
import AuthGuard from '@/components/dashboard/AuthGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ThemeProvider from '@/components/dashboard/ThemeProvider';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}

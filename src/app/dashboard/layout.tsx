'use client';

import AuthProvider from '@/components/dashboard/AuthProvider';
import AuthGuard from '@/components/dashboard/AuthGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </AuthGuard>
    </AuthProvider>
  );
}

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { canAccessPage } from '@/lib/roles';
import WelcomeModal from './WelcomeModal';
import PhoneRequiredModal from './PhoneRequiredModal';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !member) {
      window.location.href = '/login';
    }
  }, [loading, member]);

  // Route guard — redirect unauthorized page access
  useEffect(() => {
    if (!member || !pathname) return;
    const chairPosition = member.chair_position;
    if (!canAccessPage(member.role, chairPosition, pathname)) {
      router.replace('/dashboard');
    }
  }, [member, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dash-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-dash-text-muted uppercase tracking-[0.2em]">Loading</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  if (member.needs_onboarding) {
    return <WelcomeModal />;
  }

  return (
    <>
      {member.needs_phone_verification && <PhoneRequiredModal />}
      {children}
    </>
  );
}

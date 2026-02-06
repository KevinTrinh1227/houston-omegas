'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import PhoneRequiredModal from './PhoneRequiredModal';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { member, loading } = useAuth();

  useEffect(() => {
    if (!loading && !member) {
      window.location.href = '/login';
    }
  }, [loading, member]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Loading</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <>
      {member.needs_phone && <PhoneRequiredModal />}
      {children}
    </>
  );
}

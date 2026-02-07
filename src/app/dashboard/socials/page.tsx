'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/analytics'); }, [router]);
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" />
    </div>
  );
}

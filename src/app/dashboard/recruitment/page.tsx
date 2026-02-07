'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecruitmentRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/submissions?tab=recruitment'); }, [router]);
  return null;
}

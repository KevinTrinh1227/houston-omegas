'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendanceRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/events'); }, [router]);
  return null;
}

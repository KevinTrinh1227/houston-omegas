'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InquiriesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/submissions?tab=inquiries'); }, [router]);
  return null;
}

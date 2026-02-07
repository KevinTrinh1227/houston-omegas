'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/analytics?tab=social'); }, [router]);
  return null;
}

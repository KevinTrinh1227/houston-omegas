'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangelogRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard'); }, [router]);
  return null;
}

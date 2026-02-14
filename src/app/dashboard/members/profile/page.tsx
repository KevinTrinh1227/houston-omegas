'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ProfileContent() {
  const params = useSearchParams();
  const id = params.get('id');

  if (!id) return <p className="text-white/50 p-8">No member selected</p>;

  return (
    <div className="p-6">
      <p className="text-white/70">Member profile for: {id}</p>
      <p className="text-white/40 text-sm mt-2">Full profile view coming soon</p>
    </div>
  );
}

export default function MemberProfilePage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

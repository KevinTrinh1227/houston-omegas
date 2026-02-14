'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { isExecRole } from '@/lib/roles';
import MemberProfile from '@/components/members/MemberProfile';
import MemberEditForm, { type MemberFormData } from '@/components/members/MemberEditForm';
import Modal from '@/components/ui/Modal';
import type { MemberWithDetails, AvailableChair } from '@/lib/member-types';
import { Loader2 } from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const { member: currentMember } = useAuth();
  const { toast } = useToast();
  const isExec = isExecRole(currentMember?.role || '');
  const isSelf = currentMember?.id === id;

  const [member, setMember] = useState<MemberWithDetails | null>(null);
  const [availableChairs, setAvailableChairs] = useState<AvailableChair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/members/${id}`, { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Member not found');
        } else {
          setError('Failed to load member');
        }
        return;
      }
      const data = await res.json();

      // Fetch member chairs
      try {
        const chairsRes = await fetch(`/api/members/${id}/chairs`, { credentials: 'include' });
        if (chairsRes.ok) {
          const chairsData = await chairsRes.json();
          data.chairs = chairsData.map((c: { chair_name: string }) => c.chair_name);
        } else {
          data.chairs = data.chair_position ? [data.chair_position] : [];
        }
      } catch {
        data.chairs = data.chair_position ? [data.chair_position] : [];
      }

      // Try to fetch activity (may not exist)
      try {
        const activityRes = await fetch(`/api/activity?member_id=${id}&limit=10`, { credentials: 'include' });
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          data.recent_activity = activityData;
        }
      } catch {
        data.recent_activity = [];
      }

      setMember(data);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchChairs = useCallback(async () => {
    try {
      const res = await fetch('/api/chairs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAvailableChairs(data);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchMember();
    fetchChairs();
  }, [fetchMember, fetchChairs]);

  const handleAction = async (action: string) => {
    if (!member) return;
    const name = `${member.first_name} ${member.last_name}`;

    if (action === 'resend') {
      try {
        const res = await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: member.id }),
        });
        if (res.ok) {
          toast(`Invite sent to ${member.email}`, 'success');
        } else {
          const data = await res.json();
          toast(data.error || 'Failed to send invite', 'error');
        }
      } catch {
        toast('Connection error', 'error');
      }
    }

    if (action === 'deactivate') {
      if (!confirm(`Deactivate ${name}? They will be logged out immediately.`)) return;
      try {
        await fetch(`/api/members/${member.id}`, { method: 'DELETE', credentials: 'include' });
        toast(`${name} has been deactivated`, 'success');
        fetchMember();
      } catch {
        toast('Failed to deactivate', 'error');
      }
    }

    if (action === 'reactivate') {
      if (!confirm(`Reactivate ${name}?`)) return;
      try {
        await fetch(`/api/members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: true, role: 'active' }),
        });
        toast(`${name} has been reactivated`, 'success');
        fetchMember();
      } catch {
        toast('Failed to reactivate', 'error');
      }
    }
  };

  const handleEditSubmit = async (data: MemberFormData) => {
    if (!member) return;

    try {
      // Update member fields
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          instagram: data.instagram,
          discord_id: data.discord_id,
          class_year: data.class_year,
          major: data.major,
          role: data.role,
          is_active: data.membership_status === 'active',
          eboard_position: data.eboard_position,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update member');
      }

      // Update chairs
      if (isExec && !isSelf) {
        await fetch(`/api/members/${member.id}/chairs`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ chairs: data.chairs }),
        });
      }

      toast('Member updated', 'success');
      setShowEditModal(false);
      fetchMember();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
      throw err;
    }
  };

  if (!id) {
    return (
      <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
        <p className="text-dash-text-secondary">No member selected</p>
        <button
          onClick={() => router.push('/dashboard/members')}
          className="mt-4 text-xs uppercase tracking-wider font-medium text-dash-text-muted hover:text-dash-text transition-colors"
        >
          Back to Members
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-dash-text-muted" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
        <p className="text-dash-text-secondary">{error || 'Member not found'}</p>
        <button
          onClick={() => router.push('/dashboard/members')}
          className="mt-4 text-xs uppercase tracking-wider font-medium text-dash-text-muted hover:text-dash-text transition-colors"
        >
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <>
      <MemberProfile
        member={member}
        currentMemberId={currentMember?.id}
        isExec={isExec}
        onEdit={() => setShowEditModal(true)}
        onAction={handleAction}
      />

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Member"
        className="max-w-2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <MemberEditForm
            member={member}
            availableChairs={availableChairs}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditModal(false)}
            isSelf={isSelf}
            isExec={isExec}
          />
        </div>
      </Modal>
    </>
  );
}

export default function MemberProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-dash-text-muted" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

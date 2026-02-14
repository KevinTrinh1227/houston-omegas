'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { isExecRole } from '@/lib/roles';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { StatusBadge, RoleBadge, EboardBadge, ChairBadge, MemberEditModal } from '@/components/members';
import type { Member, AvailableChair, ActivityItem } from '@/lib/member-types';
import {
  ArrowLeft, Edit2, Send, UserX, RefreshCw, Mail, Phone, Instagram, MessageCircle,
  Calendar, BookOpen, GraduationCap, Clock, DollarSign, Activity, Users, ChevronRight
} from 'lucide-react';

interface MemberProfile extends Member {
  chairs: string[];
  tags?: string[];
  dues_balance?: number;
  attendance_percentage?: number;
  recent_activity?: ActivityItem[];
  events_attended?: number;
  total_events?: number;
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const { member: currentMember } = useAuth();
  const { toast } = useToast();
  const isExec = isExecRole(currentMember?.role || '');
  const isSelf = currentMember?.id === memberId;

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [availableChairs, setAvailableChairs] = useState<AvailableChair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      const res = await fetch(`/api/members/${memberId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Fetch chairs for this member
        const chairsRes = await fetch(`/api/members/${memberId}/chairs`, { credentials: 'include' });
        const chairs = chairsRes.ok ? await chairsRes.json() : [];
        setMember({ ...data, chairs: chairs.map((c: { chair_name: string }) => c.chair_name) });
      } else if (res.status === 404) {
        toast('Member not found', 'error');
        router.push('/dashboard/members');
      }
    } catch {
      toast('Failed to load member', 'error');
    } finally {
      setLoading(false);
    }
  }, [memberId, toast, router]);

  const fetchChairs = useCallback(async () => {
    try {
      const res = await fetch('/api/chairs', { credentials: 'include' });
      if (res.ok) {
        setAvailableChairs(await res.json());
      }
    } catch {
      setAvailableChairs([
        { id: 1, name: 'social', display_name: 'Social Chair', description: null, is_active: 1 },
        { id: 2, name: 'rush', display_name: 'Rush Chair', description: null, is_active: 1 },
        { id: 3, name: 'philanthropy', display_name: 'Philanthropy', description: null, is_active: 1 },
        { id: 4, name: 'historian', display_name: 'Historian', description: null, is_active: 1 },
        { id: 5, name: 'marketing', display_name: 'Marketing', description: null, is_active: 1 },
        { id: 6, name: 'athletics', display_name: 'Athletics', description: null, is_active: 1 },
      ]);
    }
  }, []);

  useEffect(() => {
    fetchMember();
    fetchChairs();
  }, [fetchMember, fetchChairs]);

  const handleResendInvite = async () => {
    if (!member) return;
    try {
      const res = await fetch('/api/members/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ member_id: member.id }),
      });
      if (res.ok) {
        toast(`Invite email sent to ${member.email}`, 'success');
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to send invite', 'error');
      }
    } catch {
      toast('Connection error', 'error');
    }
  };

  const handleDeactivate = async () => {
    if (!member) return;
    if (!confirm(`Deactivate ${member.first_name} ${member.last_name}? They will be logged out immediately.`)) return;
    try {
      await fetch(`/api/members/${member.id}`, { method: 'DELETE', credentials: 'include' });
      toast(`${member.first_name} has been deactivated`, 'success');
      fetchMember();
    } catch {
      toast('Failed to deactivate', 'error');
    }
  };

  const handleReactivate = async () => {
    if (!member) return;
    if (!confirm(`Reactivate ${member.first_name} ${member.last_name}?`)) return;
    try {
      await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: true, role: 'active' }),
      });
      toast(`${member.first_name} has been reactivated`, 'success');
      fetchMember();
    } catch {
      toast('Failed to reactivate', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-dash-badge-bg rounded-lg animate-pulse" />
          <div className="h-6 bg-dash-badge-bg rounded w-48 animate-pulse" />
        </div>
        <LoadingSkeleton type="profile" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-dash-text-muted">Member not found</p>
        <Link href="/dashboard/members" className="text-xs text-dash-text-secondary hover:text-dash-text mt-2 inline-block">
          Back to Members
        </Link>
      </div>
    );
  }

  const isActive = member.is_active === 1 && member.membership_status !== 'inactive';
  const neverLoggedIn = !member.last_login_at;
  const chairs = member.chairs || (member.chair_position ? [member.chair_position] : []);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/members"
        className="inline-flex items-center gap-2 text-xs text-dash-text-secondary hover:text-dash-text transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Members
      </Link>

      {/* Hero Section */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-dash-border"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-3xl font-bold ring-4 ring-dash-border">
                {member.first_name[0]}{member.last_name[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-dash-text">
                  {member.first_name} {member.last_name}
                </h1>
                <p className="text-sm text-dash-text-secondary mt-1">{member.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusBadge status={isActive ? 'active' : 'inactive'} size="md" />
                  {member.eboard_position && (
                    <EboardBadge position={member.eboard_position} size="md" />
                  )}
                  <RoleBadge role={member.role} size="md" />
                  {chairs.map(chair => (
                    <ChairBadge key={chair} chair={chair} size="md" />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              {(isExec || isSelf) && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs uppercase tracking-wider font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  {isExec && !isSelf && neverLoggedIn && (
                    <button
                      onClick={handleResendInvite}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dash-border text-dash-text-secondary text-xs uppercase tracking-wider font-semibold hover:border-dash-text-muted transition-all"
                    >
                      <Send size={12} />
                      Send Invite
                    </button>
                  )}
                  {isExec && !isSelf && isActive && (
                    <button
                      onClick={handleDeactivate}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs uppercase tracking-wider font-semibold hover:bg-yellow-500/10 transition-all"
                    >
                      <UserX size={12} />
                      Deactivate
                    </button>
                  )}
                  {isExec && !isSelf && !isActive && (
                    <button
                      onClick={handleReactivate}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/30 text-green-600 dark:text-green-400 text-xs uppercase tracking-wider font-semibold hover:bg-green-500/10 transition-all"
                    >
                      <RefreshCw size={12} />
                      Reactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Personal Info */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Mail size={12} />
            Contact
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Email</p>
              <a href={`mailto:${member.email}`} className="text-sm text-dash-text hover:underline">
                {member.email}
              </a>
            </div>
            {member.phone && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Phone</p>
                <a href={`tel:${member.phone}`} className="text-sm text-dash-text hover:underline flex items-center gap-2">
                  <Phone size={12} />
                  {member.phone}
                </a>
              </div>
            )}
            {member.instagram && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Instagram</p>
                <a
                  href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dash-text hover:underline flex items-center gap-2"
                >
                  <Instagram size={12} />
                  {member.instagram}
                </a>
              </div>
            )}
            {member.discord_id && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Discord</p>
                <p className="text-sm text-dash-text flex items-center gap-2">
                  <MessageCircle size={12} />
                  {member.discord_id}
                </p>
              </div>
            )}
            {!member.phone && !member.instagram && !member.discord_id && (
              <p className="text-xs text-dash-text-muted italic">No contact info added</p>
            )}
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <GraduationCap size={12} />
            Academic
          </h3>
          <div className="space-y-3">
            {member.class_year && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Class Year</p>
                <p className="text-sm text-dash-text flex items-center gap-2">
                  <Calendar size={12} />
                  Class of {member.class_year}
                </p>
              </div>
            )}
            {member.major && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Major</p>
                <p className="text-sm text-dash-text flex items-center gap-2">
                  <BookOpen size={12} />
                  {member.major}
                </p>
              </div>
            )}
            {!member.class_year && !member.major && (
              <p className="text-xs text-dash-text-muted italic">No academic info added</p>
            )}
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={12} />
            Organization
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-sm text-dash-text flex items-center gap-2">
                <Calendar size={12} />
                {new Date(member.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Last Login</p>
              <p className="text-sm text-dash-text flex items-center gap-2">
                <Clock size={12} />
                {member.last_login_at
                  ? new Date(member.last_login_at + 'Z').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never logged in'}
              </p>
            </div>
            {chairs.length > 0 && (
              <div>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-2">Chair Positions</p>
                <div className="flex flex-wrap gap-1.5">
                  {chairs.map(chair => (
                    <ChairBadge key={chair} chair={chair} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dues Card */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign size={12} />
            Dues & Payments
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Balance</p>
              <p className={`text-xl font-bold ${(member.dues_balance || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${(member.dues_balance || 0).toFixed(2)}
              </p>
            </div>
            <Link
              href={`/dashboard/payments?member=${member.id}`}
              className="flex items-center justify-between text-xs text-dash-text-secondary hover:text-dash-text transition-colors"
            >
              <span>View payment history</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar size={12} />
            Attendance
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Rate</p>
              <p className="text-xl font-bold text-dash-text">
                {member.attendance_percentage !== undefined ? `${member.attendance_percentage}%` : 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-dash-text-muted">
              <span>{member.events_attended || 0} of {member.total_events || 0} events</span>
            </div>
            <div className="h-2 bg-dash-badge-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${member.attendance_percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={12} />
            Recent Activity
          </h3>
          {member.recent_activity && member.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {member.recent_activity.slice(0, 5).map((activity, idx) => (
                <div key={activity.id || idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-dash-text-muted mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dash-text truncate">{activity.description}</p>
                    <p className="text-[10px] text-dash-text-muted">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-dash-text-muted italic">No recent activity</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <MemberEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={member}
        availableChairs={availableChairs}
        onSuccess={(updatedMember) => {
          toast(`Profile updated successfully`, 'success');
          setMember({ ...member, ...updatedMember, chairs: updatedMember.chairs || member.chairs });
          setShowEditModal(false);
        }}
      />
    </div>
  );
}

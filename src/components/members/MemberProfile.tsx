'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { RoleBadge, EboardBadge, ChairBadge } from './RoleBadge';
import type { MemberWithDetails, AvailableChair } from '@/lib/member-types';
import { formatDate, formatRelativeTime } from '@/lib/member-types';
import {
  ArrowLeft, Edit2, Send, UserX, RefreshCw, Mail, Phone, Instagram, MessageCircle,
  GraduationCap, BookOpen, Calendar, Users, DollarSign, ClipboardCheck, Clock,
  ExternalLink, ChevronRight
} from 'lucide-react';

interface MemberProfileProps {
  member: MemberWithDetails;
  currentMemberId?: string;
  isExec?: boolean;
  onEdit?: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

export default function MemberProfile({
  member,
  currentMemberId,
  isExec = false,
  onEdit,
  onAction,
  className = '',
}: MemberProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'attendance'>('info');

  const isActive = member.is_active === 1 && member.membership_status !== 'inactive';
  const chairs = member.chairs || [];
  const isSelf = member.id === currentMemberId;
  const neverLoggedIn = !member.last_login_at;

  return (
    <div className={className}>
      {/* Back Button */}
      <Link
        href="/dashboard/members"
        className="inline-flex items-center gap-2 text-xs text-dash-text-secondary hover:text-dash-text transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Members
      </Link>

      {/* Hero Section */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-dash-border"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-dash-text-secondary text-3xl md:text-4xl font-semibold ring-4 ring-dash-border">
                {member.first_name[0]}{member.last_name[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-dash-text">
                    {member.first_name} {member.last_name}
                  </h1>
                  <StatusBadge status={isActive ? 'active' : 'inactive'} size="md" />
                </div>
                <p className="text-sm text-dash-text-secondary mt-1">{member.email}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
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
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                  )}
                  {isExec && !isSelf && onAction && (
                    <>
                      {neverLoggedIn && (
                        <button
                          onClick={() => onAction('resend')}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dash-border text-dash-text-secondary text-xs uppercase tracking-wider font-medium hover:border-dash-text-muted transition-all"
                        >
                          <Send size={12} />
                          Resend Invite
                        </button>
                      )}
                      {isActive ? (
                        <button
                          onClick={() => onAction('deactivate')}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 text-xs uppercase tracking-wider font-medium hover:bg-yellow-500/10 transition-all"
                        >
                          <UserX size={12} />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => onAction('reactivate')}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/50 text-green-600 dark:text-green-400 text-xs uppercase tracking-wider font-medium hover:bg-green-500/10 transition-all"
                        >
                          <RefreshCw size={12} />
                          Reactivate
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-dash-border">
              <div className="text-center">
                <p className="text-lg font-bold text-dash-text">{formatDate(member.created_at)}</p>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Joined</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-dash-text">{formatRelativeTime(member.last_login_at)}</p>
                <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Last Login</p>
              </div>
              {member.attendance_percentage !== undefined && (
                <div className="text-center">
                  <p className="text-lg font-bold text-dash-text">{member.attendance_percentage}%</p>
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Attendance</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-dash-card rounded-lg border border-dash-border p-1">
        {(['info', 'activity', 'attendance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-[11px] uppercase tracking-wider font-medium px-4 py-2 rounded-md transition-all ${
              activeTab === tab
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-dash-text-secondary hover:text-dash-text hover:bg-dash-card-hover'
            }`}
          >
            {tab === 'info' ? 'Info' : tab === 'activity' ? 'Activity' : 'Attendance'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-dash-card rounded-xl border border-dash-border p-5">
            <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail size={12} />
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Email</span>
                <a href={`mailto:${member.email}`} className="text-xs text-dash-text hover:underline">
                  {member.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Phone</span>
                {member.phone ? (
                  <a href={`tel:${member.phone}`} className="text-xs text-dash-text hover:underline">
                    {member.phone}
                  </a>
                ) : (
                  <span className="text-xs text-dash-text-muted">Not set</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Instagram</span>
                {member.instagram ? (
                  <a
                    href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dash-text hover:underline flex items-center gap-1"
                  >
                    @{member.instagram.replace('@', '')}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="text-xs text-dash-text-muted">Not set</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Discord</span>
                <span className="text-xs text-dash-text">{member.discord_id || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-dash-card rounded-xl border border-dash-border p-5">
            <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap size={12} />
              Academic
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Class Year</span>
                <span className="text-xs text-dash-text">{member.class_year || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Major</span>
                <span className="text-xs text-dash-text">{member.major || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Organization Info */}
          <div className="bg-dash-card rounded-xl border border-dash-border p-5">
            <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={12} />
              Organization
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Status</span>
                <StatusBadge status={isActive ? 'active' : 'inactive'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Role</span>
                <RoleBadge role={member.role} showIcon={false} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">E-Board</span>
                {member.eboard_position ? (
                  <EboardBadge position={member.eboard_position} showIcon={false} />
                ) : (
                  <span className="text-xs text-dash-text-muted">None</span>
                )}
              </div>
              <div>
                <span className="text-xs text-dash-text-muted">Chairs</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {chairs.length > 0 ? (
                    chairs.map(chair => (
                      <ChairBadge key={chair} chair={chair} showIcon={false} />
                    ))
                  ) : (
                    <span className="text-xs text-dash-text-muted">None assigned</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Member Since</span>
                <span className="text-xs text-dash-text">{formatDate(member.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Dues Info */}
          <div className="bg-dash-card rounded-xl border border-dash-border p-5">
            <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign size={12} />
              Dues
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dash-text-muted">Balance</span>
                <span className={`text-sm font-semibold ${(member.dues_balance || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${(member.dues_balance || 0).toFixed(2)}
                </span>
              </div>
              {member.dues_history && member.dues_history.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Recent Payments</p>
                  {member.dues_history.slice(0, 3).map(dues => (
                    <div key={dues.id} className="flex items-center justify-between text-xs">
                      <span className="text-dash-text-secondary">{dues.description}</span>
                      <span className={`font-medium ${dues.status === 'paid' ? 'text-green-500' : dues.status === 'overdue' ? 'text-red-500' : 'text-yellow-500'}`}>
                        ${dues.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-dash-text-muted">No payment history</p>
              )}
              {(member.dues_balance || 0) > 0 && (
                <button className="w-full mt-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider font-medium transition-all">
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={12} />
            Recent Activity
          </h3>
          {member.recent_activity && member.recent_activity.length > 0 ? (
            <div className="space-y-4">
              {member.recent_activity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-dash-border/50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-dash-text-muted mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dash-text">{activity.description}</p>
                    <p className="text-[10px] text-dash-text-muted mt-1">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-dash-text-muted text-center py-8">No recent activity</p>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck size={12} />
              Event Attendance
            </h3>
            {member.attendance_percentage !== undefined && (
              <span className={`text-sm font-bold ${
                member.attendance_percentage >= 80 ? 'text-green-500' :
                member.attendance_percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {member.attendance_percentage}%
              </span>
            )}
          </div>
          {member.attendance_records && member.attendance_records.length > 0 ? (
            <div className="space-y-3">
              {member.attendance_records.map(record => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-dash-border/50 last:border-0">
                  <div>
                    <p className="text-xs text-dash-text">{record.event_name}</p>
                    <p className="text-[10px] text-dash-text-muted">{formatDate(record.event_date)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-400' :
                    record.status === 'excused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-400'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-dash-text-muted text-center py-8">No attendance records</p>
          )}
        </div>
      )}
    </div>
  );
}

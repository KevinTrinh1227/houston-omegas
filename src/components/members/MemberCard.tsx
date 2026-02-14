'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { RoleBadge, EboardBadge, ChairBadge } from './RoleBadge';
import type { Member } from '@/lib/member-types';
import { Mail, Phone, Instagram, MessageCircle, Calendar, ChevronRight } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  showActions?: boolean;
  onEdit?: (member: Member) => void;
  className?: string;
}

export default function MemberCard({ member, showActions = false, onEdit, className = '' }: MemberCardProps) {
  const isActive = member.is_active === 1 && member.membership_status !== 'inactive';
  const chairs = member.chairs || (member.chair_position ? [member.chair_position] : []);

  return (
    <div
      className={`bg-dash-card rounded-xl border border-dash-border p-5 hover:border-dash-text-muted/30 transition-all group ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={`${member.first_name} ${member.last_name}`}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-dash-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-lg font-semibold ring-2 ring-dash-border">
              {member.first_name[0]}{member.last_name[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-dash-text truncate">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-xs text-dash-text-muted truncate">{member.email}</p>
            </div>
            <StatusBadge status={isActive ? 'active' : 'inactive'} />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {member.eboard_position && (
              <EboardBadge position={member.eboard_position} />
            )}
            <RoleBadge role={member.role} showIcon={false} />
            {chairs.slice(0, 2).map(chair => (
              <ChairBadge key={chair} chair={chair} showIcon={false} />
            ))}
            {chairs.length > 2 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-dash-badge-bg text-dash-text-muted">
                +{chairs.length - 2}
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-3 mt-3 text-[10px] text-dash-text-muted">
            {member.class_year && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                Class of {member.class_year}
              </span>
            )}
            {member.major && (
              <span className="truncate max-w-[120px]">{member.major}</span>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 mt-2">
            {member.phone && (
              <a href={`tel:${member.phone}`} className="text-dash-text-muted hover:text-dash-text transition-colors">
                <Phone size={12} />
              </a>
            )}
            {member.instagram && (
              <a
                href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dash-text-muted hover:text-dash-text transition-colors"
              >
                <Instagram size={12} />
              </a>
            )}
            {member.discord_id && (
              <span className="text-dash-text-muted" title={`Discord: ${member.discord_id}`}>
                <MessageCircle size={12} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dash-border/50">
        <span className="text-[10px] text-dash-text-muted">
          Joined {new Date(member.created_at).toLocaleDateString()}
        </span>
        <Link
          href={`/dashboard/members/profile?id=${m.id}`}
          className="flex items-center gap-1 text-[10px] text-dash-text-secondary hover:text-dash-text transition-colors uppercase tracking-wider font-medium"
        >
          View Profile
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

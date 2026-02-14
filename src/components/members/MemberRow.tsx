'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { RoleBadge, EboardBadge, ChairBadge } from './RoleBadge';
import type { Member } from '@/lib/member-types';
import { formatRelativeTime } from '@/lib/member-types';
import { MoreVertical, Eye, Edit2, UserX, RefreshCw, Send, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MemberRowProps {
  member: Member;
  currentMemberId?: string;
  isExec?: boolean;
  onAction?: (action: string, member: Member) => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  showCheckbox?: boolean;
  className?: string;
}

export default function MemberRow({
  member,
  currentMemberId,
  isExec = false,
  onAction,
  selected = false,
  onSelect,
  showCheckbox = false,
  className = '',
}: MemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = member.is_active === 1 && member.membership_status !== 'inactive';
  const chairs = member.chairs || (member.chair_position ? [member.chair_position] : []);
  const isSelf = member.id === currentMemberId;
  const neverLoggedIn = !member.last_login_at;

  return (
    <tr className={`border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors ${!isActive ? 'opacity-60' : ''} ${className}`}>
      {/* Checkbox */}
      {showCheckbox && (
        <td className="px-4 py-3 w-12">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="w-4 h-4 rounded border-dash-border bg-dash-input text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
          />
        </td>
      )}

      {/* Name & Avatar */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-dash-text-secondary text-xs font-semibold shrink-0">
              {member.first_name[0]}{member.last_name[0]}
            </div>
          )}
          <div>
            <Link
              href={`/dashboard/members/profile?id=${member.id}`}
              className="text-xs font-medium text-dash-text hover:underline"
            >
              {member.first_name} {member.last_name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              {neverLoggedIn && isActive && (
                <span className="text-[9px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full uppercase font-medium">
                  Invited
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-5 py-3 hidden sm:table-cell">
        <span className="text-xs text-dash-text-secondary">{member.email}</span>
      </td>

      {/* Status */}
      <td className="px-5 py-3">
        <StatusBadge status={isActive ? 'active' : 'inactive'} />
      </td>

      {/* Role & Eboard */}
      <td className="px-5 py-3 hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {member.eboard_position && (
            <EboardBadge position={member.eboard_position} showIcon={false} />
          )}
          <RoleBadge role={member.role} showIcon={false} />
        </div>
      </td>

      {/* Chairs */}
      <td className="px-5 py-3 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {chairs.length > 0 ? (
            <>
              {chairs.slice(0, 2).map(chair => (
                <ChairBadge key={chair} chair={chair} showIcon={false} />
              ))}
              {chairs.length > 2 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-dash-badge-bg text-dash-text-muted">
                  +{chairs.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-dash-text-muted">&mdash;</span>
          )}
        </div>
      </td>

      {/* Class Year */}
      <td className="px-5 py-3 hidden xl:table-cell">
        <span className="text-xs text-dash-text-secondary">
          {member.class_year || '\u2014'}
        </span>
      </td>

      {/* Last Login */}
      <td className="px-5 py-3 hidden xl:table-cell">
        <span className="text-xs text-dash-text-muted">
          {formatRelativeTime(member.last_login_at)}
        </span>
      </td>

      {/* Actions */}
      {isExec && onAction && (
        <td className="px-5 py-3 text-right relative">
          <button
            ref={btnRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md hover:bg-dash-card-hover text-dash-text-muted hover:text-dash-text transition-colors"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-5 top-full mt-1 bg-dash-card border border-dash-border rounded-lg shadow-lg z-50 min-w-[160px] py-1"
            >
              <Link
                href={`/dashboard/members/profile?id=${member.id}`}
                className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <Eye size={12} />
                View Profile
              </Link>
              {!isSelf && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); onAction('edit', member); }}
                    className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={12} />
                    Edit Member
                  </button>
                  {neverLoggedIn && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('resend', member); }}
                      className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                    >
                      <Send size={12} />
                      Resend Invite
                    </button>
                  )}
                  <div className="border-t border-dash-border my-1" />
                  {isActive ? (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('deactivate', member); }}
                      className="w-full text-left px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                    >
                      <UserX size={12} />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('reactivate', member); }}
                      className="w-full text-left px-3 py-2 text-xs text-green-600 dark:text-green-400 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                    >
                      <RefreshCw size={12} />
                      Reactivate
                    </button>
                  )}
                  {neverLoggedIn && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('remove', member); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </td>
      )}
    </tr>
  );
}

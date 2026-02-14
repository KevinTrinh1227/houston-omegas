'use client';

import { ROLE_LABELS, ROLE_COLORS, type Role } from '@/lib/roles';
import { EBOARD_LABELS, EBOARD_COLORS, CHAIR_BADGE_COLORS, getChairDisplayName } from '@/lib/member-types';
import {
  Shield, Crown, UserCog, Globe, Wallet, ClipboardList,
  Sprout, UserCheck, GraduationCap, UserX,
  Users, Megaphone, Heart, Camera, Dumbbell, BookOpen,
} from 'lucide-react';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={10} />,
  president: <Crown size={10} />,
  vpi: <UserCog size={10} />,
  vpx: <Globe size={10} />,
  treasurer: <Wallet size={10} />,
  secretary: <ClipboardList size={10} />,
  junior_active: <Sprout size={10} />,
  active: <UserCheck size={10} />,
  alumni: <GraduationCap size={10} />,
  inactive: <UserX size={10} />,
};

const CHAIR_ICONS: Record<string, React.ReactNode> = {
  social: <Users size={10} />,
  rush: <Megaphone size={10} />,
  recruitment: <Megaphone size={10} />,
  philanthropy: <Heart size={10} />,
  brotherhood: <Heart size={10} />,
  historian: <Camera size={10} />,
  marketing: <BookOpen size={10} />,
  social_media: <BookOpen size={10} />,
  athletics: <Dumbbell size={10} />,
  alumni: <GraduationCap size={10} />,
};

interface RoleBadgeProps {
  role: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function RoleBadge({ role, showIcon = true, size = 'sm', className = '' }: RoleBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  const colors = ROLE_COLORS[role as Role] || 'bg-dash-badge-bg text-dash-text-secondary';
  const label = ROLE_LABELS[role as Role] || role;
  const icon = ROLE_ICONS[role];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium uppercase ${sizeClasses} ${colors} ${className}`}
    >
      {showIcon && icon}
      {label}
    </span>
  );
}

interface EboardBadgeProps {
  position: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function EboardBadge({ position, showIcon = true, size = 'sm', className = '' }: EboardBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  const colors = EBOARD_COLORS[position] || 'bg-dash-badge-bg text-dash-text-secondary';
  const label = EBOARD_LABELS[position] || position;
  const icon = ROLE_ICONS[position];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium uppercase ${sizeClasses} ${colors} ${className}`}
    >
      {showIcon && icon}
      {label}
    </span>
  );
}

interface ChairBadgeProps {
  chair: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ChairBadge({ chair, showIcon = true, size = 'sm', className = '' }: ChairBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  const colors = CHAIR_BADGE_COLORS[chair] || 'bg-dash-badge-bg text-dash-text-secondary';
  const label = getChairDisplayName(chair);
  const icon = CHAIR_ICONS[chair];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium uppercase ${sizeClasses} ${colors} ${className}`}
    >
      {showIcon && icon}
      {label}
    </span>
  );
}

export default RoleBadge;

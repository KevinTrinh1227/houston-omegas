'use client';

import { Users, UserCheck, UserX, Crown } from 'lucide-react';

interface MemberStatsProps {
  total: number;
  active: number;
  inactive: number;
  eboard: number;
  className?: string;
}

export default function MemberStats({ total, active, inactive, eboard, className = '' }: MemberStatsProps) {
  const stats = [
    { label: 'Total Members', value: total, icon: <Users size={16} />, color: 'text-dash-text' },
    { label: 'Active', value: active, icon: <UserCheck size={16} />, color: 'text-green-500' },
    { label: 'Inactive', value: inactive, icon: <UserX size={16} />, color: 'text-red-500' },
    { label: 'E-Board', value: eboard, icon: <Crown size={16} />, color: 'text-amber-500' },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-dash-card rounded-xl border border-dash-border p-4 hover:border-dash-text-muted/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className={`${stat.color}`}>{stat.icon}</span>
            <span className="text-2xl font-bold text-dash-text">{stat.value}</span>
          </div>
          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mt-2">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

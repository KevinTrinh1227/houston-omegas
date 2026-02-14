'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus, UserMinus, Settings, Shield, Calendar, FileText,
  Bell, DollarSign, MessageSquare, Activity, Users,
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

interface ActivityItem {
  id: number;
  member_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: string | null;
  created_at: string;
  member_name?: string;
  avatar_url?: string;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  invite_member: <UserPlus size={14} />,
  remove_member: <UserMinus size={14} />,
  update_member: <Settings size={14} />,
  assign_role: <Shield size={14} />,
  assign_chair: <Users size={14} />,
  create_event: <Calendar size={14} />,
  update_event: <Calendar size={14} />,
  create_post: <FileText size={14} />,
  publish_post: <FileText size={14} />,
  create_announcement: <Bell size={14} />,
  process_payment: <DollarSign size={14} />,
  update_dues: <DollarSign size={14} />,
  add_comment: <MessageSquare size={14} />,
  default: <Activity size={14} />,
};

const ACTION_COLORS: Record<string, string> = {
  invite_member: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  remove_member: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  update_member: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  assign_role: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  assign_chair: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  create_event: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  update_event: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  create_post: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  publish_post: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  create_announcement: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  process_payment: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  update_dues: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function ActivityFeed({ limit = 10, showHeader = true, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`/api/dashboard/activity?limit=${limit}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        } else if (res.status === 403) {
          setActivityError('Access denied');
        }
      } catch {
        setActivityError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  if (loading) {
    return (
      <div className={`bg-dash-card rounded-xl border border-dash-border p-6 ${className}`}>
        {showHeader && <div className="h-5 bg-dash-badge-bg rounded w-32 mb-4 animate-pulse" />}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-dash-badge-bg shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-dash-badge-bg rounded w-3/4 mb-2" />
                <div className="h-3 bg-dash-badge-bg rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activityError) {
    return null;
  }

  if (activities.length === 0) {
    return (
      <div className={`bg-dash-card rounded-xl border border-dash-border p-6 ${className}`}>
        {showHeader && <h3 className="text-sm font-medium text-dash-text mb-4">Recent Activity</h3>}
        <p className="text-sm text-dash-text-muted text-center py-4">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={`bg-dash-card rounded-xl border border-dash-border p-6 ${className}`}>
      {showHeader && <h3 className="text-sm font-medium text-dash-text mb-4">Recent Activity</h3>}
      <div className="space-y-4">
        {activities.map((activity) => {
          const icon = ACTION_ICONS[activity.action_type] || ACTION_ICONS.default;
          const colorClass = ACTION_COLORS[activity.action_type] || ACTION_COLORS.default;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-dash-text leading-snug">
                  {activity.member_name && (
                    <span className="font-medium">{activity.member_name} </span>
                  )}
                  {activity.description}
                </p>
                <p className="text-xs text-dash-text-muted mt-0.5">
                  {formatRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityFeed;

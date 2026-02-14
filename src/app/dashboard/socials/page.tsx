'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import {
  PenSquare, Calendar, BarChart3, Users, Send,
  Instagram, Twitter, Linkedin, MessageCircle,
  TrendingUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  is_active: number;
  access_token: string | null;
}

interface SocialPost {
  id: string;
  content: string;
  status: string;
  created_at: string;
  published_at: string | null;
  platforms: Array<{ platform: string; status: string }>;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram size={16} />,
  twitter: <Twitter size={16} />,
  linkedin: <Linkedin size={16} />,
  discord: <MessageCircle size={16} />,
  tiktok: <span className="text-[10px] font-bold">TT</span>,
  facebook: <span className="text-[10px] font-bold">FB</span>,
  youtube: <span className="text-[10px] font-bold">YT</span>,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  twitter: 'bg-blue-500',
  linkedin: 'bg-blue-700',
  discord: 'bg-indigo-600',
  tiktok: 'bg-black',
  facebook: 'bg-blue-600',
  youtube: 'bg-red-600',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <PenSquare size={12} /> },
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', icon: <Clock size={12} /> },
  published: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', icon: <CheckCircle size={12} /> },
  partial: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400', icon: <AlertCircle size={12} /> },
  failed: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', icon: <AlertCircle size={12} /> },
};

export default function SocialsOverviewPage() {
  const { member } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  const isExec = isExecRole(member?.role || '');
  const isSocialChair = member?.chair_position === 'social' || member?.chair_position === 'social_media';
  const canManage = isExec || isSocialChair;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsRes, postsRes] = await Promise.all([
        fetch('/api/social/accounts', { credentials: 'include' }),
        fetch('/api/social/posts?limit=5', { credentials: 'include' }),
      ]);

      if (accountsRes.ok) setAccounts(await accountsRes.json());
      if (postsRes.ok) setRecentPosts(await postsRes.json());
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const connectedPlatforms = accounts.filter(a => a.is_active);
  const platformsWithTokens = accounts.filter(a => a.is_active && a.access_token);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Social Media</h1>
          <p className="text-sm text-dash-text-secondary mt-1">
            Cross-post content and track performance across platforms
          </p>
        </div>
        {canManage && (
          <Link
            href="/dashboard/socials/compose"
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <PenSquare size={14} />
            New Post
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
              <div className="h-4 bg-dash-badge-bg rounded w-24 mb-3" />
              <div className="h-8 bg-dash-badge-bg rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link href="/dashboard/socials/accounts" className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium">Connected</span>
                <Users size={16} className="text-violet-500" />
              </div>
              <p className="text-2xl font-semibold text-dash-text">{connectedPlatforms.length}</p>
              <p className="text-[10px] text-dash-text-muted mt-1">
                {platformsWithTokens.length} with API access
              </p>
            </Link>

            <Link href="/dashboard/socials/compose" className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium">Drafts</span>
                <PenSquare size={16} className="text-gray-500" />
              </div>
              <p className="text-2xl font-semibold text-dash-text">
                {recentPosts.filter(p => p.status === 'draft').length}
              </p>
              <p className="text-[10px] text-dash-text-muted mt-1">Ready to publish</p>
            </Link>

            <Link href="/dashboard/socials/calendar" className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium">Scheduled</span>
                <Clock size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl font-semibold text-dash-text">
                {recentPosts.filter(p => p.status === 'scheduled').length}
              </p>
              <p className="text-[10px] text-dash-text-muted mt-1">Upcoming posts</p>
            </Link>

            <Link href="/dashboard/socials/analytics" className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium">Published</span>
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <p className="text-2xl font-semibold text-dash-text">
                {recentPosts.filter(p => p.status === 'published' || p.status === 'partial').length}
              </p>
              <p className="text-[10px] text-dash-text-muted mt-1">This month</p>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Connected Platforms */}
            <div className="bg-dash-card rounded-xl border border-dash-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-dash-text">Platforms</h2>
                <Link href="/dashboard/socials/accounts" className="text-[10px] text-dash-text-muted hover:text-dash-text uppercase tracking-wider">
                  Manage
                </Link>
              </div>
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-6">
                  <Users size={24} className="text-dash-text-muted mx-auto mb-2" />
                  <p className="text-xs text-dash-text-muted">No accounts connected</p>
                  <Link
                    href="/dashboard/socials/accounts"
                    className="text-[10px] text-violet-500 hover:text-violet-400 uppercase tracking-wider mt-2 inline-block"
                  >
                    Connect Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {connectedPlatforms.map(acc => (
                    <div key={acc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dash-bg transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${PLATFORM_COLORS[acc.platform] || 'bg-gray-600'}`}>
                        {PLATFORM_ICONS[acc.platform] || acc.platform.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-dash-text truncate">@{acc.handle}</p>
                        <p className="text-[10px] text-dash-text-muted capitalize">{acc.platform}</p>
                      </div>
                      {acc.access_token && (
                        <span className="text-[8px] bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                          API
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Posts */}
            <div className="lg:col-span-2 bg-dash-card rounded-xl border border-dash-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-dash-text">Recent Posts</h2>
                <Link href="/dashboard/socials/compose" className="text-[10px] text-dash-text-muted hover:text-dash-text uppercase tracking-wider">
                  View All
                </Link>
              </div>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Send size={24} className="text-dash-text-muted mx-auto mb-2" />
                  <p className="text-xs text-dash-text-muted">No posts yet</p>
                  {canManage && (
                    <Link
                      href="/dashboard/socials/compose"
                      className="text-[10px] text-violet-500 hover:text-violet-400 uppercase tracking-wider mt-2 inline-block"
                    >
                      Create Your First Post
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map(post => {
                    const style = STATUS_STYLES[post.status] || STATUS_STYLES.draft;
                    return (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg border border-dash-border hover:border-dash-text-muted/30 transition-colors">
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-dash-text line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.bg} ${style.text} uppercase tracking-wider font-medium`}>
                              {post.status}
                            </span>
                            <div className="flex items-center gap-1">
                              {post.platforms?.map(p => (
                                <div
                                  key={p.platform}
                                  className={`w-5 h-5 rounded flex items-center justify-center text-white text-[8px] ${PLATFORM_COLORS[p.platform] || 'bg-gray-600'}`}
                                  title={`${p.platform}: ${p.status}`}
                                >
                                  {PLATFORM_ICONS[p.platform] || p.platform.slice(0, 2)}
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] text-dash-text-muted ml-auto">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/dashboard/socials/compose', icon: <PenSquare size={20} />, label: 'Compose Post', desc: 'Create & cross-post' },
              { href: '/dashboard/socials/calendar', icon: <Calendar size={20} />, label: 'Calendar', desc: 'Schedule content' },
              { href: '/dashboard/socials/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', desc: 'Track performance' },
              { href: '/dashboard/socials/accounts', icon: <Users size={20} />, label: 'Accounts', desc: 'Manage connections' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all group"
              >
                <div className="text-dash-text-muted group-hover:text-violet-500 transition-colors mb-3">
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-dash-text">{item.label}</p>
                <p className="text-[10px] text-dash-text-muted mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

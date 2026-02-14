'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import { Check, X, Eye, RefreshCw, FileText, Clock, TrendingUp } from 'lucide-react';

interface SEOArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  content_type: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  quality_score: number | null;
  word_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SEOStats {
  total_articles: number;
  published: number;
  pending: number;
  approved: number;
  draft: number;
  rejected: number;
  total_keywords: number;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'how-to': 'How-To',
  'listicle': 'List',
  'comparison': 'Comparison',
  'guide': 'Guide',
  'news-angle': 'News',
};

export default function ContentDashboardPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [articles, setArticles] = useState<SEOArticle[]>([]);
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/api/dashboard/seo/content?status=${filter}`
        : '/api/dashboard/seo/content';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/dashboard/seo/stats', { credentials: 'include' });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      /* ignore */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, [fetchArticles, fetchStats]);

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAction = async (action: 'approve' | 'reject', id: number) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/dashboard/seo/content', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        showMsg(`Article ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        fetchArticles();
        fetchStats();
      } else {
        const data = await res.json();
        showMsg(data.error || 'Action failed.');
      }
    } catch {
      showMsg('Connection error.');
    } finally {
      setUpdating(null);
    }
  };

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '\u2014';
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isExec) {
    return (
      <div className="text-center py-20">
        <p className="text-dash-text-muted">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">SEO Content</h1>
          <p className="text-sm text-dash-text-secondary mt-1">
            AI-generated blog content from VisibleSeed SEO Engine
          </p>
        </div>
        <button
          onClick={() => {
            fetchArticles();
            fetchStats();
          }}
          className="flex items-center gap-2 text-dash-text-secondary hover:text-dash-text text-xs transition-colors px-3 py-2 rounded-lg border border-dash-border hover:border-dash-text-muted"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${
          message.includes('success')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === '' ? 'ring-2 ring-gray-900 dark:ring-white' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('')}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-dash-text-muted" />
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Total</p>
            </div>
            <p className="text-lg font-semibold text-dash-text">{stats.total_articles}</p>
          </div>
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === 'pending' ? 'ring-2 ring-yellow-500' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('pending')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-yellow-600" />
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Pending</p>
            </div>
            <p className="text-lg font-semibold text-yellow-600">{stats.pending}</p>
          </div>
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === 'approved' ? 'ring-2 ring-blue-500' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('approved')}
          >
            <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Approved</p>
            <p className="text-lg font-semibold text-blue-600">{stats.approved}</p>
          </div>
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === 'published' ? 'ring-2 ring-green-500' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('published')}
          >
            <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Published</p>
            <p className="text-lg font-semibold text-green-600">{stats.published}</p>
          </div>
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === 'draft' ? 'ring-2 ring-gray-500' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('draft')}
          >
            <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Draft</p>
            <p className="text-lg font-semibold text-dash-text-secondary">{stats.draft}</p>
          </div>
          <div
            className={`bg-dash-card rounded-lg border border-dash-border p-4 cursor-pointer transition-all ${filter === 'rejected' ? 'ring-2 ring-red-500' : 'hover:border-dash-text-muted/30'}`}
            onClick={() => setFilter('rejected')}
          >
            <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-lg font-semibold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-dash-card rounded-lg border border-dash-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-purple-600" />
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">Keywords</p>
            </div>
            <p className="text-lg font-semibold text-purple-600">{stats.total_keywords}</p>
          </div>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
              <div className="h-4 bg-dash-badge-bg rounded w-48 mb-2" />
              <div className="h-3 bg-dash-badge-bg rounded w-72" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <FileText size={32} className="text-dash-text-muted mx-auto mb-3" />
          <p className="text-dash-text text-sm font-medium mb-1">No articles found</p>
          <p className="text-dash-text-muted text-xs">
            {filter ? `No ${filter} articles at the moment.` : 'Content will appear here as the SEO engine generates it.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className={`bg-dash-card rounded-xl border border-dash-border p-5 hover:border-dash-text-muted/30 transition-all ${updating === article.id ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${statusStyles[article.status]}`}>
                      {article.status}
                    </span>
                    {article.content_type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                        {CONTENT_TYPE_LABELS[article.content_type] || article.content_type}
                      </span>
                    )}
                    {article.quality_score !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        article.quality_score >= 80
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : article.quality_score >= 60
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        Score: {article.quality_score}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-dash-text line-clamp-1 mb-1">{article.title}</h3>
                  {(article.excerpt || article.meta_description) && (
                    <p className="text-xs text-dash-text-secondary line-clamp-2 mb-2">
                      {article.excerpt || article.meta_description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-dash-text-muted">
                    <span>{article.word_count?.toLocaleString() || 0} words</span>
                    <span>&middot;</span>
                    <span>{article.reading_time || 1} min read</span>
                    <span>&middot;</span>
                    <span>Created {formatDate(article.created_at)}</span>
                    {article.published_at && (
                      <>
                        <span>&middot;</span>
                        <span className="text-green-600">Published {formatDate(article.published_at)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {article.status === 'published' && (
                    <Link
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-dash-text-muted hover:text-dash-text transition-colors px-2 py-1 rounded border border-dash-border hover:border-dash-text-muted"
                    >
                      <Eye size={12} />
                      View
                    </Link>
                  )}

                  {(article.status === 'pending' || article.status === 'draft') && (
                    <>
                      <button
                        onClick={() => handleAction('approve', article.id)}
                        disabled={updating === article.id}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Check size={12} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction('reject', article.id)}
                        disabled={updating === article.id}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X size={12} />
                        Reject
                      </button>
                    </>
                  )}

                  {article.status === 'approved' && (
                    <span className="text-[10px] text-dash-text-muted px-2 py-1">
                      Queued for publishing
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

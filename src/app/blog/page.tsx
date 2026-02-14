'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  views: number;
  first_name: string;
  last_name: string;
  source?: 'local' | 'seo';
  content_type?: 'how-to' | 'listicle' | 'comparison' | 'guide' | 'news-angle';
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'how-to': 'How-To',
  'listicle': 'List',
  'comparison': 'Comparison',
  'guide': 'Guide',
  'news-angle': 'News',
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  'how-to': 'bg-blue-50 text-blue-600',
  'listicle': 'bg-purple-50 text-purple-600',
  'comparison': 'bg-orange-50 text-orange-600',
  'guide': 'bg-green-50 text-green-600',
  'news-angle': 'bg-red-50 text-red-600',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    // Fetch from both local and SEO sources
    Promise.all([
      fetch(`/api/blog?page=${page}&limit=12`)
        .then(res => res.ok ? res.json() : { posts: [], total: 0 })
        .catch(() => ({ posts: [], total: 0 })),
      fetch(`/api/blog/seo?page=${page}&limit=12`)
        .then(res => res.ok ? res.json() : { articles: [], total: 0 })
        .catch(() => ({ articles: [], total: 0 })),
    ])
      .then(([localData, seoData]) => {
        const localPosts = (localData.posts || []).map((p: BlogPost) => ({ ...p, source: 'local' as const }));
        const seoArticles = (seoData.articles || []).map((a: BlogPost) => ({ ...a, source: 'seo' as const }));

        let combined = [...localPosts, ...seoArticles].sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });

        if (filter) {
          combined = combined.filter((p: BlogPost) => p.content_type === filter);
        }

        setPosts(combined);
        setTotal((localData.total || 0) + (seoData.total || 0));
      })
      .finally(() => setLoading(false));
  }, [page, filter]);

  const totalPages = Math.ceil(total / 12);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const categories = ['how-to', 'listicle', 'comparison', 'guide', 'news-angle'];

  return (
    <PageWrapper>
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-6xl mx-auto min-h-[70vh]">
        <div className="text-center mb-10">
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Blog</p>
          <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            News & Updates
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Stories, guides, and news from the brotherhood.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => { setFilter(null); setPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {CONTENT_TYPE_LABELS[cat]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5">
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" />
                <path d="M9 9h6M9 13h4" />
              </svg>
            </div>
            <h2 className="text-lg text-gray-900 mb-2" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              {filter ? 'No Articles Found' : 'Coming Soon'}
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              {filter
                ? `No ${CONTENT_TYPE_LABELS[filter]?.toLowerCase()} articles available yet.`
                : "We're working on sharing stories from the brotherhood."
              }
            </p>
            {filter ? (
              <button
                onClick={() => setFilter(null)}
                className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300"
              >
                View All Articles
              </button>
            ) : (
              <Link href="/" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
                Back to Home
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link
                  key={`${post.source}-${post.id}`}
                  href={`/blog/article?slug=${post.slug}`}
                  className="group rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  {post.cover_image_url ? (
                    <div className="h-48 bg-gray-100 overflow-hidden relative">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.content_type && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${CONTENT_TYPE_COLORS[post.content_type] || 'bg-gray-100 text-gray-600'}`}>
                          {CONTENT_TYPE_LABELS[post.content_type] || post.content_type}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" />
                        <path d="M9 9h6M9 13h4" />
                      </svg>
                      {post.content_type && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${CONTENT_TYPE_COLORS[post.content_type] || 'bg-gray-100 text-gray-600'}`}>
                          {CONTENT_TYPE_LABELS[post.content_type] || post.content_type}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>{formatDate(post.published_at)}</span>
                      <span>&middot;</span>
                      <span>{post.first_name} {post.last_name}</span>
                    </p>
                    <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                        pageNum === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:bg-gray-100"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer variant="light" />
    </PageWrapper>
  );
}

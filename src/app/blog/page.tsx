'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  views: number;
  first_name: string;
  last_name: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog?page=${page}&limit=12`)
      .then(res => res.ok ? res.json() : { posts: [], total: 0 })
      .then(data => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-5xl mx-auto min-h-[70vh]">
        <div className="text-center mb-12">
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Blog</p>
          <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            News & Updates
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Stories, updates, and news from the brotherhood.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-lg text-gray-900 mb-2" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Coming Soon
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              We&apos;re working on sharing stories, updates, and news from the brotherhood. Stay tuned.
            </p>
            <Link href="/" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post.id} href={`/blog/post?slug=${post.slug}`} className="group rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
                  {post.cover_image_url ? (
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-50 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7" /></svg>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                      {post.published_at ? new Date(post.published_at + 'Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                      {' '}&middot;{' '}{post.first_name} {post.last_name}
                    </p>
                    <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-2 line-clamp-2">{post.title}</h2>
                    {post.excerpt && <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer variant="light" />
    </div>
  );
}

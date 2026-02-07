'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  published_at: string | null;
  views: number;
  first_name: string;
  last_name: string;
  tags?: { name: string; slug: string }[];
}

function BlogPostInner() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/blog/${slug}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.ok ? res.json() : null;
      })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 flex items-center justify-center min-h-[70vh]">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  if (notFound || !post) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <section className="pt-28 pb-20 px-6 text-center min-h-[70vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl text-gray-900 mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>Post Not Found</h1>
          <Link href="/blog" className="text-gray-500 text-xs hover:underline">Back to Blog</Link>
        </section>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Navbar variant="light" />

      <article className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/blog" className="text-xs text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors mb-4 inline-block">&larr; Back to Blog</Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{post.first_name} {post.last_name}</span>
            <span>&middot;</span>
            <span>{post.published_at ? new Date(post.published_at + 'Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
            <span>&middot;</span>
            <span>{post.views} views</span>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={post.cover_image_url} alt={post.title} className="w-full" />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag.slug} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">{tag.name}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-gray-900 prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      </article>

      <Footer variant="light" />
    </PageWrapper>
  );
}

export default function BlogPostPage() {
  return (
    <Suspense fallback={
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 flex items-center justify-center min-h-[70vh]">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
        <Footer variant="light" />
      </PageWrapper>
    }>
      <BlogPostInner />
    </Suspense>
  );
}

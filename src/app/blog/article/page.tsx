'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';
import { Suspense } from 'react';

function ArticleContent() {
  const params = useSearchParams();
  const slug = params.get('slug');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/seo/${slug}`)
      .then(r => r.json())
      .then(data => { setArticle(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">Article not found</p>
      <Link href="/blog" className="text-white/70 hover:text-white text-sm underline">← Back to Blog</Link>
    </div>
  );

  const readingTime = Math.ceil((article.body?.split(/\s+/).length || 0) / 200);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/blog" className="text-white/40 hover:text-white/60 text-xs uppercase tracking-wider mb-8 inline-block">
        ← Back to Blog
      </Link>
      {article.content_type && (
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-wider text-white/60 mb-4">
          {article.content_type}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
        {article.title}
      </h1>
      <div className="flex items-center gap-3 text-white/40 text-xs mb-8">
        <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span>·</span>
        <span>{readingTime} min read</span>
      </div>
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} className="w-full rounded-xl mb-8" />
      )}
      <div
        className="prose prose-invert prose-lg max-w-none
          prose-headings:font-semibold prose-headings:text-white/90
          prose-p:text-white/70 prose-p:leading-relaxed
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white/90
          prose-li:text-white/70"
        dangerouslySetInnerHTML={{ __html: article.body || '' }}
      />
    </article>
  );
}

export default function BlogArticlePage() {
  return (
    <PageWrapper>
      <Navbar />
      <div className="bg-[#080a0f] min-h-screen pt-20">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
          <ArticleContent />
        </Suspense>
      </div>
      <Footer />
    </PageWrapper>
  );
}

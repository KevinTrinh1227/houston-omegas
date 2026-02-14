'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

interface Article {
  id: number;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image_url: string | null;
  content_type: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  word_count: number;
  reading_time: number;
  first_name: string;
  last_name: string;
  source: string;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'how-to': 'How-To Guide',
  'listicle': 'List Article',
  'comparison': 'Comparison',
  'guide': 'In-Depth Guide',
  'news-angle': 'News',
};

function formatBody(body: string): string {
  if (!body) return '';
  if (body.includes('<p>') || body.includes('<h2>') || body.includes('<div>')) {
    return body;
  }
  let html = body
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .split('\n\n')
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<pre') || trimmed.startsWith('<li')) {
        return trimmed;
      }
      return '<p>' + trimmed + '</p>';
    })
    .join('\n');
  return html;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/blog/seo/' + slug)
      .then(res => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(setArticle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const jsonLd = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.meta_description,
    image: article.cover_image_url || 'https://houstonomegas.com/images/omega-logo.jpg',
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: 'Houston Omegas', url: 'https://houstonomegas.com' },
    publisher: { '@type': 'Organization', name: 'Houston Omegas', logo: { '@type': 'ImageObject', url: 'https://houstonomegas.com/images/omega-logo.jpg' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://houstonomegas.com/blog/' + article.slug },
    wordCount: article.word_count,
    articleSection: CONTENT_TYPE_LABELS[article.content_type] || article.content_type,
  } : null;

  if (loading) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto min-h-[70vh]">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
            <div className="h-8 bg-gray-100 rounded w-3/4 mb-6" />
            <div className="h-64 bg-gray-100 rounded mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  if (error || !article) {
    return (
      <PageWrapper>
        <Navbar variant="light" />
        <div className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl text-gray-900 mb-2" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            Article Not Found
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/blog" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-lg transition-all duration-300">
            Back to Blog
          </Link>
        </div>
        <Footer variant="light" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Head>
        <title>{article.meta_title || article.title} | Houston Omegas</title>
        <meta name="description" content={article.meta_description || article.excerpt || ''} />
        <meta property="og:title" content={article.meta_title || article.title} />
        <meta property="og:description" content={article.meta_description || article.excerpt || ''} />
        <meta property="og:image" content={article.cover_image_url || 'https://houstonomegas.com/images/omega-logo.jpg'} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={'https://houstonomegas.com/blog/' + article.slug} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={'https://houstonomegas.com/blog/' + article.slug} />
      </Head>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <Navbar variant="light" />
      <article className="pt-28 pb-20 px-6 sm:px-10 max-w-3xl mx-auto min-h-[70vh]">
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-gray-400">
            <li><Link href="/" className="hover:text-gray-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link></li>
            <li>/</li>
            <li className="text-gray-600 truncate max-w-[200px]">{article.title}</li>
          </ol>
        </nav>
        <header className="mb-8">
          {article.content_type && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 mb-4">
              {CONTENT_TYPE_LABELS[article.content_type] || article.content_type}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>{formatDate(article.published_at)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{article.first_name} {article.last_name}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{article.reading_time} min read</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{article.word_count.toLocaleString()} words</span>
          </div>
        </header>
        {article.cover_image_url && (
          <div className="mb-10 rounded-xl overflow-hidden">
            <img src={article.cover_image_url} alt={article.title} className="w-full h-auto object-cover" />
          </div>
        )}
        <div
          className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: formatBody(article.body) }}
        />
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">HO</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Houston Omegas</p>
                <p className="text-xs text-gray-500">Omega Psi Phi Fraternity, Inc.</p>
              </div>
            </div>
            <Link href="/blog" className="border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-[11px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-lg transition-all duration-300">
              More Articles
            </Link>
          </div>
        </footer>
      </article>
      <Footer variant="light" />
    </PageWrapper>
  );
}

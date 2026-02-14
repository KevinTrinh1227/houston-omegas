import type { Env } from '../../types';
import { jsonCached, error, options } from '../../lib/response';
import { createSEOEngine } from '../../lib/seo-engine';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 50);

  try {
    const seo = createSEOEngine(env);
    const data = await seo.getArticles({ status: 'published', page, limit });

    const articles = data.articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || article.meta_description,
      cover_image_url: article.cover_image_url,
      published_at: article.published_at,
      views: 0,
      first_name: 'Houston',
      last_name: 'Omegas',
      source: 'seo' as const,
      content_type: article.content_type,
    }));

    return jsonCached({ articles, total: data.total, page, limit }, 300);
  } catch (err) {
    console.error('SEO Engine error:', err);
    return jsonCached({ articles: [], total: 0, page, limit }, 60);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

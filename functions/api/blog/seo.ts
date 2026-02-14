import type { Env } from '../../types';
import { json, jsonCached, error, options } from '../../lib/response';
import { createSEOEngine } from '../../lib/seo-engine';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 50);

  try {
    const seo = createSEOEngine(env);
    const { articles, total } = await seo.getArticles({ status: 'published', page, limit });

    const formatted = articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || a.meta_description,
      cover_image_url: a.cover_image_url,
      content_type: a.content_type,
      published_at: a.published_at,
      views: 0,
      first_name: 'Houston',
      last_name: 'Omegas',
    }));

    return jsonCached({ articles: formatted, total, page, limit }, 300);
  } catch (err) {
    console.error('SEO Engine error:', err);
    return json({ articles: [], total: 0, page, limit });
  }
};

export const onRequestOptions: PagesFunction = async () => options();

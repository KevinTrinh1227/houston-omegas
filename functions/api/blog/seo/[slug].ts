import type { Env } from '../../../types';
import { json, jsonCached, error, options } from '../../../lib/response';
import { createSEOEngine } from '../../../lib/seo-engine';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const slug = params.slug as string;

  if (!slug) {
    return error('Slug is required', 400);
  }

  try {
    const seo = createSEOEngine(env);
    const article = await seo.getArticleBySlug(slug);

    if (!article || article.status !== 'published') {
      return error('Article not found', 404);
    }

    const wordCount = article.body?.split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return jsonCached({
      id: article.id,
      slug: article.slug,
      title: article.title,
      body: article.body,
      excerpt: article.excerpt || article.meta_description,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      cover_image_url: article.cover_image_url,
      content_type: article.content_type,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at,
      word_count: wordCount,
      reading_time: readingTime,
      first_name: 'Houston',
      last_name: 'Omegas',
      source: 'seo',
    }, 600);
  } catch (err) {
    console.error('SEO Engine error:', err);
    return error('Failed to fetch article', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

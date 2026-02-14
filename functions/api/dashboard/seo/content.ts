import type { Env } from '../../../types';
import { json, error, options } from '../../../lib/response';
import { requireAuth } from '../../../lib/auth';
import { createSEOEngine } from '../../../lib/seo-engine';
import { EXEC_ROLES } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const result = await requireAuth(request, env.DB, EXEC_ROLES);
  if (result.errorResponse) return result.errorResponse;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

  try {
    const seo = createSEOEngine(env);
    const data = await seo.getArticles({ status, page, limit });

    const articles = data.articles.map((article) => {
      const wordCount = article.body?.split(/\s+/).length || 0;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      return {
        ...article,
        word_count: wordCount,
        reading_time: readingTime,
      };
    });

    return json({ articles, total: data.total, page, limit });
  } catch (err) {
    console.error('SEO Engine content error:', err);
    return error('Failed to fetch content', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const result = await requireAuth(request, env.DB, EXEC_ROLES);
  if (result.errorResponse) return result.errorResponse;

  try {
    const body = await request.json() as { action: 'approve' | 'reject'; id: number };
    const { action, id } = body;

    if (!action || !id) {
      return error('Action and ID are required', 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return error('Invalid action', 400);
    }

    const seo = createSEOEngine(env);

    if (action === 'approve') {
      await seo.approveArticle(id);
    } else {
      await seo.rejectArticle(id);
    }

    return json({ success: true, action, id });
  } catch (err) {
    console.error('SEO Engine action error:', err);
    return error('Failed to perform action', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

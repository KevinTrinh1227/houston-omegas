import type { Env } from '../../../types';
import { json, error, options } from '../../../lib/response';
import { verifySession, EXEC_ROLES } from '../../../lib/auth';
import { createSEOEngine } from '../../../lib/seo-engine';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const session = await verifySession(request, env);
  if (!session || !EXEC_ROLES.includes(session.role)) {
    return error('Unauthorized', 401);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

  try {
    const seo = createSEOEngine(env);
    const { articles, total } = await seo.getArticles({ status, page, limit });
    return json({ articles, total, page, limit });
  } catch (err) {
    console.error('SEO content error:', err);
    return error('Failed to fetch content', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const session = await verifySession(request, env);
  if (!session || !EXEC_ROLES.includes(session.role)) {
    return error('Unauthorized', 401);
  }

  try {
    const body = await request.json() as { action: string; id: number };
    const { action, id } = body;

    if (!action || !id) {
      return error('Action and ID are required', 400);
    }

    const seo = createSEOEngine(env);

    if (action === 'approve') {
      const success = await seo.approveArticle(id);
      if (!success) {
        return error('Failed to approve article', 500);
      }
      return json({ success: true, message: 'Article approved' });
    }

    if (action === 'reject') {
      const success = await seo.rejectArticle(id);
      if (!success) {
        return error('Failed to reject article', 500);
      }
      return json({ success: true, message: 'Article rejected' });
    }

    return error('Invalid action', 400);
  } catch (err) {
    console.error('SEO content action error:', err);
    return error('Failed to process action', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES, 'active']);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    // Active members see only their own + published; exec sees all
    let query: string;
    let bindings: (string | number)[];

    if (EXEC_ROLES.includes(result.auth.member.role)) {
      query = `SELECT p.*, m.first_name, m.last_name
               FROM blog_posts p
               LEFT JOIN members m ON p.author_id = m.id
               ORDER BY p.created_at DESC
               LIMIT ? OFFSET ?`;
      bindings = [limit, offset];
    } else {
      query = `SELECT p.*, m.first_name, m.last_name
               FROM blog_posts p
               LEFT JOIN members m ON p.author_id = m.id
               WHERE p.author_id = ? OR p.status = 'published'
               ORDER BY p.created_at DESC
               LIMIT ? OFFSET ?`;
      bindings = [result.auth.member.id, limit, offset];
    }

    const posts = await context.env.DB.prepare(query).bind(...bindings).all();

    return json({ posts: posts.results });
  } catch {
    return error('Internal server error', 500);
  }
};

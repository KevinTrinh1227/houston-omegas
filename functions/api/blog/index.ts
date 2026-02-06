import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, jsonCached, error, options } from '../../lib/response';
import { sanitize, slugify } from '../../lib/validate';

// GET: Public - published posts (cached, paginated)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12')));
    const offset = (page - 1) * limit;

    const [posts, countResult] = await Promise.all([
      context.env.DB.prepare(
        `SELECT p.id, p.slug, p.title, p.excerpt, p.cover_image_url, p.published_at, p.views,
                m.first_name, m.last_name
         FROM blog_posts p
         LEFT JOIN members m ON p.author_id = m.id
         WHERE p.status = 'published'
         ORDER BY p.published_at DESC
         LIMIT ? OFFSET ?`
      ).bind(limit, offset).all(),
      context.env.DB.prepare(
        `SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'`
      ).first(),
    ]);

    return jsonCached({
      posts: posts.results,
      total: countResult?.count ?? 0,
      page,
      limit,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Exec/Active - create post
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES, 'active']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, string>;
    const title = sanitize(body.title);
    const bodyText = body.body || '';
    const excerpt = sanitize(body.excerpt) || null;
    const coverImageUrl = sanitize(body.cover_image_url) || null;
    const status = body.status || 'draft';
    let slug = sanitize(body.slug);

    if (!title || !bodyText) {
      return error('Title and body are required');
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      return error('Invalid status');
    }

    if (!slug) {
      slug = slugify(title);
    }

    // Ensure unique slug
    const existing = await context.env.DB.prepare(
      `SELECT id FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const post = await context.env.DB.prepare(
      `INSERT INTO blog_posts (slug, title, excerpt, body, cover_image_url, status, author_id, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(slug, title, excerpt, bodyText, coverImageUrl, status, result.auth.member.id, publishedAt).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_post', 'blog_post', String(post?.id), { title, status }, ip);

    return json(post, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

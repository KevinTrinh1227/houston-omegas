import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { authenticate, requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, jsonCached, error, options } from '../../lib/response';
import { sanitize, slugify } from '../../lib/validate';

// GET: Public for published, auth for drafts
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const slug = (context.params as { slug: string }).slug;

    const post = await context.env.DB.prepare(
      `SELECT p.*, m.first_name, m.last_name
       FROM blog_posts p
       LEFT JOIN members m ON p.author_id = m.id
       WHERE p.slug = ?`
    ).bind(slug).first();

    if (!post) return error('Post not found', 404);

    // If draft, require auth
    if (post.status !== 'published') {
      const auth = await authenticate(context.request, context.env.DB);
      if (!auth) return error('Unauthorized', 401);
    }

    // Increment views for published posts
    if (post.status === 'published') {
      await context.env.DB.prepare(
        `UPDATE blog_posts SET views = views + 1 WHERE slug = ?`
      ).bind(slug).run();
    }

    // Get tags
    const tags = await context.env.DB.prepare(
      `SELECT t.name, t.slug FROM blog_tags t
       JOIN blog_post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?`
    ).bind(post.id).all();

    const result = { ...post, tags: tags.results };

    if (post.status === 'published') {
      return jsonCached(result);
    }
    return json(result);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Author or exec - update post
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES, 'active']);
    if (result.errorResponse) return result.errorResponse;

    const slugParam = (context.params as { slug: string }).slug;

    const existing = await context.env.DB.prepare(
      `SELECT id, author_id, status FROM blog_posts WHERE slug = ?`
    ).bind(slugParam).first();

    if (!existing) return error('Post not found', 404);

    // Only author or exec can edit
    if (existing.author_id !== result.auth.member.id && !EXEC_ROLES.includes(result.auth.member.role)) {
      return error('Forbidden', 403);
    }

    const body = await context.request.json() as Record<string, string>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); values.push(sanitize(body.title)); }
    if (body.body !== undefined) { fields.push('body = ?'); values.push(body.body); }
    if (body.excerpt !== undefined) { fields.push('excerpt = ?'); values.push(sanitize(body.excerpt) || null); }
    if (body.cover_image_url !== undefined) { fields.push('cover_image_url = ?'); values.push(sanitize(body.cover_image_url) || null); }
    if (body.slug !== undefined) {
      const newSlug = slugify(body.slug);
      if (newSlug && newSlug !== slugParam) {
        const slugExists = await context.env.DB.prepare(
          `SELECT id FROM blog_posts WHERE slug = ? AND id != ?`
        ).bind(newSlug, existing.id).first();
        if (slugExists) return error('Slug already in use');
        fields.push('slug = ?');
        values.push(newSlug);
      }
    }
    if (body.status !== undefined) {
      if (!['draft', 'published', 'archived'].includes(body.status)) return error('Invalid status');
      fields.push('status = ?');
      values.push(body.status);
      // Set published_at if publishing for first time
      if (body.status === 'published' && existing.status !== 'published') {
        fields.push('published_at = datetime(\'now\')');
      }
    }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(existing.id as number);

    const updated = await context.env.DB.prepare(
      `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_post', 'blog_post', String(existing.id), { slug: slugParam }, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Author or exec
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES, 'active']);
    if (result.errorResponse) return result.errorResponse;

    const slugParam = (context.params as { slug: string }).slug;

    const existing = await context.env.DB.prepare(
      `SELECT id, author_id FROM blog_posts WHERE slug = ?`
    ).bind(slugParam).first();

    if (!existing) return error('Post not found', 404);

    if (existing.author_id !== result.auth.member.id && !EXEC_ROLES.includes(result.auth.member.role)) {
      return error('Forbidden', 403);
    }

    // Delete tags first
    await context.env.DB.prepare(`DELETE FROM blog_post_tags WHERE post_id = ?`).bind(existing.id).run();
    await context.env.DB.prepare(`DELETE FROM blog_posts WHERE id = ?`).bind(existing.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_post', 'blog_post', String(existing.id), { slug: slugParam }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

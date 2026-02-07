import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

// GET: Get wiki page by slug
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const slug = (context.params as { slug: string }).slug;
    const page = await context.env.DB.prepare(
      `SELECT w.*, m.first_name as author_first, m.last_name as author_last
       FROM wiki_pages w
       LEFT JOIN members m ON w.created_by = m.id
       WHERE w.slug = ?`
    ).bind(slug).first();

    if (!page) return error('Page not found', 404);

    return json(page);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Update wiki page (exec only)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const slug = (context.params as { slug: string }).slug;
    const body = await context.request.json() as Record<string, string | number | null>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); values.push(sanitize(body.title as string)); }
    if (body.body !== undefined) { fields.push('body = ?'); values.push(sanitize(body.body as string)); }
    if (body.category !== undefined) { fields.push('category = ?'); values.push(sanitize(body.category as string) || 'general'); }
    if (body.role_tag !== undefined) { fields.push('role_tag = ?'); values.push(body.role_tag ? sanitize(body.role_tag as string) : null); }
    if (body.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(typeof body.sort_order === 'number' ? body.sort_order : 0); }

    if (fields.length === 0) return error('No fields to update');

    fields.push('updated_by = ?');
    values.push(result.auth.member.id);
    fields.push("updated_at = datetime('now')");
    // slug goes into WHERE clause, not a SET field — push it separately after the datetime literal
    values.push(slug);

    const updated = await context.env.DB.prepare(
      `UPDATE wiki_pages SET ${fields.join(', ')} WHERE slug = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Page not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_wiki_page', 'wiki', updated.id as string, { slug }, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Delete wiki page (exec only)
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const slug = (context.params as { slug: string }).slug;

    const page = await context.env.DB.prepare(
      `SELECT id FROM wiki_pages WHERE slug = ?`
    ).bind(slug).first();

    if (!page) return error('Page not found', 404);

    await context.env.DB.prepare(
      `DELETE FROM wiki_pages WHERE slug = ?`
    ).bind(slug).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_wiki_page', 'wiki', page.id as string, { slug }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

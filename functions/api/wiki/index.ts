import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit, generateId } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize, slugify } from '../../lib/validate';

// GET: List all wiki pages (any authenticated user)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const rows = await context.env.DB.prepare(
      `SELECT id, slug, title, category, role_tag, sort_order, created_at, updated_at
       FROM wiki_pages ORDER BY category, sort_order, title`
    ).all();

    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Create wiki page (exec only)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, string | number>;
    const title = sanitize(body.title as string);
    const bodyText = sanitize(body.body as string);
    const category = sanitize(body.category as string) || 'general';
    const roleTag = body.role_tag ? sanitize(body.role_tag as string) : null;
    const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : 0;

    if (!title) return error('Title is required');
    if (!bodyText) return error('Body is required');

    const slug = slugify(title);
    if (!slug) return error('Could not generate slug from title');

    // Check slug uniqueness
    const existing = await context.env.DB.prepare(
      `SELECT id FROM wiki_pages WHERE slug = ?`
    ).bind(slug).first();
    if (existing) return error('A page with this title already exists');

    const id = generateId();
    const page = await context.env.DB.prepare(
      `INSERT INTO wiki_pages (id, slug, title, body, category, role_tag, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(id, slug, title, bodyText, category, roleTag, sortOrder, result.auth.member.id).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_wiki_page', 'wiki', id, { title, slug }, ip);

    return json(page, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

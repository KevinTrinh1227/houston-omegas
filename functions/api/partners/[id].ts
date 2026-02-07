import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, jsonCached, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

// GET: Public - single partner by id or slug
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const idOrSlug = (context.params as Record<string, string>).id;

    const row = await context.env.DB.prepare(
      `SELECT * FROM partners WHERE (id = ? OR slug = ?) AND is_active = 1`
    ).bind(idOrSlug, idOrSlug).first();

    if (!row) return error('Partner not found', 404);
    return jsonCached(row);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Exec only - update partner
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as Record<string, string>).id;
    const existing = await context.env.DB.prepare('SELECT * FROM partners WHERE id = ?').bind(id).first();
    if (!existing) return error('Partner not found', 404);

    const body = await context.request.json() as Record<string, unknown>;

    const fields: string[] = [];
    const values: unknown[] = [];

    const textFields = ['name', 'description', 'logo_url', 'website_url', 'instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'email', 'phone', 'category', 'tier'];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(sanitize(body[field] as string) || null);
      }
    }

    if (body.images !== undefined) {
      fields.push('images = ?');
      values.push(JSON.stringify(body.images));
    }

    for (const field of ['is_active', 'is_current']) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(body[field] ? 1 : 0);
      }
    }

    if (body.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(body.sort_order);
    }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_by = ?", "updated_at = datetime('now')");
    values.push(result.auth.member.id);
    values.push(id);

    await context.env.DB.prepare(
      `UPDATE partners SET ${fields.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_partner', 'partner', id, { fields: Object.keys(body) }, ip);

    const updated = await context.env.DB.prepare('SELECT * FROM partners WHERE id = ?').bind(id).first();
    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Exec only - soft delete
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as Record<string, string>).id;
    const existing = await context.env.DB.prepare('SELECT id, name FROM partners WHERE id = ?').bind(id).first();
    if (!existing) return error('Partner not found', 404);

    await context.env.DB.prepare(
      `UPDATE partners SET is_active = 0, updated_by = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(result.auth.member.id, id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_partner', 'partner', id, { name: (existing as Record<string, unknown>).name }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

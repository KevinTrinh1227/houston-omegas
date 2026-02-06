import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const org = await context.env.DB.prepare(`SELECT * FROM greek_orgs WHERE id = ?`).bind(id).first();
    if (!org) return error('Organization not found', 404);

    const mixers = await context.env.DB.prepare(
      `SELECT * FROM mixer_events WHERE org_id = ? ORDER BY event_date DESC`
    ).bind(id).all();

    return json({ ...org, mixers: mixers.results });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpx']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    const textFields = ['name', 'letters', 'council', 'chapter', 'instagram', 'contact_name', 'contact_email', 'contact_phone', 'website', 'notes'];
    for (const f of textFields) {
      if (body[f] !== undefined) { fields.push(`${f} = ?`); values.push(sanitize(body[f] as string) || null); }
    }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active ? 1 : 0); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE greek_orgs SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Organization not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_greek_org', 'greek_org', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpx']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    await context.env.DB.prepare(`UPDATE greek_orgs SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'deactivate_greek_org', 'greek_org', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

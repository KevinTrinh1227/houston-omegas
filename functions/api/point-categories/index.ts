import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const rows = await context.env.DB.prepare(`SELECT * FROM point_categories WHERE is_active = 1 ORDER BY name`).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpi']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const name = sanitize(body.name as string);
    const default_points = Number(body.default_points) || 1;
    const description = sanitize(body.description as string) || null;

    if (!name) return error('Name is required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO point_categories (id, name, default_points, description) VALUES (?, ?, ?, ?)`
    ).bind(id, name, default_points, description).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_point_category', 'point_category', id, { name }, ip);

    return json({ id, name, default_points, description }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const council = url.searchParams.get('council');

    let query = `SELECT * FROM greek_orgs WHERE is_active = 1`;
    const params: string[] = [];
    if (council) { query += ` AND council = ?`; params.push(council); }
    query += ` ORDER BY name`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpx']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const name = sanitize(body.name as string);
    const letters = sanitize(body.letters as string);
    const council = sanitize(body.council as string);

    if (!name || !letters || !council) return error('Name, letters, and council are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO greek_orgs (id, name, letters, council, chapter, instagram, contact_name, contact_email, contact_phone, website, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, name, letters, council,
      sanitize(body.chapter as string) || null,
      sanitize(body.instagram as string) || null,
      sanitize(body.contact_name as string) || null,
      sanitize(body.contact_email as string) || null,
      sanitize(body.contact_phone as string) || null,
      sanitize(body.website as string) || null,
      sanitize(body.notes as string) || null,
      result.auth.member.id
    ).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_greek_org', 'greek_org', id, { name, letters }, ip);

    return json({ id, name, letters, council }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

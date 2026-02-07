import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let query = `SELECT p.*, m.first_name as creator_first, m.last_name as creator_last
                 FROM prospects p JOIN members m ON p.created_by = m.id`;
    const conditions: string[] = [];
    const params: string[] = [];

    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (search) {
      conditions.push('(p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.instagram LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY p.created_at DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const first_name = sanitize(body.first_name as string);
    const last_name = sanitize(body.last_name as string);
    const email = sanitize(body.email as string) || null;
    const phone = sanitize(body.phone as string) || null;
    const instagram = sanitize(body.instagram as string) || null;
    const age = body.age !== undefined && body.age !== null ? Number(body.age) : null;
    const major = sanitize(body.major as string) || null;
    const is_uh_student = body.is_uh_student !== undefined ? (body.is_uh_student ? 1 : 0) : 1;
    const status = sanitize(body.status as string) || 'new';
    const notes = sanitize(body.notes as string) || null;
    const assigned_members = Array.isArray(body.assigned_members) ? JSON.stringify(body.assigned_members) : '[]';

    if (!first_name || !last_name) return error('first_name and last_name are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO prospects (id, first_name, last_name, email, phone, instagram, age, major, is_uh_student, status, notes, assigned_members, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, first_name, last_name, email, phone, instagram, age, major, is_uh_student, status, notes, assigned_members, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_prospect', 'prospect', id, { first_name, last_name }, ip);

    const prospect = await context.env.DB.prepare(`SELECT * FROM prospects WHERE id = ?`).bind(id).first();
    return json(prospect, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

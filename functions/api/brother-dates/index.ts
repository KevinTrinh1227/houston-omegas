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
    const semester_id = url.searchParams.get('semester_id');
    const status = url.searchParams.get('status'); // pending, approved

    let query = `SELECT bd.*, m1.first_name as m1_first, m1.last_name as m1_last,
                 m2.first_name as m2_first, m2.last_name as m2_last
                 FROM brother_dates bd
                 JOIN members m1 ON bd.member1_id = m1.id
                 JOIN members m2 ON bd.member2_id = m2.id`;
    const conditions: string[] = [];
    const params: string[] = [];

    if (semester_id) { conditions.push('bd.semester_id = ?'); params.push(semester_id); }
    if (status === 'pending') conditions.push('bd.approved = 0');
    else if (status === 'approved') conditions.push('bd.approved = 1');
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY bd.date DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    let member1_id = sanitize(body.member1_id as string) || result.auth.member.id;
    let member2_id = sanitize(body.member2_id as string);
    const date = sanitize(body.date as string);
    const semester_id = sanitize(body.semester_id as string);
    const description = sanitize(body.description as string) || null;

    if (!member2_id || !date || !semester_id) return error('member2_id, date, and semester_id are required');
    if (member1_id === member2_id) return error('Cannot create a brother date with yourself');

    // Ensure member1_id < member2_id for constraint
    if (member1_id > member2_id) [member1_id, member2_id] = [member2_id, member1_id];

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO brother_dates (id, member1_id, member2_id, date, semester_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, member1_id, member2_id, date, semester_id, description).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'submit_brother_date', 'brother_date', id, { member1_id, member2_id }, ip);

    return json({ id }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

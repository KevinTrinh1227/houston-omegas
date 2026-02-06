import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
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
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    let query = `SELECT d.*, m.first_name, m.last_name, m.email
                 FROM dues d JOIN members m ON d.member_id = m.id`;
    const params: string[] = [];

    if (!isExec) {
      query += ` WHERE d.member_id = ?`;
      params.push(result.auth.member.id);
      if (semester_id) { query += ` AND d.semester_id = ?`; params.push(semester_id); }
    } else if (semester_id) {
      query += ` WHERE d.semester_id = ?`;
      params.push(semester_id);
    }

    query += ` ORDER BY m.last_name, m.first_name`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'treasurer']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const member_id = sanitize(body.member_id as string);
    const semester_id = sanitize(body.semester_id as string);
    const amount_due = Number(body.amount_due) || 0;
    const notes = sanitize(body.notes as string) || null;

    if (!member_id || !semester_id) return error('member_id and semester_id are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO dues (id, member_id, semester_id, amount_due, notes)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(id, member_id, semester_id, amount_due, notes).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_dues', 'dues', id, { member_id, semester_id, amount_due }, ip);

    return json({ id, member_id, semester_id, amount_due, amount_paid: 0, status: 'unpaid' }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

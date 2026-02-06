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

    const rows = await context.env.DB.prepare(
      `SELECT * FROM semesters ORDER BY start_date DESC`
    ).all();

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
    const name = sanitize(body.name as string);
    const start_date = sanitize(body.start_date as string);
    const end_date = sanitize(body.end_date as string);
    const dues_amount = Number(body.dues_amount) || 0;
    const is_current = body.is_current ? 1 : 0;

    if (!name || !start_date || !end_date) return error('Name, start_date, and end_date are required');
    if (dues_amount < 0) return error('Dues amount must be non-negative');

    const id = generateId();

    // If marking as current, unset all others
    if (is_current) {
      await context.env.DB.prepare(`UPDATE semesters SET is_current = 0`).run();
    }

    await context.env.DB.prepare(
      `INSERT INTO semesters (id, name, start_date, end_date, dues_amount, is_current)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, name, start_date, end_date, dues_amount, is_current).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_semester', 'semester', id, { name }, ip);

    return json({ id, name, start_date, end_date, dues_amount, is_current }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

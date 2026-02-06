import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'treasurer']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { semester_id: string };
    const semester_id = sanitize(body.semester_id);
    if (!semester_id) return error('semester_id is required');

    const semester = await context.env.DB.prepare(
      `SELECT * FROM semesters WHERE id = ?`
    ).bind(semester_id).first();
    if (!semester) return error('Semester not found', 404);

    // Get all active members who don't already have dues for this semester
    const members = await context.env.DB.prepare(
      `SELECT m.id FROM members m
       WHERE m.is_active = 1 AND m.role NOT IN ('inactive', 'alumni')
       AND m.id NOT IN (SELECT member_id FROM dues WHERE semester_id = ?)`
    ).bind(semester_id).all();

    let created = 0;
    for (const m of members.results) {
      const id = generateId();
      await context.env.DB.prepare(
        `INSERT INTO dues (id, member_id, semester_id, amount_due) VALUES (?, ?, ?, ?)`
      ).bind(id, m.id, semester_id, semester.dues_amount).run();
      created++;
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'bulk_create_dues', 'semester', semester_id, { created }, ip);

    return json({ created });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

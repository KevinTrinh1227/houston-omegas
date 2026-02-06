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
    const meeting_type = url.searchParams.get('meeting_type');
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    let query = `SELECT mt.*, m.first_name as creator_first, m.last_name as creator_last
                 FROM meetings mt JOIN members m ON mt.created_by = m.id`;
    const conditions: string[] = [];
    const params: string[] = [];

    if (semester_id) { conditions.push('mt.semester_id = ?'); params.push(semester_id); }
    if (meeting_type) { conditions.push('mt.meeting_type = ?'); params.push(meeting_type); }
    // Non-exec can't see exec meetings
    if (!isExec) conditions.push("mt.meeting_type != 'exec'");
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY mt.meeting_date DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'secretary']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const title = sanitize(body.title as string);
    const meeting_type = sanitize(body.meeting_type as string) || 'chapter';
    const meeting_date = sanitize(body.meeting_date as string);
    const semester_id = sanitize(body.semester_id as string) || null;
    const notes = body.notes as string || null; // Don't sanitize markdown aggressively

    if (!title || !meeting_date) return error('Title and meeting_date are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO meetings (id, title, meeting_type, meeting_date, semester_id, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, title, meeting_type, meeting_date, semester_id, notes, result.auth.member.id).run();

    // Create action items if provided
    const actionItems = body.action_items as { description: string; assigned_to?: string; due_date?: string }[] | undefined;
    if (actionItems?.length) {
      for (const item of actionItems) {
        const aiId = generateId();
        await context.env.DB.prepare(
          `INSERT INTO action_items (id, meeting_id, description, assigned_to, due_date) VALUES (?, ?, ?, ?, ?)`
        ).bind(aiId, id, sanitize(item.description), item.assigned_to || null, item.due_date || null).run();
      }
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_meeting', 'meeting', id, { title, meeting_type }, ip);

    return json({ id, title, meeting_type, meeting_date }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

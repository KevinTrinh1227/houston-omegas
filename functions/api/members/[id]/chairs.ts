import type { Env } from '../../../types';
import { EXEC_ROLES } from '../../../types';
import { requireAuth, logAudit } from '../../../lib/auth';
import { getClientIP } from '../../../lib/rate-limit';
import { json, error, options } from '../../../lib/response';

// GET: Get member's chairs
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const memberId = (context.params as { id: string }).id;

    const chairs = await context.env.DB.prepare(
      `SELECT mc.id, mc.chair_name, mc.created_at, ac.display_name
       FROM member_chairs mc
       JOIN available_chairs ac ON mc.chair_name = ac.name
       WHERE mc.member_id = ?
       ORDER BY ac.display_name ASC`
    ).bind(memberId).all();

    return json(chairs.results || []);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Update member's chairs (replace all)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const memberId = (context.params as { id: string }).id;
    const body = await context.request.json() as { chairs: string[] };
    const chairs = body.chairs || [];

    // Remove existing chairs
    await context.env.DB.prepare(
      `DELETE FROM member_chairs WHERE member_id = ?`
    ).bind(memberId).run();

    // Add new chairs
    for (const chairName of chairs) {
      await context.env.DB.prepare(
        `INSERT OR IGNORE INTO member_chairs (member_id, chair_name, assigned_by)
         VALUES (?, ?, ?)`
      ).bind(memberId, chairName, result.auth.member.id).run();
    }

    // Also update the legacy chair_position field with the first chair (for backwards compatibility)
    const primaryChair = chairs.length > 0 ? chairs[0] : null;
    await context.env.DB.prepare(
      `UPDATE members SET chair_position = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(primaryChair, memberId).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_member_chairs', 'member', memberId, { chairs }, ip);

    return json({ success: true, chairs });
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Add a single chair to member
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const memberId = (context.params as { id: string }).id;
    const body = await context.request.json() as { chair_name: string };
    const chairName = body.chair_name;

    if (!chairName) return error('Chair name is required');

    // Check if chair exists
    const chair = await context.env.DB.prepare(
      `SELECT name FROM available_chairs WHERE name = ? AND is_active = 1`
    ).bind(chairName).first();

    if (!chair) return error('Invalid chair position');

    // Add chair
    await context.env.DB.prepare(
      `INSERT OR IGNORE INTO member_chairs (member_id, chair_name, assigned_by)
       VALUES (?, ?, ?)`
    ).bind(memberId, chairName, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'add_member_chair', 'member', memberId, { chair_name: chairName }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Remove a chair from member
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const memberId = (context.params as { id: string }).id;
    const url = new URL(context.request.url);
    const chairName = url.searchParams.get('chair');

    if (!chairName) return error('Chair name is required');

    await context.env.DB.prepare(
      `DELETE FROM member_chairs WHERE member_id = ? AND chair_name = ?`
    ).bind(memberId, chairName).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'remove_member_chair', 'member', memberId, { chair_name: chairName }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, jsonCached, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';
import { notifyNewAnnouncement } from '../../lib/notify';

// GET: Public - active announcements (cached)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const rows = await context.env.DB.prepare(
      `SELECT id, title, body, type, priority, link_url, link_text, starts_at, ends_at, image_url, target_pages, display_mode
       FROM announcements
       WHERE is_active = 1
         AND (starts_at IS NULL OR starts_at <= datetime('now'))
         AND (ends_at IS NULL OR ends_at >= datetime('now'))
       ORDER BY
         CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
         created_at DESC`
    ).all();

    return jsonCached(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Exec only - create announcement
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, string>;
    const title = sanitize(body.title);
    const bodyText = sanitize(body.body);
    const type = body.type || 'banner';
    const priority = body.priority || 'normal';
    const linkUrl = sanitize(body.link_url) || null;
    const linkText = sanitize(body.link_text) || null;
    const startsAt = body.starts_at || null;
    const endsAt = body.ends_at || null;
    const imageUrl = sanitize(body.image_url) || null;
    const targetPages = body.target_pages || '[]';
    const displayMode = body.display_mode || 'toast';

    if (!title || !bodyText) {
      return error('Title and body are required');
    }

    if (!['banner', 'popup', 'both'].includes(type)) {
      return error('Invalid type');
    }
    if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
      return error('Invalid priority');
    }
    if (!['toast', 'center', 'image_only'].includes(displayMode)) {
      return error('Invalid display mode');
    }

    const res = await context.env.DB.prepare(
      `INSERT INTO announcements (title, body, type, priority, link_url, link_text, starts_at, ends_at, image_url, target_pages, display_mode, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    ).bind(title, bodyText, type, priority, linkUrl, linkText, startsAt, endsAt, imageUrl, targetPages, displayMode, result.auth.member.id).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_announcement', 'announcement', String(res?.id), { title }, ip);

    await notifyNewAnnouncement(context.env.DISCORD_WEBHOOK_URL, title, `${result.auth.member.first_name} ${result.auth.member.last_name}`);

    return json(res, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

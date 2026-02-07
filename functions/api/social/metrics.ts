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
    const account_id = url.searchParams.get('account_id');

    if (!account_id) return error('account_id query parameter is required');

    const rows = await context.env.DB.prepare(
      `SELECT * FROM social_metrics WHERE account_id = ? ORDER BY recorded_date DESC LIMIT 30`
    ).bind(account_id).all();

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
    const account_id = sanitize(body.account_id as string);
    const recorded_date = sanitize(body.recorded_date as string);
    const followers = Number(body.followers) || 0;
    const following = Number(body.following) || 0;
    const posts_count = Number(body.posts_count) || 0;
    const likes = Number(body.likes) || 0;
    const comments = Number(body.comments) || 0;
    const views = Number(body.views) || 0;
    const notes = sanitize(body.notes as string) || null;

    if (!account_id || !recorded_date) return error('account_id and recorded_date are required');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(recorded_date)) return error('recorded_date must be YYYY-MM-DD format');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO social_metrics (id, account_id, recorded_date, followers, following, posts_count, likes, comments, views, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(account_id, recorded_date) DO UPDATE SET
         followers = excluded.followers,
         following = excluded.following,
         posts_count = excluded.posts_count,
         likes = excluded.likes,
         comments = excluded.comments,
         views = excluded.views,
         notes = excluded.notes,
         recorded_by = excluded.recorded_by`
    ).bind(id, account_id, recorded_date, followers, following, posts_count, likes, comments, views, notes, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'log_social_metrics', 'social_metrics', id, { account_id, recorded_date, followers }, ip);

    return json({ id, account_id, recorded_date }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

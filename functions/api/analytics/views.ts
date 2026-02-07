import type { Env } from '../../types';
import { requireAuth, type Member } from '../../lib/auth';

const EXEC_ROLES: Member['role'][] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { auth, errorResponse } = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
  if (errorResponse) return errorResponse;

  const url = new URL(context.request.url);
  const days = parseInt(url.searchParams.get('days') || '30');

  // Views by page
  const byPage = await context.env.DB.prepare(
    `SELECT page, COUNT(*) as views FROM page_views
     WHERE created_at > datetime('now', '-' || ? || ' days')
     GROUP BY page ORDER BY views DESC LIMIT 20`
  ).bind(days).all();

  // Views by day
  const byDay = await context.env.DB.prepare(
    `SELECT date(created_at) as day, COUNT(*) as views FROM page_views
     WHERE created_at > datetime('now', '-' || ? || ' days')
     GROUP BY day ORDER BY day ASC`
  ).bind(days).all();

  // Total views
  const total = await context.env.DB.prepare(
    `SELECT COUNT(*) as total FROM page_views WHERE created_at > datetime('now', '-' || ? || ' days')`
  ).bind(days).first();

  return new Response(JSON.stringify({
    by_page: byPage.results,
    by_day: byDay.results,
    total: (total?.total as number) || 0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

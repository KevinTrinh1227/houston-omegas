import type { Env } from '../../types';
import { requireAuth, type Member } from '../../lib/auth';

const EXEC_ROLES: Member['role'][] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { auth, errorResponse } = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
  if (errorResponse) return errorResponse;

  const url = new URL(context.request.url);
  const days = parseInt(url.searchParams.get('days') || '30');

  const [byPage, byDay, total, uniqueVisitors, byDayUnique, topReferrers] = await Promise.all([
    // Views by page
    context.env.DB.prepare(
      `SELECT page, COUNT(*) as views, COUNT(DISTINCT ip) as visitors FROM page_views
       WHERE created_at > datetime('now', '-' || ? || ' days')
       GROUP BY page ORDER BY views DESC LIMIT 20`
    ).bind(days).all(),

    // Views by day
    context.env.DB.prepare(
      `SELECT date(created_at) as day, COUNT(*) as views FROM page_views
       WHERE created_at > datetime('now', '-' || ? || ' days')
       GROUP BY day ORDER BY day ASC`
    ).bind(days).all(),

    // Total views
    context.env.DB.prepare(
      `SELECT COUNT(*) as total FROM page_views WHERE created_at > datetime('now', '-' || ? || ' days')`
    ).bind(days).first(),

    // Unique visitors (distinct IPs)
    context.env.DB.prepare(
      `SELECT COUNT(DISTINCT ip) as total FROM page_views WHERE created_at > datetime('now', '-' || ? || ' days')`
    ).bind(days).first(),

    // Unique visitors by day
    context.env.DB.prepare(
      `SELECT date(created_at) as day, COUNT(DISTINCT ip) as visitors FROM page_views
       WHERE created_at > datetime('now', '-' || ? || ' days')
       GROUP BY day ORDER BY day ASC`
    ).bind(days).all(),

    // Top referrers
    context.env.DB.prepare(
      `SELECT referrer, COUNT(*) as views FROM page_views
       WHERE created_at > datetime('now', '-' || ? || ' days') AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 10`
    ).bind(days).all(),
  ]);

  return new Response(JSON.stringify({
    by_page: byPage.results,
    by_day: byDay.results,
    by_day_unique: byDayUnique.results,
    top_referrers: topReferrers.results,
    total: (total?.total as number) || 0,
    unique_visitors: (uniqueVisitors?.total as number) || 0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

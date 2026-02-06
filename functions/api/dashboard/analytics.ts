import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president']);
    if (result.errorResponse) return result.errorResponse;

    const db = context.env.DB;

    const [
      activeUsers7d,
      activeUsers30d,
      totalMembers,
      activeMembers,
      duesStats,
      attendanceAvg,
      totalPoints,
      totalEvents,
      totalMeetings,
      totalDocuments,
      recentActivity,
    ] = await Promise.all([
      db.prepare(`SELECT COUNT(DISTINCT member_id) as count FROM activity_log WHERE created_at > datetime('now', '-7 days')`).first(),
      db.prepare(`SELECT COUNT(DISTINCT member_id) as count FROM activity_log WHERE created_at > datetime('now', '-30 days')`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM members`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM members WHERE is_active = 1`).first(),
      db.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid, SUM(amount_due) as total_due, SUM(amount_paid) as total_paid FROM dues`).first(),
      db.prepare(`SELECT AVG(pct) as avg_pct FROM (SELECT member_id, CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN status IN ('present','late') THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100) ELSE NULL END as pct FROM attendance GROUP BY member_id HAVING pct IS NOT NULL)`).first(),
      db.prepare(`SELECT COALESCE(SUM(points), 0) as total FROM points`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM events`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM meetings`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM documents`).first(),
      db.prepare(`SELECT action, page, COUNT(*) as count FROM activity_log WHERE created_at > datetime('now', '-7 days') GROUP BY action, page ORDER BY count DESC LIMIT 10`).all(),
    ]);

    return json({
      active_users_7d: activeUsers7d?.count ?? 0,
      active_users_30d: activeUsers30d?.count ?? 0,
      total_members: totalMembers?.count ?? 0,
      active_members: activeMembers?.count ?? 0,
      dues_collection_rate: (duesStats?.total && duesStats.total > 0) ? Math.round(((duesStats.paid as number) / (duesStats.total as number)) * 100) : 0,
      dues_total_due: duesStats?.total_due ?? 0,
      dues_total_paid: duesStats?.total_paid ?? 0,
      attendance_avg: attendanceAvg?.avg_pct ?? 0,
      total_points: totalPoints?.total ?? 0,
      total_events: totalEvents?.count ?? 0,
      total_meetings: totalMeetings?.count ?? 0,
      total_documents: totalDocuments?.count ?? 0,
      recent_activity: recentActivity.results,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

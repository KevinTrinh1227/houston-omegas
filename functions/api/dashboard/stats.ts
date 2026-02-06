import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const db = context.env.DB;

    const [
      totalMembers,
      activeMembers,
      publishedPosts,
      recruitmentSubmissions,
      inquirySubmissions,
      activeAnnouncements,
    ] = await Promise.all([
      db.prepare(`SELECT COUNT(*) as count FROM members`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM members WHERE is_active = 1`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM recruitment_submissions`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM inquiry_submissions`).first(),
      db.prepare(`SELECT COUNT(*) as count FROM announcements WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= datetime('now')) AND (ends_at IS NULL OR ends_at >= datetime('now'))`).first(),
    ]);

    return json({
      total_members: totalMembers?.count ?? 0,
      active_members: activeMembers?.count ?? 0,
      published_posts: publishedPosts?.count ?? 0,
      recruitment_submissions: recruitmentSubmissions?.count ?? 0,
      inquiry_submissions: inquirySubmissions?.count ?? 0,
      active_announcements: activeAnnouncements?.count ?? 0,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

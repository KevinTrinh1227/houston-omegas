import type { Env, ChairPosition } from '../../types';
import { requireChairOrExec } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// Roles that can view social analytics
const SOCIAL_CHAIRS: ChairPosition[] = ['social', 'social_media'];

interface PlatformStats {
  platform: string;
  followers: number;
  followersChange: number;
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

interface PostStats {
  postId: string;
  platform: string;
  platformUrl: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  publishedAt: string;
}

// GET /api/social/analytics - Get aggregated analytics
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireChairOrExec(context.request, context.env.DB, SOCIAL_CHAIRS);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const period = url.searchParams.get('period') || '30d';
    const platform = url.searchParams.get('platform'); // Optional: filter by platform

    // Calculate date range
    let daysBack = 30;
    if (period === '7d') daysBack = 7;
    else if (period === '90d') daysBack = 90;
    else if (period === '365d') daysBack = 365;

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get latest analytics snapshot per platform
    let platformQuery = `
      SELECT DISTINCT platform,
        FIRST_VALUE(followers) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as followers,
        FIRST_VALUE(followers_change) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as followers_change,
        FIRST_VALUE(reach) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as reach,
        FIRST_VALUE(impressions) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as impressions,
        FIRST_VALUE(engagement) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as engagement,
        FIRST_VALUE(likes) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as likes,
        FIRST_VALUE(comments) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as comments,
        FIRST_VALUE(shares) OVER (PARTITION BY platform ORDER BY fetched_at DESC) as shares
      FROM social_analytics
      WHERE period_start >= ?
    `;
    const queryParams: string[] = [startDate];

    if (platform) {
      platformQuery += ` AND platform = ?`;
      queryParams.push(platform);
    }

    const platformResults = await context.env.DB.prepare(platformQuery).bind(...queryParams).all();

    // Get top performing posts
    const topPostsQuery = `
      SELECT
        spp.post_id,
        spp.platform,
        spp.platform_url,
        sp.content,
        sp.published_at,
        COALESCE(spa.impressions, 0) as impressions,
        COALESCE(spa.reach, 0) as reach,
        COALESCE(spa.likes, 0) as likes,
        COALESCE(spa.comments, 0) as comments,
        COALESCE(spa.shares, 0) as shares,
        COALESCE(spa.engagement_rate, 0) as engagement_rate
      FROM social_post_platforms spp
      JOIN social_posts sp ON spp.post_id = sp.id
      LEFT JOIN social_post_analytics spa ON spp.id = spa.post_platform_id
      WHERE spp.status = 'published'
        AND sp.published_at >= ?
      ORDER BY COALESCE(spa.engagement_rate, 0) DESC, COALESCE(spa.reach, 0) DESC
      LIMIT 10
    `;

    const topPostsResult = await context.env.DB.prepare(topPostsQuery).bind(startDate).all();

    // Get post counts by status
    const postCountsQuery = `
      SELECT status, COUNT(*) as count
      FROM social_posts
      WHERE created_at >= ?
      GROUP BY status
    `;
    const postCountsResult = await context.env.DB.prepare(postCountsQuery).bind(startDate).all();

    // Get analytics over time for charting
    const timelineQuery = `
      SELECT
        date(period_start) as date,
        platform,
        followers,
        reach,
        engagement
      FROM social_analytics
      WHERE period_start >= ?
      ${platform ? 'AND platform = ?' : ''}
      ORDER BY period_start ASC
    `;
    const timelineParams = platform ? [startDate, platform] : [startDate];
    const timelineResult = await context.env.DB.prepare(timelineQuery).bind(...timelineParams).all();

    // Calculate totals
    const platforms = platformResults.results as PlatformStats[];
    const totals = {
      followers: platforms.reduce((sum, p) => sum + (p.followers || 0), 0),
      followersChange: platforms.reduce((sum, p) => sum + (p.followersChange || 0), 0),
      reach: platforms.reduce((sum, p) => sum + (p.reach || 0), 0),
      impressions: platforms.reduce((sum, p) => sum + (p.impressions || 0), 0),
      engagement: platforms.reduce((sum, p) => sum + (p.engagement || 0), 0),
    };

    return json({
      period,
      startDate,
      totals,
      byPlatform: platforms,
      topPosts: topPostsResult.results,
      postCounts: Object.fromEntries(
        (postCountsResult.results as Array<{ status: string; count: number }>)
          .map(r => [r.status, r.count])
      ),
      timeline: timelineResult.results,
    });
  } catch (e) {
    console.error('Error fetching analytics:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

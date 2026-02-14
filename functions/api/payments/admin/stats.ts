import type { Env } from '../../../types';
import { requireAuth } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'treasurer']);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const period = url.searchParams.get('period') || 'all';

    let dateFilter = '';
    const params: string[] = [];

    if (startDate && endDate) {
      dateFilter = ` AND created_at >= ? AND created_at < ?`;
      params.push(startDate, endDate);
    } else if (period === 'today') {
      dateFilter = ` AND date(created_at) = date('now')`;
    } else if (period === 'week') {
      dateFilter = ` AND created_at >= datetime('now', '-7 days')`;
    } else if (period === 'month') {
      dateFilter = ` AND created_at >= datetime('now', '-30 days')`;
    } else if (period === 'year') {
      dateFilter = ` AND created_at >= datetime('now', '-365 days')`;
    }

    // Get overall stats
    const statsQuery = `
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('paid', 'fulfilled') THEN 1 ELSE 0 END) as paid_orders,
        SUM(CASE WHEN status IN ('paid', 'fulfilled') THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status IN ('paid', 'fulfilled') THEN service_fee ELSE 0 END) as total_fees,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded_orders,
        SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed_orders,
        SUM(CASE WHEN status IN ('expired', 'cancelled') THEN 1 ELSE 0 END) as failed_orders
      FROM payment_orders
      WHERE 1=1 ${dateFilter}
    `;

    const stats = await context.env.DB.prepare(statsQuery).bind(...params).first();

    // Get revenue by type
    const revenueByTypeQuery = `
      SELECT
        json_extract(metadata, '$.type') as payment_type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM payment_orders
      WHERE status IN ('paid', 'fulfilled') ${dateFilter}
      GROUP BY json_extract(metadata, '$.type')
    `;

    const revenueByType = await context.env.DB.prepare(revenueByTypeQuery).bind(...params).all();

    // Get recent orders
    const recentQuery = `
      SELECT id, customer_email, status, amount, payment_method, card_brand, card_last4, paid_at, created_at, metadata
      FROM payment_orders
      WHERE 1=1 ${dateFilter}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const recentOrders = await context.env.DB.prepare(recentQuery).bind(...params).all();

    // Get daily revenue for chart (last 30 days)
    const dailyRevenueQuery = `
      SELECT
        date(paid_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as orders
      FROM payment_orders
      WHERE status IN ('paid', 'fulfilled') AND paid_at IS NOT NULL
        AND paid_at >= datetime('now', '-30 days')
      GROUP BY date(paid_at)
      ORDER BY date ASC
    `;

    const dailyRevenue = await context.env.DB.prepare(dailyRevenueQuery).all();

    return json({
      stats: {
        totalOrders: stats?.total_orders || 0,
        paidOrders: stats?.paid_orders || 0,
        totalRevenue: stats?.total_revenue || 0,
        totalFees: stats?.total_fees || 0,
        refundedOrders: stats?.refunded_orders || 0,
        disputedOrders: stats?.disputed_orders || 0,
        failedOrders: stats?.failed_orders || 0,
        netRevenue: ((stats?.total_revenue as number) || 0) - ((stats?.total_fees as number) || 0),
      },
      revenueByType: revenueByType.results.map(r => ({
        type: r.payment_type || 'other',
        count: r.count,
        total: r.total,
      })),
      recentOrders: recentOrders.results.map(o => ({
        ...o,
        metadata: o.metadata ? JSON.parse(o.metadata as string) : null,
      })),
      dailyRevenue: dailyRevenue.results,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return error('Failed to get payment stats', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

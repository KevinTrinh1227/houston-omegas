import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// GET: Get member statistics
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    // Total members
    const totalResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM members`
    ).first() as { count: number };

    // Active members
    const activeResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM members WHERE is_active = 1 AND membership_status = 'active'`
    ).first() as { count: number };

    // Inactive members
    const inactiveResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM members WHERE is_active = 0 OR membership_status = 'inactive'`
    ).first() as { count: number };

    // E-board members
    const eboardResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as count FROM members WHERE eboard_position IS NOT NULL`
    ).first() as { count: number };

    // By class year
    const classYearResult = await context.env.DB.prepare(
      `SELECT class_year, COUNT(*) as count FROM members
       WHERE class_year IS NOT NULL
       GROUP BY class_year
       ORDER BY class_year DESC`
    ).all();

    // By role
    const roleResult = await context.env.DB.prepare(
      `SELECT role, COUNT(*) as count FROM members
       GROUP BY role
       ORDER BY count DESC`
    ).all();

    // By chair
    const chairResult = await context.env.DB.prepare(
      `SELECT mc.chair_name, ac.display_name, COUNT(*) as count
       FROM member_chairs mc
       JOIN available_chairs ac ON mc.chair_name = ac.name
       GROUP BY mc.chair_name
       ORDER BY count DESC`
    ).all();

    // Growth data (members joined per month, last 12 months)
    const growthResult = await context.env.DB.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
       FROM members
       WHERE created_at >= date('now', '-12 months')
       GROUP BY strftime('%Y-%m', created_at)
       ORDER BY month ASC`
    ).all();

    // Format by class year
    const byClassYear: Record<string, number> = {};
    for (const row of classYearResult.results || []) {
      const r = row as { class_year: string; count: number };
      if (r.class_year) {
        byClassYear[r.class_year] = r.count;
      }
    }

    // Format by role
    const byRole: Record<string, number> = {};
    for (const row of roleResult.results || []) {
      const r = row as { role: string; count: number };
      byRole[r.role] = r.count;
    }

    // Format by chair
    const byChair: Record<string, number> = {};
    for (const row of chairResult.results || []) {
      const r = row as { chair_name: string; display_name: string; count: number };
      byChair[r.display_name || r.chair_name] = r.count;
    }

    // Format growth data
    const growthData = (growthResult.results || []).map((row) => {
      const r = row as { month: string; count: number };
      const [year, month] = r.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
        count: r.count,
      };
    });

    return json({
      total: totalResult?.count || 0,
      active: activeResult?.count || 0,
      inactive: inactiveResult?.count || 0,
      eboard: eboardResult?.count || 0,
      byClassYear,
      byRole,
      byChair,
      growthData,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

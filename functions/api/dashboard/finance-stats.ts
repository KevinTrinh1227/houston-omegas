import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const semester_id = url.searchParams.get('semester_id');
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    if (!isExec) return error('Forbidden', 403);

    let filter = '';
    const params: string[] = [];
    if (semester_id) {
      filter = ` WHERE d.semester_id = ?`;
      params.push(semester_id);
    }

    const stats = await context.env.DB.prepare(
      `SELECT
        COUNT(*) as total_records,
        SUM(d.amount_due) as total_due,
        SUM(d.amount_paid) as total_paid,
        SUM(CASE WHEN d.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN d.status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
        SUM(CASE WHEN d.status = 'partial' THEN 1 ELSE 0 END) as partial_count,
        SUM(CASE WHEN d.status = 'waived' THEN 1 ELSE 0 END) as waived_count,
        SUM(CASE WHEN d.status = 'exempt' THEN 1 ELSE 0 END) as exempt_count
       FROM dues d${filter}`
    ).bind(...params).first();

    return json({
      total_records: stats?.total_records ?? 0,
      total_due: stats?.total_due ?? 0,
      total_paid: stats?.total_paid ?? 0,
      paid_count: stats?.paid_count ?? 0,
      unpaid_count: stats?.unpaid_count ?? 0,
      partial_count: stats?.partial_count ?? 0,
      waived_count: stats?.waived_count ?? 0,
      exempt_count: stats?.exempt_count ?? 0,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

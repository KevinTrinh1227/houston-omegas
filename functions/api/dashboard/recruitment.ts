import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';

    let query: string;
    let countQuery: string;
    let bindings: (string | number)[];
    let countBindings: (string | number)[];

    if (search) {
      const searchTerm = `%${search}%`;
      query = `SELECT * FROM recruitment_submissions
               WHERE first_name LIKE ? OR last_name LIKE ? OR instagram LIKE ? OR phone LIKE ?
               ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      bindings = [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset];
      countQuery = `SELECT COUNT(*) as count FROM recruitment_submissions
                    WHERE first_name LIKE ? OR last_name LIKE ? OR instagram LIKE ? OR phone LIKE ?`;
      countBindings = [searchTerm, searchTerm, searchTerm, searchTerm];
    } else {
      query = `SELECT * FROM recruitment_submissions ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      bindings = [limit, offset];
      countQuery = `SELECT COUNT(*) as count FROM recruitment_submissions`;
      countBindings = [];
    }

    const [rows, countResult] = await Promise.all([
      context.env.DB.prepare(query).bind(...bindings).all(),
      context.env.DB.prepare(countQuery).bind(...countBindings).first(),
    ]);

    return json({
      submissions: rows.results,
      total: countResult?.count ?? 0,
      page,
      limit,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

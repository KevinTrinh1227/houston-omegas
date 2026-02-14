import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// GET: List all available chairs
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const chairs = await context.env.DB.prepare(
      `SELECT id, name, display_name, description, is_active
       FROM available_chairs
       ORDER BY display_name ASC`
    ).all();

    return json(chairs.results || []);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

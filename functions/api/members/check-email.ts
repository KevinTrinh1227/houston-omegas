import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// GET: Check if email exists
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const email = url.searchParams.get('email')?.toLowerCase().trim();

    if (!email) return error('Email is required');

    const existing = await context.env.DB.prepare(
      `SELECT id FROM members WHERE LOWER(email) = ?`
    ).bind(email).first();

    return json({ exists: !!existing });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

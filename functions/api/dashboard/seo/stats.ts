import type { Env } from '../../../types';
import { json, error, options } from '../../../lib/response';
import { requireAuth } from '../../../lib/auth';
import { createSEOEngine } from '../../../lib/seo-engine';
import { EXEC_ROLES } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const result = await requireAuth(request, env.DB, EXEC_ROLES);
  if (result.errorResponse) return result.errorResponse;

  try {
    const seo = createSEOEngine(env);
    const stats = await seo.getStats();
    return json(stats);
  } catch (err) {
    console.error('SEO Engine stats error:', err);
    return error('Failed to fetch SEO stats', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

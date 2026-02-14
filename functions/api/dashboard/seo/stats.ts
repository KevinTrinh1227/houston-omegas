import type { Env } from '../../../types';
import { json, error, options } from '../../../lib/response';
import { verifySession, EXEC_ROLES } from '../../../lib/auth';
import { createSEOEngine } from '../../../lib/seo-engine';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const session = await verifySession(request, env);
  if (!session || !EXEC_ROLES.includes(session.role)) {
    return error('Unauthorized', 401);
  }

  try {
    const seo = createSEOEngine(env);
    const stats = await seo.getStats();
    return json(stats);
  } catch (err) {
    console.error('SEO stats error:', err);
    return error('Failed to fetch stats', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

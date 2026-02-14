import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';
import { getActivityFeed, logActivity } from '../../lib/permissions';
import { EXEC_ROLES } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    if (!EXEC_ROLES.includes(result.auth.member.role)) {
      return error('Forbidden', 403);
    }

    const url = new URL(context.request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const activities = await getActivityFeed(context.env.DB, limit, offset);

    return json({ activities });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as {
      action_type: string;
      description: string;
      entity_type?: string;
      entity_id?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.action_type || !body.description) {
      return error('action_type and description are required');
    }

    await logActivity(
      context.env.DB,
      result.auth.member.id,
      body.action_type,
      body.description,
      body.entity_type,
      body.entity_id,
      body.metadata
    );

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

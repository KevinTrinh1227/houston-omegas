import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

// GET: Any authenticated user can read config
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const rows = await context.env.DB.prepare(
      `SELECT key, value, updated_at FROM chapter_config ORDER BY key`
    ).all();

    const config: Record<string, string> = {};
    for (const row of rows.results) {
      config[row.key as string] = row.value as string;
    }

    return json(config);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Exec only - update config values
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, string>;

    const allowedKeys = ['ja_attendance_threshold', 'ja_probation_weeks'];
    const updates: { key: string; value: string }[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) continue;
      const trimmed = String(value).trim();
      if (!trimmed) continue;
      // Validate numeric values
      const num = Number(trimmed);
      if (isNaN(num) || num < 0 || num > 100) continue;
      updates.push({ key, value: trimmed });
    }

    if (updates.length === 0) return error('No valid config values provided');

    for (const { key, value } of updates) {
      await context.env.DB.prepare(
        `INSERT INTO chapter_config (key, value, updated_by, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_by = ?, updated_at = datetime('now')`
      ).bind(key, value, result.auth.member.id, value, result.auth.member.id).run();
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_config', 'config', null, updates, ip);

    return json({ ok: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

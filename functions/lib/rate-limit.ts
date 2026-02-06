export async function checkRateLimit(
  db: D1Database,
  key: string,
  windowMinutes: number,
  maxRequests: number
): Promise<boolean> {
  const window = new Date(
    Math.floor(Date.now() / (windowMinutes * 60 * 1000)) * (windowMinutes * 60 * 1000)
  ).toISOString();

  const row = await db.prepare(
    `SELECT count FROM rate_limits WHERE key = ? AND window = ?`
  ).bind(key, window).first();

  if (row && (row.count as number) >= maxRequests) {
    return false; // Rate limited
  }

  await db.prepare(
    `INSERT INTO rate_limits (key, window, count) VALUES (?, ?, 1)
     ON CONFLICT(key, window) DO UPDATE SET count = count + 1`
  ).bind(key, window).run();

  return true; // Allowed
}

export function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
}

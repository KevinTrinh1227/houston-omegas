import type { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  try {
    const { page, referrer } = await context.request.json() as { page?: string; referrer?: string };
    if (!page || typeof page !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing page' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Rate limit: 60 per minute per IP
    const rateLimitKey = `pageview:${ip}`;
    const recent = await context.env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM page_views WHERE ip = ? AND created_at > datetime('now', '-1 minute')`
    ).bind(ip).first();

    if (recent && (recent.cnt as number) >= 60) {
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    await context.env.DB.prepare(
      `INSERT INTO page_views (page, referrer, ip) VALUES (?, ?, ?)`
    ).bind(page.slice(0, 200), (referrer || '').slice(0, 500) || null, ip).run();

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  }
};

import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, jsonCached, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET: Public - active partners (cached)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const rows = await context.env.DB.prepare(
      `SELECT * FROM partners
       WHERE is_active = 1
       ORDER BY
         sort_order ASC,
         CASE tier WHEN 'gold' THEN 0 WHEN 'silver' THEN 1 WHEN 'bronze' THEN 2 ELSE 3 END,
         name ASC`
    ).all();

    return jsonCached(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Exec only - create partner
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const name = sanitize(body.name as string);
    if (!name) return error('Name is required');

    const id = generateId();
    const slug = slugify(name);

    // Check slug uniqueness
    const existing = await context.env.DB.prepare('SELECT id FROM partners WHERE slug = ?').bind(slug).first();
    if (existing) return error('A partner with a similar name already exists');

    await context.env.DB.prepare(
      `INSERT INTO partners (id, name, slug, logo_url, description, category, tier, website_url, instagram, tiktok, twitter, facebook, youtube, email, phone, images, sort_order, is_current, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, name, slug,
      sanitize(body.logo_url as string) || null,
      sanitize(body.description as string) || null,
      body.category || 'sponsor',
      body.tier || 'bronze',
      sanitize(body.website_url as string) || null,
      sanitize(body.instagram as string) || null,
      sanitize(body.tiktok as string) || null,
      sanitize(body.twitter as string) || null,
      sanitize(body.facebook as string) || null,
      sanitize(body.youtube as string) || null,
      sanitize(body.email as string) || null,
      sanitize(body.phone as string) || null,
      JSON.stringify(body.images || []),
      typeof body.sort_order === 'number' ? body.sort_order : 0,
      body.is_current !== undefined ? (body.is_current ? 1 : 0) : 1,
      result.auth.member.id
    ).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_partner', 'partner', id, { name }, ip);

    const record = await context.env.DB.prepare('SELECT * FROM partners WHERE id = ?').bind(id).first();
    return json(record, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

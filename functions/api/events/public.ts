import type { Env } from '../../types';
import { jsonCached, error, options } from '../../lib/response';

// GET: Public - all public events (cached)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const slug = url.searchParams.get('slug');

    if (slug) {
      const row = await context.env.DB.prepare(
        `SELECT id, title, slug, description, event_type, location, address, map_url,
                start_time, end_time, flyer_url, cover_url, age_requirement, dress_code,
                ticket_url, ticket_price, rules, faq, disclaimer, capacity, parking_info,
                contact_info, socials, is_public
         FROM events WHERE slug = ? AND is_public = 1`
      ).bind(slug).first();

      if (!row) return error('Event not found', 404);
      return jsonCached(row, 120);
    }

    const rows = await context.env.DB.prepare(
      `SELECT id, title, slug, description, event_type, location, address,
              start_time, end_time, flyer_url, cover_url, age_requirement,
              ticket_price, is_public
       FROM events
       WHERE is_public = 1
       ORDER BY start_time DESC`
    ).all();

    return jsonCached(rows.results, 120);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

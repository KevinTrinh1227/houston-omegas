import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const category = url.searchParams.get('category');

    let query = `SELECT mf.*, m.first_name as uploader_first_name, m.last_name as uploader_last_name
                 FROM media_files mf
                 JOIN members m ON mf.uploaded_by = m.id`;
    const params: string[] = [];

    if (category) {
      query += ` WHERE mf.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY mf.created_at DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const category = sanitize(formData.get('category') as string) || 'general';
    const description = sanitize(formData.get('description') as string) || null;

    if (!file || !file.size) return error('No file provided');
    if (!ALLOWED_TYPES.includes(file.type)) return error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF.');
    if (file.size > MAX_SIZE) return error('File too large (max 10MB)');

    const id = generateId();
    // Sanitize filename: strip path separators, keep only safe characters
    const safeName = file.name.replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'upload';
    const r2Key = `media/${id}/${safeName}`;

    await context.env.MEDIA.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    await context.env.DB.prepare(
      `INSERT INTO media_files (id, filename, size_bytes, content_type, r2_key, category, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, safeName, file.size, file.type, r2Key, category, description, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'upload_media', 'media_file', id, { filename: file.name, category }, ip);

    const record = await context.env.DB.prepare(`SELECT * FROM media_files WHERE id = ?`).bind(id).first();
    return json(record, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

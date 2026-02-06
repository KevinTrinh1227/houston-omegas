import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';
import { notifyDocumentUploaded } from '../../lib/notify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const category_id = url.searchParams.get('category_id');
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    let query = `SELECT d.*, m.first_name as uploader_first, m.last_name as uploader_last, c.name as category_name
                 FROM documents d
                 JOIN members m ON d.uploaded_by = m.id
                 LEFT JOIN document_categories c ON d.category_id = c.id
                 WHERE d.parent_id IS NULL`; // Only show latest versions
    const params: string[] = [];

    if (!isExec) query += ` AND d.visibility = 'members'`;
    if (category_id) { query += ` AND d.category_id = ?`; params.push(category_id); }
    query += ` ORDER BY d.created_at DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const title = sanitize(formData.get('title') as string);
    const category_id = sanitize(formData.get('category_id') as string) || null;
    const visibility = sanitize(formData.get('visibility') as string) || 'members';

    if (!file || !file.size) return error('No file provided');
    if (!title) return error('Title is required');
    if (file.size > 10 * 1024 * 1024) return error('File too large (max 10MB)');

    const id = generateId();
    const key = `documents/${id}/${file.name}`;

    await context.env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    await context.env.DB.prepare(
      `INSERT INTO documents (id, category_id, title, file_name, file_key, file_size, content_type, uploaded_by, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, category_id, title, file.name, key, file.size, file.type, result.auth.member.id, visibility).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'upload_document', 'document', id, { title, file_name: file.name }, ip);

    await notifyDocumentUploaded(context.env.DISCORD_WEBHOOK_URL, title, `${result.auth.member.first_name} ${result.auth.member.last_name}`);

    return json({ id, title, file_name: file.name }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

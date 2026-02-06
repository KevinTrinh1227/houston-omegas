import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    const doc = await context.env.DB.prepare(`SELECT * FROM documents WHERE id = ?`).bind(id).first();
    if (!doc) return error('Document not found', 404);
    if (doc.visibility === 'exec' && !isExec) return error('Forbidden', 403);

    // Check if download requested
    const url = new URL(context.request.url);
    if (url.searchParams.get('download') === '1') {
      const object = await context.env.MEDIA.get(doc.file_key as string);
      if (!object) return error('File not found in storage', 404);

      return new Response(object.body, {
        headers: {
          'Content-Type': doc.content_type as string,
          'Content-Disposition': `attachment; filename="${doc.file_name}"`,
          'Content-Length': String(doc.file_size),
        },
      });
    }

    // Get version history
    const versions = await context.env.DB.prepare(
      `SELECT id, version, file_name, file_size, created_at FROM documents WHERE parent_id = ? OR id = ? ORDER BY version DESC`
    ).bind(id, id).all();

    return json({ ...doc, versions: versions.results });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const doc = await context.env.DB.prepare(`SELECT file_key FROM documents WHERE id = ?`).bind(id).first();
    if (!doc) return error('Document not found', 404);

    // Delete from R2 and DB
    await context.env.MEDIA.delete(doc.file_key as string);
    await context.env.DB.prepare(`DELETE FROM documents WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_document', 'document', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

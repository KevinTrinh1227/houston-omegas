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
    const url = new URL(context.request.url);

    const file = await context.env.DB.prepare(`SELECT * FROM media_files WHERE id = ?`).bind(id).first();
    if (!file) return error('Media file not found', 404);

    // Return JSON metadata if ?meta=1
    if (url.searchParams.get('meta') === '1') {
      return json(file);
    }

    // Serve actual file from R2
    const object = await context.env.MEDIA.get(file.r2_key as string);
    if (!object) return error('File not found in storage', 404);

    const headers: Record<string, string> = {
      'Content-Type': (file.content_type as string) || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    };

    // Force download if ?download=1
    if (url.searchParams.get('download') === '1') {
      headers['Content-Disposition'] = `attachment; filename="${file.filename}"`;
    }

    return new Response(object.body, { headers });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const file = await context.env.DB.prepare(`SELECT * FROM media_files WHERE id = ?`).bind(id).first();
    if (!file) return error('Media file not found', 404);

    // Only uploader or exec roles can delete
    const isUploader = file.uploaded_by === result.auth.member.id;
    const isExec = EXEC_ROLES.includes(result.auth.member.role);
    if (!isUploader && !isExec) return error('Forbidden', 403);

    // Delete from R2 bucket
    await context.env.MEDIA.delete(file.r2_key as string);

    // Delete from database
    await context.env.DB.prepare(`DELETE FROM media_files WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_media', 'media_file', id, { filename: file.filename }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

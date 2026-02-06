import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.size) return error('No file provided');
    if (file.size > 2 * 1024 * 1024) return error('File too large (max 2MB)');

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return error('Invalid file type');

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const key = `avatars/${result.auth.member.id}.${ext}`;

    await context.env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    // Build public URL (R2 custom domain or Pages route)
    const url = new URL(context.request.url);
    const avatarUrl = `${url.origin}/media/${key}`;

    await context.env.DB.prepare(
      `UPDATE members SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(avatarUrl, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'upload_avatar', 'member', result.auth.member.id, { key }, ip);

    return json({ avatar_url: avatarUrl });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

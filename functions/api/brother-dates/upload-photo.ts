import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const brother_date_id = formData.get('brother_date_id') as string | null;

    if (!file || !file.size) return error('No file provided');
    if (!brother_date_id) return error('brother_date_id is required');
    if (!ALLOWED_TYPES.includes(file.type)) return error('Invalid file type. Use JPEG, PNG, or WebP.');
    if (file.size > MAX_SIZE) return error('File too large (max 10MB)');

    // Verify the brother date exists and the user is a participant
    const bd = await context.env.DB.prepare(
      `SELECT id FROM brother_dates WHERE id = ? AND (member1_id = ? OR member2_id = ?)`
    ).bind(brother_date_id, result.auth.member.id, result.auth.member.id).first();
    if (!bd) return error('Brother date not found or you are not a participant', 404);

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const r2Key = `brother-dates/${brother_date_id}/${generateId()}.${ext}`;

    await context.env.MEDIA.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const photoUrl = `/media/${r2Key}`;

    await context.env.DB.prepare(
      `UPDATE brother_dates SET photo_url = ? WHERE id = ?`
    ).bind(photoUrl, brother_date_id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'upload_brother_date_photo', 'brother_date', brother_date_id, { r2_key: r2Key }, ip);

    return json({ photo_url: photoUrl }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;
    const partnerId = formData.get('partner_id') as string;
    const type = (formData.get('type') as string) || 'image';

    if (!file || !file.size) return error('No file provided');
    if (!partnerId) return error('Partner ID is required');
    if (!ALLOWED_TYPES.includes(file.type)) return error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.');
    if (file.size > MAX_SIZE) return error('File too large (max 5MB)');

    // Verify partner exists
    const partner = await context.env.DB.prepare('SELECT id FROM partners WHERE id = ?').bind(partnerId).first();
    if (!partner) return error('Partner not found', 404);

    const safeName = file.name.replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'upload';
    const r2Key = `partners/${partnerId}/${safeName}`;

    await context.env.MEDIA.put(r2Key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const url = `/media/${r2Key}`;

    if (type === 'logo') {
      await context.env.DB.prepare(
        `UPDATE partners SET logo_url = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(url, result.auth.member.id, partnerId).run();
    } else {
      // Add to images array
      const current = await context.env.DB.prepare('SELECT images FROM partners WHERE id = ?').bind(partnerId).first() as Record<string, string> | null;
      const images: string[] = current ? JSON.parse(current.images || '[]') : [];
      images.push(url);
      await context.env.DB.prepare(
        `UPDATE partners SET images = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(images), result.auth.member.id, partnerId).run();
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'upload_partner_image', 'partner', partnerId, { type, filename: safeName }, ip);

    return json({ url, key: r2Key }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

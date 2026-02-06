import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES, 'active']);
    if (result.errorResponse) return result.errorResponse;

    const formData = await context.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return error('No file provided');
    if (!ALLOWED_TYPES.includes(file.type)) return error('Invalid file type. Use JPEG, PNG, or WebP.');
    if (file.size > MAX_SIZE) return error('File too large. Maximum 5MB.');

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const randomName = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const key = `blog/${randomName}.${ext}`;

    // Upload to R2
    await context.env.MEDIA.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Construct public URL (R2 custom domain or Pages asset)
    // For now, return the key - the frontend will construct the URL
    const url = `/media/${key}`;

    return json({ url, key });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

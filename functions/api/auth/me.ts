import type { Env } from '../../types';
import { authenticate } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await authenticate(context.request, context.env.DB);
    if (!auth) {
      return error('Unauthorized', 401);
    }

    const { member } = auth;

    return json({
      id: member.id,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      phone: member.phone,
      class_year: member.class_year,
      major: member.major,
      instagram: member.instagram,
      avatar_url: member.avatar_url,
      created_at: member.created_at,
      last_login_at: member.last_login_at,
      needs_phone: !member.phone,
    });
  } catch {
    return error('Internal server error', 500);
  }
};

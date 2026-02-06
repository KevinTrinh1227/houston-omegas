import type { Env } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const state = crypto.randomUUID();
  const origin = new URL(context.request.url).origin;

  const params = new URLSearchParams({
    client_id: context.env.DISCORD_CLIENT_ID,
    redirect_uri: `${origin}/api/auth/callback/discord`,
    response_type: 'code',
    scope: 'identify email',
    state,
    prompt: 'consent',
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://discord.com/api/oauth2/authorize?${params}`,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
};

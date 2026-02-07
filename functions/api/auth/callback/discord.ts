import type { Env } from '../../../types';
import { createOAuthSession } from '../../../lib/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const origin = url.origin;
  const loginUrl = `${origin}/login`;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return Response.redirect(`${loginUrl}?error=oauth_denied`, 302);
  }

  // Verify state (CSRF protection)
  const cookies = context.request.headers.get('Cookie') || '';
  const stateMatch = cookies.match(/oauth_state=([^;]+)/);
  if (!stateMatch || stateMatch[1] !== state) {
    return Response.redirect(`${loginUrl}?error=invalid_state`, 302);
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: context.env.DISCORD_CLIENT_ID,
      client_secret: context.env.DISCORD_CLIENT_SECRET,
      redirect_uri: `${origin}/api/auth/callback/discord`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(`${loginUrl}?error=token_exchange_failed`, 302);
  }

  const tokens = (await tokenRes.json()) as { access_token: string };

  // Get user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return Response.redirect(`${loginUrl}?error=user_info_failed`, 302);
  }

  const userInfo = (await userRes.json()) as { email?: string; id?: string; avatar?: string };
  const email = userInfo.email?.toLowerCase();

  if (!email) {
    return Response.redirect(`${loginUrl}?error=no_email`, 302);
  }

  // Check if member exists (active or pending)
  const member = await context.env.DB.prepare(
    'SELECT id, is_active, avatar_url, status FROM members WHERE email = ?'
  ).bind(email).first();

  if (!member) {
    return Response.redirect(`${loginUrl}?error=not_registered`, 302);
  }

  // Activate pending members on first login
  if (member.status === 'pending' || (member.is_active !== 1 && member.status === 'pending')) {
    await context.env.DB.prepare(
      `UPDATE members SET status = 'active', is_active = 1, updated_at = datetime('now') WHERE id = ?`
    ).bind(member.id).run();
  } else if (member.is_active !== 1) {
    return Response.redirect(`${loginUrl}?error=not_registered`, 302);
  }

  // Save avatar from Discord if member doesn't have one
  if (!member.avatar_url && userInfo.id && userInfo.avatar) {
    const discordAvatar = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=256`;
    await context.env.DB.prepare(
      `UPDATE members SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(discordAvatar, member.id).run();
  }

  return createOAuthSession(
    context.env.DB,
    member.id as string,
    'discord',
    context.request,
    `${origin}/dashboard`
  );
};

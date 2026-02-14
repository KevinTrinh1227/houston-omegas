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

  const userInfo = (await userRes.json()) as { email?: string; id?: string; avatar?: string; global_name?: string; username?: string };
  const email = userInfo.email?.toLowerCase();

  if (!email) {
    return Response.redirect(`${loginUrl}?error=no_email`, 302);
  }

  // Check if member exists (active or pending)
  const member = await context.env.DB.prepare(
    'SELECT id, is_active, avatar_url, status, has_completed_onboarding, first_name FROM members WHERE email = ?'
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

  // Save discord_id and avatar from Discord
  if (userInfo.id) {
    const updates: string[] = [`discord_id = ?`];
    const binds: (string | null)[] = [userInfo.id];
    if (!member.avatar_url && userInfo.avatar) {
      updates.push(`avatar_url = ?`);
      binds.push(`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=256`);
    }
    // Pre-fill name from Discord display name if not set
    if (!member.first_name && (userInfo.global_name || userInfo.username)) {
      const displayName = userInfo.global_name || userInfo.username || '';
      const nameParts = displayName.split(' ');
      if (nameParts.length >= 1) {
        updates.push('first_name = ?');
        binds.push(nameParts[0]);
      }
      if (nameParts.length >= 2) {
        updates.push('last_name = ?');
        binds.push(nameParts.slice(1).join(' '));
      }
    }
    updates.push(`updated_at = datetime('now')`);
    binds.push(member.id as string);
    await context.env.DB.prepare(
      `UPDATE members SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...binds).run();
  }

  // Redirect to onboarding if not completed
  const redirectTo = member.has_completed_onboarding === 0
    ? `${origin}/onboarding`
    : `${origin}/dashboard`;

  return createOAuthSession(
    context.env.DB,
    member.id as string,
    'discord',
    context.request,
    redirectTo
  );
};

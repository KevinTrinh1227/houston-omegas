import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { member_id: string };
    if (!body.member_id) return error('member_id is required');

    const member = await context.env.DB.prepare(
      `SELECT id, email, first_name, last_name, role FROM members WHERE id = ?`
    ).bind(body.member_id).first();

    if (!member) return error('Member not found', 404);

    const url = new URL(context.request.url);
    const siteUrl = `${url.protocol}//${url.host}`;

    const roleLabels: Record<string, string> = {
      admin: 'Admin', president: 'President', vpi: 'VP Internal', vpx: 'VP External',
      treasurer: 'Treasurer', secretary: 'Secretary', junior_active: 'Junior Active',
      active: 'Active', alumni: 'Alumni', inactive: 'Inactive',
    };
    const roleLabel = roleLabels[member.role as string] || member.role;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0e1012;padding:32px 32px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.04em;">HOUSTON OMEGAS</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">Member Portal Invitation</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;line-height:1.6;">Hey ${member.first_name},</p>
          <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">You've been invited to the Houston Omegas member dashboard as <strong style="color:#1a1a1a;">${roleLabel}</strong>.</p>
          <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">Sign in with your Google or Discord account to get started. Use the email address this was sent to.</p>
          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${siteUrl}/login" style="display:inline-block;background:#0e1012;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Sign In</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#999;font-size:12px;line-height:1.5;text-align:center;">Or go to <a href="${siteUrl}/login" style="color:#555;">${siteUrl.replace('https://', '')}/login</a></p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">Houston Omegas &middot; Est. 2004 &middot; Houston, TX</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Houston Omegas <noreply@visibleseed.com>',
        to: [member.email as string],
        subject: `You're invited to the Houston Omegas Dashboard`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      return error(`Failed to send email: ${err}`, 500);
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'send_invite_email', 'member', body.member_id, { email: member.email }, ip);

    return json({ success: true, email: member.email });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

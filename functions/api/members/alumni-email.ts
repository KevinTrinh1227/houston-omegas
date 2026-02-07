import type { Env } from '../../types';
import { requireChairOrExec, logAudit } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireChairOrExec(context.request, context.env.DB, ['alumni']);
    if (result.errorResponse) return result.errorResponse;
    const { auth } = result;

    const body = await context.request.json() as { subject?: string; body?: string };
    if (!body.subject?.trim() || !body.body?.trim()) {
      return error('Subject and body are required', 400);
    }

    // Get all alumni emails
    const rows = await context.env.DB.prepare(
      `SELECT email, first_name FROM members WHERE role = 'alumni' AND is_active = 1`
    ).all();

    if (!rows.results || rows.results.length === 0) {
      return error('No active alumni found', 400);
    }

    const alumni = rows.results as { email: string; first_name: string }[];

    // Send via Resend (batch to avoid rate limits)
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        alumni.map(a => ({
          from: 'Houston Omegas <noreply@houstonomegas.com>',
          to: a.email,
          subject: body.subject,
          html: `<p>Hi ${a.first_name},</p>${body.body!.split('\n').map(line => `<p>${line}</p>`).join('')}<hr/><p style="font-size:12px;color:#999;">Houston Omegas Alumni Relations</p>`,
        }))
      ),
    });

    if (!res.ok) {
      const errData = await res.text();
      console.error('Resend error:', errData);
      return error('Failed to send emails', 500);
    }

    await logAudit(
      context.env.DB,
      auth.member.id,
      'alumni_email_sent',
      'members',
      null,
      { subject: body.subject, recipient_count: alumni.length },
      context.request.headers.get('CF-Connecting-IP')
    );

    return json({ success: true, sent: alumni.length });
  } catch (err) {
    console.error('Alumni email error:', err);
    return error('Internal server error', 500);
  }
};

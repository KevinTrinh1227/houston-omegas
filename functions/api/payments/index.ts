import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';
import { notifyPaymentRecorded } from '../../lib/notify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const dues_id = url.searchParams.get('dues_id');
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    let query = `SELECT p.*, m.first_name, m.last_name, r.first_name as recorded_first, r.last_name as recorded_last
                 FROM payments p
                 JOIN members m ON p.member_id = m.id
                 JOIN members r ON p.recorded_by = r.id`;
    const params: string[] = [];

    if (dues_id) {
      query += ` WHERE p.dues_id = ?`;
      params.push(dues_id);
    } else if (!isExec) {
      query += ` WHERE p.member_id = ?`;
      params.push(result.auth.member.id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT 200`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'treasurer']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const dues_id = sanitize(body.dues_id as string);
    const amount = Number(body.amount) || 0;
    const method = sanitize(body.method as string) || 'other';
    const notes = sanitize(body.notes as string) || null;

    if (!dues_id || amount <= 0) return error('dues_id and positive amount are required');

    const validMethods = ['cash', 'venmo', 'zelle', 'check', 'other'];
    if (!validMethods.includes(method)) return error('Invalid payment method');

    // Get dues record
    const dues = await context.env.DB.prepare(`SELECT * FROM dues WHERE id = ?`).bind(dues_id).first();
    if (!dues) return error('Dues record not found', 404);

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO payments (id, dues_id, member_id, amount, method, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, dues_id, dues.member_id, amount, method, result.auth.member.id, notes).run();

    // Update dues amount_paid and status
    const newPaid = (dues.amount_paid as number) + amount;
    let newStatus: string;
    if (newPaid >= (dues.amount_due as number)) {
      newStatus = 'paid';
    } else if (newPaid > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'unpaid';
    }

    await context.env.DB.prepare(
      `UPDATE dues SET amount_paid = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(newPaid, newStatus, dues_id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'record_payment', 'payment', id, { dues_id, amount, method }, ip);

    // Get member name for notification
    const payee = await context.env.DB.prepare(`SELECT first_name, last_name FROM members WHERE id = ?`).bind(dues.member_id).first();
    if (payee) {
      await notifyPaymentRecorded(context.env.DISCORD_WEBHOOK_URL, `${payee.first_name} ${payee.last_name}`, amount, `${result.auth.member.first_name} ${result.auth.member.last_name}`);
    }

    return json({ id, dues_id, amount, method, new_paid: newPaid, new_status: newStatus }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';
import { isValidUSPhone, sendPhoneOTP } from '../../lib/sms';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { phone?: string };
    if (!body.phone) return error('Phone number is required');

    if (!isValidUSPhone(body.phone)) {
      return error('Please enter a valid US phone number (10 digits)');
    }

    const otpResult = await sendPhoneOTP(context.env.DB, body.phone, context.env);
    if (!otpResult.success) {
      return error(otpResult.error || 'Failed to send code', 429);
    }

    return json({ success: true, message: 'Verification code sent' });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();

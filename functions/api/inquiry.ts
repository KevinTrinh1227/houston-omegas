import type { Env } from '../types';
import { getClientIP } from '../lib/rate-limit';

interface InquiryData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount?: string;
  date?: string;
  message?: string;
  website?: string; // honeypot
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as InquiryData;

    // Honeypot check
    if (body.website) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.eventType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ip = getClientIP(context.request);
    const userAgent = context.request.headers.get('User-Agent') || null;
    const referer = context.request.headers.get('Referer') || null;
    const country = context.request.headers.get('CF-IPCountry') || null;
    const city = context.request.headers.get('CF-IPCity') || null;

    // Log to D1 database
    try {
      await context.env.DB.prepare(
        `INSERT INTO inquiry_submissions
         (name, email, phone, event_type, guest_count, date, message, ip_address, user_agent, referer, country, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.name, body.email, body.phone, body.eventType,
        body.guestCount || null, body.date || null, body.message || null,
        ip, userAgent, referer, country, city
      ).run();
    } catch {
      // Don't fail the whole request if D1 logging fails
    }

    // Send Discord webhook
    const webhookUrl = context.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const embed = {
        title: 'New Venue Inquiry',
        color: 0xc9a227,
        fields: [
          { name: 'Name', value: body.name, inline: true },
          { name: 'Email', value: body.email, inline: true },
          { name: 'Phone', value: body.phone, inline: true },
          { name: 'Event Type', value: body.eventType, inline: true },
          { name: 'Guest Count', value: body.guestCount || 'Not specified', inline: true },
          { name: 'Preferred Date', value: body.date || 'Not specified', inline: true },
          { name: 'Message', value: body.message || 'No message provided' },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Omega Mansion Inquiry Form' },
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

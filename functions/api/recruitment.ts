import type { Env } from '../types';
import { getClientIP } from '../lib/rate-limit';

interface RecruitmentData {
  firstName: string;
  lastName: string;
  phone: string;
  classification: string;
  major?: string;
  instagram: string;
  heardFrom: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as RecruitmentData;

    if (!body.firstName || !body.lastName || !body.phone || !body.classification || !body.instagram || !body.heardFrom) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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
        `INSERT INTO recruitment_submissions
         (first_name, last_name, phone, classification, major, instagram, heard_from, ip_address, user_agent, referer, country, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        body.firstName, body.lastName, body.phone, body.classification,
        body.major || null, body.instagram, body.heardFrom,
        ip, userAgent, referer, country, city
      ).run();
    } catch {
      // Don't fail the whole request if D1 logging fails
    }

    // Send Discord webhook
    const webhookUrl = context.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const embed = {
        title: 'New Recruitment Interest',
        color: 0xb2beb5,
        fields: [
          { name: 'Name', value: `${body.firstName} ${body.lastName}`, inline: true },
          { name: 'Phone', value: body.phone, inline: true },
          { name: 'Instagram', value: body.instagram, inline: true },
          { name: 'Classification', value: body.classification, inline: true },
          { name: 'Major', value: body.major || 'Not specified', inline: true },
          { name: 'Heard From', value: body.heardFrom, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Houston Omegas Recruitment Form' },
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

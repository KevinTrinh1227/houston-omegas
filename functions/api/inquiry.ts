interface Env {
  DISCORD_WEBHOOK_URL: string;
}

interface InquiryData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount?: string;
  date?: string;
  message?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as InquiryData;

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

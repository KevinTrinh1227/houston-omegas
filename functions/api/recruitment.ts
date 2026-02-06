interface Env {
  DISCORD_WEBHOOK_URL: string;
}

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

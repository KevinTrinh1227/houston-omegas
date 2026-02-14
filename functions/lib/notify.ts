interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

export async function sendDiscordNotification(
  webhookUrl: string | undefined,
  embed: DiscordEmbed
): Promise<void> {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          ...embed,
          color: embed.color ?? 0x1a1a1a,
          timestamp: embed.timestamp ?? new Date().toISOString(),
        }],
      }),
    });
  } catch {
    // Don't fail the request if notification fails
  }
}

// Preset notification helpers
export function notifyNewAnnouncement(webhookUrl: string | undefined, title: string, author: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'New Announcement',
    description: title,
    color: 0xf59e0b,
    fields: [{ name: 'Posted by', value: author, inline: true }],
  });
}

export function notifyPaymentRecorded(webhookUrl: string | undefined, memberName: string, amount: number, recorder: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'Payment Recorded',
    color: 0x22c55e,
    fields: [
      { name: 'Member', value: memberName, inline: true },
      { name: 'Amount', value: `$${(amount / 100).toFixed(2)}`, inline: true },
      { name: 'Recorded by', value: recorder, inline: true },
    ],
  });
}

export function notifyEventCreated(webhookUrl: string | undefined, title: string, date: string, creator: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'New Event',
    description: title,
    color: 0x6366f1,
    fields: [
      { name: 'Date', value: new Date(date).toLocaleDateString(), inline: true },
      { name: 'Created by', value: creator, inline: true },
    ],
  });
}

export function notifyMeetingNotes(webhookUrl: string | undefined, title: string, meetingType: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'Meeting Notes Published',
    description: title,
    color: 0xec4899,
    fields: [{ name: 'Type', value: meetingType, inline: true }],
  });
}

export function notifyBrotherDate(webhookUrl: string | undefined, member1: string, member2: string, approved: boolean) {
  return sendDiscordNotification(webhookUrl, {
    title: approved ? 'Brother Date Approved' : 'New Brother Date Submitted',
    color: approved ? 0x22c55e : 0x3b82f6,
    fields: [
      { name: 'Brothers', value: `${member1} & ${member2}`, inline: true },
    ],
  });
}

export function notifyDocumentUploaded(webhookUrl: string | undefined, title: string, uploader: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'New Document',
    description: title,
    color: 0x8b5cf6,
    fields: [{ name: 'Uploaded by', value: uploader, inline: true }],
  });
}

export function notifyNewMember(webhookUrl: string | undefined, name: string, role: string) {
  return sendDiscordNotification(webhookUrl, {
    title: 'New Member',
    description: `${name} has joined as ${role}`,
    color: 0x22c55e,
  });
}

export { sendDiscordNotification as notifyDiscord };

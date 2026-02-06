import { describe, it, expect, vi } from 'vitest';
import {
  sendDiscordNotification,
  notifyNewAnnouncement,
  notifyPaymentRecorded,
  notifyEventCreated,
  notifyNewMember,
} from '../../functions/lib/notify';

describe('sendDiscordNotification', () => {
  it('does nothing when webhook url is undefined', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    await sendDiscordNotification(undefined, { title: 'test' });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('sends embed to webhook url', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    await sendDiscordNotification('https://discord.com/webhook', { title: 'Test', description: 'Hello' });

    expect(spy).toHaveBeenCalledTimes(1);
    const [url, options] = spy.mock.calls[0];
    expect(url).toBe('https://discord.com/webhook');
    expect(options?.method).toBe('POST');

    const body = JSON.parse(options?.body as string);
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0].title).toBe('Test');
    expect(body.embeds[0].description).toBe('Hello');
    expect(body.embeds[0].timestamp).toBeDefined();

    spy.mockRestore();
  });

  it('does not throw on fetch error', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    await expect(sendDiscordNotification('https://discord.com/webhook', { title: 'Test' })).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe('notification helpers', () => {
  it('notifyNewAnnouncement sends correct embed', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    await notifyNewAnnouncement('https://hook', 'Big News', 'Kevin');
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.embeds[0].title).toBe('New Announcement');
    expect(body.embeds[0].description).toBe('Big News');
    spy.mockRestore();
  });

  it('notifyPaymentRecorded sends amount formatted', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    await notifyPaymentRecorded('https://hook', 'John Doe', 5000, 'Jane');
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.embeds[0].fields[1].value).toBe('$50.00');
    spy.mockRestore();
  });

  it('notifyEventCreated includes date', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    await notifyEventCreated('https://hook', 'Chapter Meeting', '2026-02-01', 'Admin');
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.embeds[0].title).toBe('New Event');
    spy.mockRestore();
  });

  it('notifyNewMember includes name and role', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'));
    await notifyNewMember('https://hook', 'John Doe', 'active');
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string);
    expect(body.embeds[0].description).toContain('John Doe');
    expect(body.embeds[0].description).toContain('active');
    spy.mockRestore();
  });
});

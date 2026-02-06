import { describe, it, expect } from 'vitest';
import { generateToken, generateId, getSessionCookie, clearSessionCookie, parseSessionToken } from '../../functions/lib/auth';

describe('generateToken', () => {
  it('generates a 64-char hex string', () => {
    const token = generateToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generates unique tokens', () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).not.toBe(t2);
  });
});

describe('generateId', () => {
  it('generates a 32-char hex string', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-f0-9]{32}$/);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('getSessionCookie', () => {
  it('returns proper cookie string', () => {
    const cookie = getSessionCookie('abc123');
    expect(cookie).toContain('session=abc123');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Path=/');
  });

  it('uses custom max age', () => {
    const cookie = getSessionCookie('abc', 3600);
    expect(cookie).toContain('Max-Age=3600');
  });

  it('uses default 7-day max age', () => {
    const cookie = getSessionCookie('abc');
    expect(cookie).toContain(`Max-Age=${7 * 24 * 60 * 60}`);
  });
});

describe('clearSessionCookie', () => {
  it('returns cookie with Max-Age=0', () => {
    const cookie = clearSessionCookie();
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('session=');
  });
});

describe('parseSessionToken', () => {
  it('extracts token from valid cookie', () => {
    const token = 'a'.repeat(64);
    const request = new Request('http://test.com', {
      headers: { Cookie: `session=${token}` },
    });
    expect(parseSessionToken(request)).toBe(token);
  });

  it('extracts token among multiple cookies', () => {
    const token = 'b'.repeat(64);
    const request = new Request('http://test.com', {
      headers: { Cookie: `other=value; session=${token}; another=val` },
    });
    expect(parseSessionToken(request)).toBe(token);
  });

  it('returns null for missing cookie header', () => {
    const request = new Request('http://test.com');
    expect(parseSessionToken(request)).toBeNull();
  });

  it('returns null for invalid session format', () => {
    const request = new Request('http://test.com', {
      headers: { Cookie: 'session=tooshort' },
    });
    expect(parseSessionToken(request)).toBeNull();
  });

  it('returns null for non-hex session', () => {
    const request = new Request('http://test.com', {
      headers: { Cookie: `session=${'g'.repeat(64)}` },
    });
    expect(parseSessionToken(request)).toBeNull();
  });
});

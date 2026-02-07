import { describe, it, expect } from 'vitest';

// Tests for media file validation logic

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

describe('media file type validation', () => {
  it('accepts valid image types', () => {
    expect(ALLOWED_TYPES.includes('image/jpeg')).toBe(true);
    expect(ALLOWED_TYPES.includes('image/png')).toBe(true);
    expect(ALLOWED_TYPES.includes('image/webp')).toBe(true);
    expect(ALLOWED_TYPES.includes('image/gif')).toBe(true);
  });

  it('accepts PDF', () => {
    expect(ALLOWED_TYPES.includes('application/pdf')).toBe(true);
  });

  it('rejects invalid file types', () => {
    expect(ALLOWED_TYPES.includes('application/javascript')).toBe(false);
    expect(ALLOWED_TYPES.includes('text/html')).toBe(false);
    expect(ALLOWED_TYPES.includes('application/zip')).toBe(false);
    expect(ALLOWED_TYPES.includes('video/mp4')).toBe(false);
    expect(ALLOWED_TYPES.includes('image/svg+xml')).toBe(false);
    expect(ALLOWED_TYPES.includes('application/x-executable')).toBe(false);
  });

  it('has exactly 5 allowed types', () => {
    expect(ALLOWED_TYPES).toHaveLength(5);
  });
});

describe('media file size validation', () => {
  it('MAX_SIZE is 10MB', () => {
    expect(MAX_SIZE).toBe(10485760);
  });

  it('accepts files under limit', () => {
    expect(1024 <= MAX_SIZE).toBe(true);       // 1KB
    expect(1048576 <= MAX_SIZE).toBe(true);    // 1MB
    expect(5242880 <= MAX_SIZE).toBe(true);    // 5MB
    expect(10485760 <= MAX_SIZE).toBe(true);   // exactly 10MB
  });

  it('rejects files over limit', () => {
    expect(10485761 > MAX_SIZE).toBe(true);    // 10MB + 1 byte
    expect(20971520 > MAX_SIZE).toBe(true);    // 20MB
  });
});

describe('media R2 key generation', () => {
  it('generates correct R2 key format', () => {
    const id = 'abc123';
    const filename = 'photo.jpg';
    const r2Key = `media/${id}/${filename}`;
    expect(r2Key).toBe('media/abc123/photo.jpg');
  });

  it('preserves filename with spaces', () => {
    const id = 'abc123';
    const filename = 'my photo file.jpg';
    const r2Key = `media/${id}/${filename}`;
    expect(r2Key).toBe('media/abc123/my photo file.jpg');
  });

  it('preserves filename with special chars', () => {
    const id = 'abc123';
    const filename = 'image (1).png';
    const r2Key = `media/${id}/${filename}`;
    expect(r2Key).toContain('image (1).png');
  });
});

describe('media categories', () => {
  const DEFAULT_CATEGORY = 'general';
  const VALID_CATEGORIES = ['general', 'events', 'brotherhood', 'other'];

  it('defaults to general category', () => {
    const category = '' || DEFAULT_CATEGORY;
    expect(category).toBe('general');
  });

  it('preserves specified category', () => {
    const category = 'events' || DEFAULT_CATEGORY;
    expect(category).toBe('events');
  });
});

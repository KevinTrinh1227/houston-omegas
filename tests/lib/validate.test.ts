import { describe, it, expect } from 'vitest';
import { isValidEmail, sanitize, isValidSlug, slugify } from '../../functions/lib/validate';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
  });
});

describe('sanitize', () => {
  it('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('returns empty string for null/undefined', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
    expect(sanitize('')).toBe('');
  });

  it('truncates to 1000 chars', () => {
    const long = 'a'.repeat(2000);
    expect(sanitize(long).length).toBe(1000);
  });

  it('preserves normal text', () => {
    expect(sanitize('Hello World!')).toBe('Hello World!');
  });
});

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true);
    expect(isValidSlug('post123')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Hello-World')).toBe(false);
    expect(isValidSlug('-start')).toBe(false);
    expect(isValidSlug('end-')).toBe(false);
    expect(isValidSlug('hello--world')).toBe(false);
    expect(isValidSlug('has spaces')).toBe(false);
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('handles empty/edge cases', () => {
    expect(slugify('')).toBe('');
  });

  it('truncates to 200 chars', () => {
    const long = 'word '.repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(200);
  });

  it('handles underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });
});

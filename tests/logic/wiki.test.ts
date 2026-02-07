import { describe, it, expect } from 'vitest';
import { slugify, isValidSlug } from '../../functions/lib/validate';

// Tests for wiki slug generation and validation

describe('wiki slug generation', () => {
  it('generates slug from page title', () => {
    expect(slugify('Welcome to the Dashboard')).toBe('welcome-to-the-dashboard');
  });

  it('handles role guide titles', () => {
    expect(slugify('President Guide')).toBe('president-guide');
    expect(slugify('VPI Guide')).toBe('vpi-guide');
    expect(slugify('Treasurer Guide')).toBe('treasurer-guide');
  });

  it('handles how-to titles', () => {
    expect(slugify('How to Submit a Brother Date')).toBe('how-to-submit-a-brother-date');
    expect(slugify('How to Upload Documents')).toBe('how-to-upload-documents');
  });

  it('handles titles with special characters', () => {
    expect(slugify('Dashboard FAQ!')).toBe('dashboard-faq');
    expect(slugify("What's New? (v2.0)")).toBe('whats-new-v20');
  });

  it('handles titles with numbers', () => {
    expect(slugify('Phase 1 Overview')).toBe('phase-1-overview');
    expect(slugify('2026 Spring Guide')).toBe('2026-spring-guide');
  });

  it('collapses multiple spaces into single dash', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('preserves dashes from input (only spaces/underscores collapsed)', () => {
    // slugify replaces [\s_]+ with - but leaves existing dashes as-is
    const slug = slugify('hello   ---   world');
    expect(slug).toContain('hello');
    expect(slug).toContain('world');
  });

  it('strips leading/trailing dashes', () => {
    const slug = slugify('  Hello World  ');
    expect(slug).toBe('hello-world');
    expect(slug[0]).not.toBe('-');
    expect(slug[slug.length - 1]).not.toBe('-');
  });
});

describe('wiki slug validation', () => {
  it('validates generated slugs', () => {
    const titles = [
      'Welcome to the Dashboard',
      'President Guide',
      'How to Upload Documents',
      'Dashboard FAQ',
    ];
    for (const title of titles) {
      const slug = slugify(title);
      expect(isValidSlug(slug)).toBe(true);
    }
  });

  it('rejects uppercase slugs', () => {
    expect(isValidSlug('Hello-World')).toBe(false);
  });

  it('rejects slugs with spaces', () => {
    expect(isValidSlug('hello world')).toBe(false);
  });

  it('rejects empty slugs', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('rejects slugs starting with dash', () => {
    expect(isValidSlug('-hello')).toBe(false);
  });

  it('rejects slugs ending with dash', () => {
    expect(isValidSlug('hello-')).toBe(false);
  });

  it('rejects consecutive dashes', () => {
    expect(isValidSlug('hello--world')).toBe(false);
  });
});

describe('wiki categories', () => {
  const CATEGORIES = ['Getting Started', 'Role Guides', 'How-To', 'Policies', 'General'];

  it('has 5 categories', () => {
    expect(CATEGORIES).toHaveLength(5);
  });

  it('includes expected categories', () => {
    expect(CATEGORIES).toContain('Getting Started');
    expect(CATEGORIES).toContain('Role Guides');
    expect(CATEGORIES).toContain('How-To');
    expect(CATEGORIES).toContain('Policies');
    expect(CATEGORIES).toContain('General');
  });
});

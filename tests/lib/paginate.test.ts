import { describe, it, expect } from 'vitest';
import { parsePagination, paginatedResponse } from '../../functions/lib/paginate';

describe('parsePagination', () => {
  it('returns default values when no params', () => {
    const result = parsePagination('https://example.com/api/items');
    expect(result).toEqual({ page: 1, limit: 25, offset: 0 });
  });

  it('parses page and limit from URL', () => {
    const result = parsePagination('https://example.com/api/items?page=3&limit=10');
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('clamps page to minimum of 1', () => {
    const result = parsePagination('https://example.com/api/items?page=0');
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('clamps negative page to 1', () => {
    const result = parsePagination('https://example.com/api/items?page=-5');
    expect(result.page).toBe(1);
  });

  it('clamps limit to max', () => {
    const result = parsePagination('https://example.com/api/items?limit=500');
    expect(result.limit).toBe(100);
  });

  it('falls back to default when limit is 0', () => {
    // parseInt('0') || defaultLimit → defaultLimit because 0 is falsy
    const result = parsePagination('https://example.com/api/items?limit=0');
    expect(result.limit).toBe(25);
  });

  it('clamps limit of 1 correctly', () => {
    const result = parsePagination('https://example.com/api/items?limit=1');
    expect(result.limit).toBe(1);
  });

  it('uses custom default limit', () => {
    const result = parsePagination('https://example.com/api/items', 50);
    expect(result.limit).toBe(50);
  });

  it('uses custom max limit', () => {
    const result = parsePagination('https://example.com/api/items?limit=200', 25, 200);
    expect(result.limit).toBe(200);
  });

  it('handles non-numeric values gracefully', () => {
    const result = parsePagination('https://example.com/api/items?page=abc&limit=xyz');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(25);
  });

  it('calculates correct offset for page 2', () => {
    const result = parsePagination('https://example.com/api/items?page=2&limit=10');
    expect(result.offset).toBe(10);
  });

  it('calculates correct offset for page 5 with limit 20', () => {
    const result = parsePagination('https://example.com/api/items?page=5&limit=20');
    expect(result.offset).toBe(80);
  });
});

describe('paginatedResponse', () => {
  it('returns correct shape with data', () => {
    const result = paginatedResponse(['a', 'b', 'c'], 10, 1, 3);
    expect(result).toEqual({
      data: ['a', 'b', 'c'],
      total: 10,
      page: 1,
      limit: 3,
      total_pages: 4,
    });
  });

  it('calculates total_pages correctly', () => {
    expect(paginatedResponse([], 100, 1, 25).total_pages).toBe(4);
    expect(paginatedResponse([], 101, 1, 25).total_pages).toBe(5);
    expect(paginatedResponse([], 0, 1, 25).total_pages).toBe(0);
    expect(paginatedResponse([], 1, 1, 25).total_pages).toBe(1);
  });

  it('handles single item on last page', () => {
    const result = paginatedResponse(['x'], 26, 2, 25);
    expect(result).toEqual({
      data: ['x'],
      total: 26,
      page: 2,
      limit: 25,
      total_pages: 2,
    });
  });

  it('handles empty data', () => {
    const result = paginatedResponse([], 0, 1, 25);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.total_pages).toBe(0);
  });
});

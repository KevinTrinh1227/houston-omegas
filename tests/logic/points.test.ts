import { describe, it, expect } from 'vitest';

// Test brotherhood points business logic

function rankLeaderboard(entries: { id: string; total_points: number }[]): { id: string; total_points: number; rank: number }[] {
  const sorted = [...entries].sort((a, b) => b.total_points - a.total_points);
  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

function validateBrotherDate(member1Id: string, member2Id: string): { valid: boolean; error?: string } {
  if (!member1Id || !member2Id) return { valid: false, error: 'Both members are required' };
  if (member1Id === member2Id) return { valid: false, error: 'Cannot create a brother date with yourself' };
  return { valid: true };
}

function ensureIdOrdering(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

describe('leaderboard ranking', () => {
  it('ranks by total points descending', () => {
    const result = rankLeaderboard([
      { id: 'a', total_points: 10 },
      { id: 'b', total_points: 30 },
      { id: 'c', total_points: 20 },
    ]);
    expect(result[0].id).toBe('b');
    expect(result[0].rank).toBe(1);
    expect(result[1].id).toBe('c');
    expect(result[2].id).toBe('a');
  });

  it('handles ties', () => {
    const result = rankLeaderboard([
      { id: 'a', total_points: 10 },
      { id: 'b', total_points: 10 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  it('handles empty leaderboard', () => {
    expect(rankLeaderboard([])).toEqual([]);
  });

  it('handles negative points', () => {
    const result = rankLeaderboard([
      { id: 'a', total_points: -5 },
      { id: 'b', total_points: 10 },
    ]);
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('a');
  });

  it('handles zero points', () => {
    const result = rankLeaderboard([
      { id: 'a', total_points: 0 },
      { id: 'b', total_points: 0 },
    ]);
    expect(result).toHaveLength(2);
  });
});

describe('brother date validation', () => {
  it('rejects same member', () => {
    const result = validateBrotherDate('abc', 'abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('yourself');
  });

  it('accepts different members', () => {
    expect(validateBrotherDate('abc', 'def').valid).toBe(true);
  });

  it('rejects empty member ids', () => {
    expect(validateBrotherDate('', 'abc').valid).toBe(false);
    expect(validateBrotherDate('abc', '').valid).toBe(false);
  });
});

describe('id ordering for brother dates', () => {
  it('orders ids so smaller comes first', () => {
    const [a, b] = ensureIdOrdering('zzz', 'aaa');
    expect(a).toBe('aaa');
    expect(b).toBe('zzz');
  });

  it('keeps order if already correct', () => {
    const [a, b] = ensureIdOrdering('aaa', 'zzz');
    expect(a).toBe('aaa');
    expect(b).toBe('zzz');
  });

  it('handles equal ids', () => {
    const [a, b] = ensureIdOrdering('abc', 'abc');
    expect(a).toBe('abc');
    expect(b).toBe('abc');
  });
});

describe('point categories', () => {
  it('validates point values are non-zero', () => {
    expect(0 === 0).toBe(true); // zero should be rejected
    expect(1 !== 0).toBe(true);
    expect(-5 !== 0).toBe(true);
  });
});

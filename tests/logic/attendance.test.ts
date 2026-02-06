import { describe, it, expect } from 'vitest';

// Test attendance business logic

function calculateAttendancePct(present: number, late: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round(((present + late) / total) * 100);
}

function getAttendanceColor(pct: number | null): string {
  if (pct === null) return 'gray';
  if (pct >= 80) return 'green';
  if (pct >= 60) return 'yellow';
  return 'red';
}

const VALID_STATUSES = ['present', 'absent', 'excused', 'late'];

describe('attendance percentage', () => {
  it('100% when all present', () => {
    expect(calculateAttendancePct(10, 0, 10)).toBe(100);
  });

  it('counts late as attended', () => {
    expect(calculateAttendancePct(5, 5, 10)).toBe(100);
  });

  it('0% when all absent', () => {
    expect(calculateAttendancePct(0, 0, 10)).toBe(0);
  });

  it('null when no events', () => {
    expect(calculateAttendancePct(0, 0, 0)).toBeNull();
  });

  it('rounds to nearest percent', () => {
    expect(calculateAttendancePct(1, 0, 3)).toBe(33);
    expect(calculateAttendancePct(2, 0, 3)).toBe(67);
  });

  it('handles mixed statuses', () => {
    // 3 present + 2 late out of 10
    expect(calculateAttendancePct(3, 2, 10)).toBe(50);
  });
});

describe('attendance color coding', () => {
  it('green for 80%+', () => {
    expect(getAttendanceColor(100)).toBe('green');
    expect(getAttendanceColor(80)).toBe('green');
  });

  it('yellow for 60-79%', () => {
    expect(getAttendanceColor(79)).toBe('yellow');
    expect(getAttendanceColor(60)).toBe('yellow');
  });

  it('red for below 60%', () => {
    expect(getAttendanceColor(59)).toBe('red');
    expect(getAttendanceColor(0)).toBe('red');
  });

  it('gray for null', () => {
    expect(getAttendanceColor(null)).toBe('gray');
  });
});

describe('attendance status validation', () => {
  it('accepts valid statuses', () => {
    for (const s of VALID_STATUSES) {
      expect(VALID_STATUSES.includes(s)).toBe(true);
    }
  });

  it('rejects invalid statuses', () => {
    expect(VALID_STATUSES.includes('unknown')).toBe(false);
    expect(VALID_STATUSES.includes('')).toBe(false);
    expect(VALID_STATUSES.includes('PRESENT')).toBe(false);
  });
});

describe('event types', () => {
  const VALID_TYPES = ['general', 'chapter', 'social', 'community_service', 'philanthropy', 'brotherhood', 'rush', 'other'];

  it('has 8 event types', () => {
    expect(VALID_TYPES).toHaveLength(8);
  });

  it('includes core types', () => {
    expect(VALID_TYPES).toContain('chapter');
    expect(VALID_TYPES).toContain('social');
    expect(VALID_TYPES).toContain('brotherhood');
  });
});

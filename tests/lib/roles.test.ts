import { describe, it, expect } from 'vitest';
import { isExecRole, EXEC_ROLES, ROLE_LABELS, ROLE_COLORS } from '../../src/lib/roles';

describe('isExecRole', () => {
  it('identifies exec roles', () => {
    expect(isExecRole('admin')).toBe(true);
    expect(isExecRole('president')).toBe(true);
    expect(isExecRole('vpi')).toBe(true);
    expect(isExecRole('vpx')).toBe(true);
    expect(isExecRole('treasurer')).toBe(true);
    expect(isExecRole('secretary')).toBe(true);
  });

  it('rejects non-exec roles', () => {
    expect(isExecRole('active')).toBe(false);
    expect(isExecRole('alumni')).toBe(false);
    expect(isExecRole('inactive')).toBe(false);
    expect(isExecRole('')).toBe(false);
    expect(isExecRole('unknown')).toBe(false);
  });
});

describe('EXEC_ROLES', () => {
  it('has exactly 6 exec roles', () => {
    expect(EXEC_ROLES).toHaveLength(6);
  });
});

describe('ROLE_LABELS', () => {
  it('has labels for all roles', () => {
    expect(ROLE_LABELS.admin).toBe('Admin');
    expect(ROLE_LABELS.president).toBe('President');
    expect(ROLE_LABELS.active).toBe('Active');
  });
});

describe('ROLE_COLORS', () => {
  it('has colors for all roles', () => {
    expect(ROLE_COLORS.admin).toContain('bg-');
    expect(ROLE_COLORS.active).toContain('bg-');
    expect(ROLE_COLORS.inactive).toContain('bg-');
  });
});

import { describe, it, expect } from 'vitest';
import { isExecRole, EXEC_ROLES, ROLE_LABELS, ROLE_COLORS, type Role } from '../../src/lib/roles';

describe('J.A. (Junior Active) role', () => {
  it('is NOT an exec role', () => {
    expect(isExecRole('junior_active')).toBe(false);
  });

  it('has a label of "J.A."', () => {
    expect(ROLE_LABELS.junior_active).toBe('J.A.');
  });

  it('has teal color styling', () => {
    expect(ROLE_COLORS.junior_active).toBe('bg-teal-100 text-teal-700');
  });

  it('is not included in EXEC_ROLES array', () => {
    expect(EXEC_ROLES).not.toContain('junior_active');
  });

  it('all 10 roles have labels', () => {
    const allRoles: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary', 'junior_active', 'active', 'alumni', 'inactive'];
    for (const role of allRoles) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_COLORS[role]).toBeTruthy();
    }
  });

  it('all 10 roles have colors with bg- prefix', () => {
    const allRoles: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary', 'junior_active', 'active', 'alumni', 'inactive'];
    for (const role of allRoles) {
      expect(ROLE_COLORS[role]).toMatch(/^bg-/);
    }
  });
});

export type Role = 'admin' | 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | 'junior_active' | 'active' | 'alumni' | 'inactive';

export const EXEC_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  president: 'President',
  vpi: 'VP Internal',
  vpx: 'VP External',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
  junior_active: 'J.A.',
  active: 'Active',
  alumni: 'Alumni',
  inactive: 'Inactive',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700',
  president: 'bg-purple-100 text-purple-700',
  vpi: 'bg-indigo-100 text-indigo-700',
  vpx: 'bg-indigo-100 text-indigo-700',
  treasurer: 'bg-amber-100 text-amber-700',
  secretary: 'bg-pink-100 text-pink-700',
  junior_active: 'bg-teal-100 text-teal-700',
  active: 'bg-green-100 text-green-700',
  alumni: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-500',
};

export function isExecRole(role: string): boolean {
  return EXEC_ROLES.includes(role as Role);
}
